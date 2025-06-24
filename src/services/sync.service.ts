import DirectusService from './directus.service';
import StripeService from './stripe.service';
import ShopifyService from './shopify.service';

export interface SyncHistory {
  id?: number;
  service: 'stripe' | 'shopify' | 'all';
  type: 'full_sync' | 'partial_sync' | 'webhook';
  status: 'started' | 'completed' | 'failed';
  details?: any;
  error?: string;
  started_at: string;
  completed_at?: string;
}

export interface EntityMapping {
  id?: number;
  entity_type: 'customer' | 'product' | 'subscription';
  local_id: number;
  stripe_id?: string;
  shopify_id?: string;
  last_synced: string;
}

export class SyncService {
  // Historial de sincronización
  static async getSyncHistory(limit: number = 50) {
    try {
      const history = await DirectusService.getItems<SyncHistory>('sync_history', {
        _limit: limit,
        _sort: '-started_at'
      });
      return history;
    } catch (error) {
      console.error('Error fetching sync history:', error);
      throw error;
    }
  }

  static async createSyncLog(data: Partial<SyncHistory>) {
    try {
      const log = await DirectusService.createItem('sync_history', {
        ...data,
        started_at: new Date().toISOString()
      });
      return log;
    } catch (error) {
      console.error('Error creating sync log:', error);
      throw error;
    }
  }

  static async updateSyncLog(id: number, data: Partial<SyncHistory>) {
    try {
      await DirectusService.updateItem('sync_history', id, {
        ...data,
        completed_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating sync log:', error);
      throw error;
    }
  }

  // Mapeo de entidades
  static async getEntityMapping(entityType: string, localId: number) {
    try {
      const mappings = await DirectusService.getItems<EntityMapping>('entity_mappings', {
        entity_type: { _eq: entityType },
        local_id: { _eq: localId }
      });
      return mappings[0] || null;
    } catch (error) {
      console.error('Error fetching entity mapping:', error);
      throw error;
    }
  }

  static async createOrUpdateMapping(data: Partial<EntityMapping>) {
    try {
      // Buscar mapeo existente
      const existing = await DirectusService.getItems<EntityMapping>('entity_mappings', {
        entity_type: { _eq: data.entity_type },
        local_id: { _eq: data.local_id }
      });

      if (existing.length > 0 && existing[0].id) {
        // Actualizar
        return await DirectusService.updateItem('entity_mappings', existing[0].id, {
          ...data,
          last_synced: new Date().toISOString()
        });
      } else {
        // Crear nuevo
        return await DirectusService.createItem('entity_mappings', {
          ...data,
          last_synced: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error creating/updating entity mapping:', error);
      throw error;
    }
  }

  // Sincronización de clientes
  static async syncCustomers() {
    const syncLog = await this.createSyncLog({
      service: 'all',
      type: 'partial_sync',
      status: 'started',
      details: { entity: 'customers' }
    });

    try {
      const results = {
        synced: 0,
        errors: [] as string[]
      };

      // Obtener todos los clientes locales
      const localCustomers = await DirectusService.getCustomers();

      for (const customer of localCustomers) {
        try {
          if (!customer.id) continue;

          // Sincronizar con Stripe si tiene stripe_customer_id
          if (customer.stripe_customer_id) {
            await StripeService.syncSubscriptionStatus(customer.stripe_customer_id);
          }

          // Actualizar mapeo
          await this.createOrUpdateMapping({
            entity_type: 'customer',
            local_id: customer.id,
            stripe_id: customer.stripe_customer_id,
            shopify_id: customer.shopify_customer_id
          });

          results.synced++;
        } catch (error: any) {
          console.error(`Error syncing customer ${customer.id}:`, error);
          results.errors.push(`Customer ${customer.id}: ${error.message}`);
        }
      }

      if (syncLog.id) {
        await this.updateSyncLog(syncLog.id, {
          status: 'completed',
          details: results
        });
      }

      return results;
    } catch (error: any) {
      if (syncLog.id) {
        await this.updateSyncLog(syncLog.id, {
          status: 'failed',
          error: error.message
        });
      }
      throw error;
    }
  }

  // Sincronización completa
  static async runFullSync() {
    const syncLog = await this.createSyncLog({
      service: 'all',
      type: 'full_sync',
      status: 'started'
    });

    try {
      const results = {
        customers: { synced: 0, errors: [] as string[] },
        stripe: { synced: 0, errors: [] as string[] },
        shopify: { synced: 0, errors: [] as string[] }
      };

      // 1. Sincronizar clientes
      try {
        const customerResults = await this.syncCustomers();
        results.customers = customerResults;
      } catch (error: any) {
        results.customers.errors.push(error.message);
      }

      // 2. Sincronizar con Shopify
      try {
        const shopifyResults = await ShopifyService.runFullSync();
        results.shopify.synced = (shopifyResults.products || 0) + (shopifyResults.customers || 0);
        results.shopify.errors = shopifyResults.errors || [];
      } catch (error: any) {
        results.shopify.errors.push(error.message);
      }

      if (syncLog.id) {
        await this.updateSyncLog(syncLog.id, {
          status: 'completed',
          details: results
        });
      }

      return results;
    } catch (error: any) {
      if (syncLog.id) {
        await this.updateSyncLog(syncLog.id, {
          status: 'failed',
          error: error.message
        });
      }
      throw error;
    }
  }

  // Verificar conflictos
  static async checkForConflicts() {
    try {
      const conflicts = {
        duplicateEmails: [] as any[],
        missingMappings: [] as any[],
        staleData: [] as any[]
      };

      // 1. Buscar clientes con emails duplicados
      const customers = await DirectusService.getCustomers();
      const emailMap = new Map<string, number[]>();
      
      customers.forEach(customer => {
        if (customer.email && customer.id) {
          if (!emailMap.has(customer.email)) {
            emailMap.set(customer.email, []);
          }
          emailMap.get(customer.email)!.push(customer.id);
        }
      });

      emailMap.forEach((ids, email) => {
        if (ids.length > 1) {
          conflicts.duplicateEmails.push({ email, customerIds: ids });
        }
      });

      // 2. Buscar clientes sin mapeos
      for (const customer of customers) {
        if (!customer.id) continue;
        
        const mapping = await this.getEntityMapping('customer', customer.id);
        if (!mapping && (customer.stripe_customer_id || customer.shopify_customer_id)) {
          conflicts.missingMappings.push({
            customerId: customer.id,
            email: customer.email,
            stripeId: customer.stripe_customer_id,
            shopifyId: customer.shopify_customer_id
          });
        }
      }

      // 3. Buscar datos desactualizados (más de 7 días sin sincronizar)
      const staleDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const mappings = await DirectusService.getItems<EntityMapping>('entity_mappings', {
        last_synced: { _lt: staleDate.toISOString() }
      });

      conflicts.staleData = mappings;

      return conflicts;
    } catch (error) {
      console.error('Error checking for conflicts:', error);
      throw error;
    }
  }

  // Resolver conflictos automáticamente
  static async resolveConflicts() {
    try {
      const conflicts = await this.checkForConflicts();
      const resolutions = {
        mergedDuplicates: 0,
        createdMappings: 0,
        refreshedStale: 0,
        errors: [] as string[]
      };

      // 1. Fusionar clientes duplicados
      for (const duplicate of conflicts.duplicateEmails) {
        try {
          // Mantener el cliente más reciente y fusionar datos
          const customersToMerge = await Promise.all(
            duplicate.customerIds.map((id: number) => DirectusService.getCustomerById(id))
          );
          
          // Ordenar por fecha de creación (más reciente primero)
          customersToMerge.sort((a, b) => {
            const dateA = new Date(a.date_created || 0).getTime();
            const dateB = new Date(b.date_created || 0).getTime();
            return dateB - dateA;
          });

          const keepCustomer = customersToMerge[0];
          const mergeCustomers = customersToMerge.slice(1);

          // Fusionar datos
          for (const mergeCustomer of mergeCustomers) {
            if (!keepCustomer.stripe_customer_id && mergeCustomer.stripe_customer_id) {
              keepCustomer.stripe_customer_id = mergeCustomer.stripe_customer_id;
            }
            if (!keepCustomer.shopify_customer_id && mergeCustomer.shopify_customer_id) {
              keepCustomer.shopify_customer_id = mergeCustomer.shopify_customer_id;
            }
            
            // TODO: Reasignar suscripciones y evaluaciones al cliente principal
            
            // Eliminar cliente duplicado
            if (mergeCustomer.id) {
              await DirectusService.deleteItem('new_customers', mergeCustomer.id);
            }
          }

          // Actualizar cliente principal
          if (keepCustomer.id) {
            await DirectusService.updateCustomer(keepCustomer.id, {
              stripe_customer_id: keepCustomer.stripe_customer_id,
              shopify_customer_id: keepCustomer.shopify_customer_id
            });
          }

          resolutions.mergedDuplicates++;
        } catch (error: any) {
          resolutions.errors.push(`Error merging duplicate ${duplicate.email}: ${error.message}`);
        }
      }

      // 2. Crear mapeos faltantes
      for (const missing of conflicts.missingMappings) {
        try {
          await this.createOrUpdateMapping({
            entity_type: 'customer',
            local_id: missing.customerId,
            stripe_id: missing.stripeId,
            shopify_id: missing.shopifyId
          });
          resolutions.createdMappings++;
        } catch (error: any) {
          resolutions.errors.push(`Error creating mapping for customer ${missing.customerId}: ${error.message}`);
        }
      }

      // 3. Actualizar datos desactualizados
      for (const stale of conflicts.staleData) {
        try {
          if (stale.entity_type === 'customer' && stale.local_id) {
            await this.syncCustomers();
            resolutions.refreshedStale++;
          }
        } catch (error: any) {
          resolutions.errors.push(`Error refreshing stale data ${stale.id}: ${error.message}`);
        }
      }

      return resolutions;
    } catch (error) {
      console.error('Error resolving conflicts:', error);
      throw error;
    }
  }

  // Programar sincronizaciones automáticas
  static scheduleAutoSync(intervalMinutes: number = 60) {
    console.log(`Scheduling auto-sync every ${intervalMinutes} minutes`);
    
    // Ejecutar sincronización inmediatamente
    this.runFullSync().catch(console.error);
    
    // Programar sincronizaciones futuras
    setInterval(async () => {
      try {
        console.log('Running scheduled sync...');
        await this.runFullSync();
      } catch (error) {
        console.error('Scheduled sync failed:', error);
      }
    }, intervalMinutes * 60 * 1000);
  }
}

export default SyncService;
