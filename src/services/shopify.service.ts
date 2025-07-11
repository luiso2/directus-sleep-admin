import DirectusService, { ShopifySettings, ShopifyProduct, ShopifyCoupon, ShopifyCustomer } from './directus.service';
import ShopifyAPIClient from './shopify/shopify-api-client';

export class ShopifyService {
  private static apiClient: ShopifyAPIClient | null = null;

  // Obtener cliente de API configurado
  private static async getAPIClient(): Promise<ShopifyAPIClient> {
    if (!this.apiClient) {
      const settings = await this.getSettings();
      if (!settings) {
        throw new Error('Shopify settings not configured');
      }

      this.apiClient = new ShopifyAPIClient({
        shopDomain: settings.shopify_domain || settings.shop_domain || '',
        apiKey: settings.api_key || '',
        apiSecret: settings.api_secret_key || settings.api_secret || '',
        accessToken: settings.access_token || ''
      });
    }
    return this.apiClient;
  }

  // Resetear cliente cuando se actualiza la configuración
  private static resetAPIClient() {
    this.apiClient = null;
  }
  
  // Configuración de Shopify
  static async getSettings(): Promise<ShopifySettings | null> {
    try {
      const settings = await DirectusService.getItems<ShopifySettings>('shopify_settings', {
        active: { _eq: true }
      });
      return settings[0] || null;
    } catch (error) {
      console.error('Error fetching Shopify settings:', error);
      throw error;
    }
  }

  static async saveSettings(settings: Partial<ShopifySettings>) {
    try {
      // Intentar desactivar configuraciones anteriores (si tenemos permisos)
      try {
        const existingSettings = await DirectusService.getItems<ShopifySettings>('shopify_settings', {
          active: { _eq: true }
        });
        
        // Solo actualizar si encontramos configuraciones activas
        for (const existing of existingSettings) {
          if (existing.id) {
            await DirectusService.updateItem('shopify_settings', existing.id, { active: false });
          }
        }
      } catch (error) {
        // Si no podemos leer las configuraciones existentes, continuamos
        console.log('Could not read existing settings, continuing with creation');
      }

      // Crear nueva configuración activa con ID único
      const newSettings = await DirectusService.createItem('shopify_settings', {
        id: `shopify_config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...settings,
        active: true,
        is_active: true,
        created_at: new Date().toISOString()
      });
      
      // Resetear cliente de API para que use la nueva configuración
      this.resetAPIClient();
      
      return newSettings;
    } catch (error) {
      console.error('Error saving Shopify settings:', error);
      throw error;
    }
  }

  // Productos
  static async getProducts(filter?: any) {
    try {
      const products = await DirectusService.getItems<ShopifyProduct>('shopify_products', filter);
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  static async syncProducts(products: any[]) {
    try {
      const results = [];
      
      for (const product of products) {
        const productData: Partial<ShopifyProduct> = {
          shopify_id: product.id.toString(),
          title: product.title,
          body_html: product.body_html,
          product_type: product.product_type,
          vendor: product.vendor,
          tags: product.tags,
          status: product.status,
          variants: product.variants,
          options: product.options,
          images: product.images,
          image_url: product.images?.[0]?.src || null
        };

        // Verificar si el producto ya existe
        const existing = await DirectusService.getItems<ShopifyProduct>('shopify_products', {
          shopify_id: { _eq: productData.shopify_id }
        });

        if (existing.length > 0 && existing[0].id) {
          // Actualizar
          const updated = await DirectusService.updateItem('shopify_products', existing[0].id, productData);
          results.push(updated);
        } else {
          // Crear nuevo con ID único
          const created = await DirectusService.createItem('shopify_products', {
            id: `shopify_prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...productData,
            created_at: new Date().toISOString()
          });
          results.push(created);
        }
      }

      // Actualizar última sincronización
      const settings = await this.getSettings();
      if (settings?.id) {
        await DirectusService.updateItem('shopify_settings', settings.id, {
          last_sync: new Date().toISOString()
        });
      }

      return results;
    } catch (error) {
      console.error('Error syncing products:', error);
      throw error;
    }
  }

  // Clientes de Shopify
  static async getCustomers(filter?: any) {
    try {
      const customers = await DirectusService.getItems<ShopifyCustomer>('shopify_customers', filter);
      return customers;
    } catch (error) {
      console.error('Error fetching Shopify customers:', error);
      throw error;
    }
  }

  static async syncCustomers(customers: any[]) {
    try {
      const results = [];
      
      for (const customer of customers) {
        const customerData: Partial<ShopifyCustomer> = {
          shopify_customer_id: customer.id.toString(),
          email: customer.email,
          first_name: customer.first_name,
          last_name: customer.last_name,
          phone: customer.phone,
          tags: customer.tags,
          total_spent: customer.total_spent ? parseFloat(customer.total_spent) : 0,
          orders_count: customer.orders_count,
          accepts_marketing: customer.accepts_marketing,
          marketing_opt_in_level: customer.marketing_opt_in_level,
          created_at: customer.created_at,
          updated_at: customer.updated_at
        };

        // Verificar si el cliente ya existe
        const existing = await DirectusService.getItems<ShopifyCustomer>('shopify_customers', {
          shopify_customer_id: { _eq: customerData.shopify_customer_id }
        });

        if (existing.length > 0 && existing[0].id) {
          // Actualizar
          const updated = await DirectusService.updateItem('shopify_customers', existing[0].id, customerData);
          results.push(updated);
        } else {
          // Crear nuevo con ID único
          const created = await DirectusService.createItem('shopify_customers', {
            id: `shopify_cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...customerData
          });
          results.push(created);
        }

        // Sincronizar con clientes locales
        await this.syncWithLocalCustomer(customerData);
      }

      return results;
    } catch (error) {
      console.error('Error syncing customers:', error);
      throw error;
    }
  }

  private static async syncWithLocalCustomer(shopifyCustomer: Partial<ShopifyCustomer>) {
    try {
      // Buscar cliente local por email
      const localCustomers = await DirectusService.getCustomers({
        email: { _eq: shopifyCustomer.email }
      });

      if (localCustomers.length > 0 && localCustomers[0].id) {
        // Actualizar con información de Shopify
        await DirectusService.updateCustomer(localCustomers[0].id, {
          first_name: shopifyCustomer.first_name,
          last_name: shopifyCustomer.last_name,
          phone: shopifyCustomer.phone,
          type: 'shopify'
        });
      } else {
        // Crear nuevo cliente local
        await DirectusService.createCustomer({
          email: shopifyCustomer.email,
          first_name: shopifyCustomer.first_name,
          last_name: shopifyCustomer.last_name,
          phone: shopifyCustomer.phone,
          type: 'shopify'
        });
      }
    } catch (error) {
      console.error('Error syncing with local customer:', error);
      // No lanzar error para no interrumpir la sincronización
    }
  }

  // Cupones y Descuentos
  static async getCoupons(filter?: any) {
    try {
      const coupons = await DirectusService.getItems<ShopifyCoupon>('shopify_coupons', filter);
      return coupons;
    } catch (error) {
      console.error('Error fetching coupons:', error);
      throw error;
    }
  }

  static async createTradeInCoupon(evaluationId: string, customerId: string, creditAmount: number) {
    try {
      const evaluation = await DirectusService.getItems<any>('evaluations', {
        id: { _eq: evaluationId }
      });

      if (!evaluation || evaluation.length === 0) {
        throw new Error('Evaluation not found');
      }

      // Generar código único
      const code = `TRADEIN-${evaluationId.substring(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

      // Crear cupón en la base de datos con ID único
      const couponData: Partial<ShopifyCoupon> = {
        id: `coupon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        code: code,
        discount_value: creditAmount,
        discount_type: 'fixed_amount',
        usage_count: 0,
        usage_limit: 1,
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 días
        active: true,
        description: `Trade-In Credit for evaluation ${evaluationId}`,
        created_at: new Date().toISOString()
      };

      const coupon = await DirectusService.createItem('shopify_coupons', couponData);

      // Actualizar evaluación con el código del cupón
      await DirectusService.updateEvaluation(evaluationId, {
        coupon_code: code,
        status: 'approved',
        expires_at: couponData.expires_at
      });

      // Llamar a la API de Shopify para crear el Price Rule y Discount Code
      try {
        const apiClient = await this.getAPIClient();
        const { priceRule, discountCode } = await apiClient.createCoupon(
          `Trade-In Credit - ${code}`,
          code,
          creditAmount,
          'fixed_amount',
          {
            usageLimit: 1,
            oncePerCustomer: true,
            startsAt: new Date().toISOString(),
            endsAt: couponData.expires_at
          }
        );

        // Actualizar el cupón con los IDs de Shopify (si el API devuelve estos campos)
        if (priceRule.id && discountCode.id) {
          await DirectusService.updateItem('shopify_coupons', coupon.id, {
            updated_at: new Date().toISOString()
          });
        }
      } catch (shopifyError) {
        console.error('Error creating coupon in Shopify:', shopifyError);
        // No lanzar error para no interrumpir el flujo, pero registrar el problema
        await DirectusService.updateItem('shopify_coupons', coupon.id, {
          description: couponData.description + ` - Sync Error: ${shopifyError instanceof Error ? shopifyError.message : 'Unknown error'}`
        });
      }

      return coupon;
    } catch (error) {
      console.error('Error creating Trade-In coupon:', error);
      throw error;
    }
  }

  static async updateCouponUsage(code: string) {
    try {
      const coupons = await DirectusService.getItems<ShopifyCoupon>('shopify_coupons', {
        code: { _eq: code }
      });

      if (coupons.length > 0 && coupons[0].id) {
        const coupon = coupons[0];
        const newUsageCount = (coupon.usage_count || 0) + 1;
        const isStillActive = coupon.usage_limit ? newUsageCount < coupon.usage_limit : true;

        await DirectusService.updateItem('shopify_coupons', coupon.id, {
          usage_count: newUsageCount,
          active: isStillActive,
          updated_at: new Date().toISOString()
        });

        // Si es un cupón de Trade-In y se ha usado, actualizar la evaluación
        // Buscar evaluación por código de cupón
        const evaluations = await DirectusService.getEvaluations({
          coupon_code: { _eq: code }
        });

        if (evaluations.length > 0 && evaluations[0].id) {
          await DirectusService.updateEvaluation(evaluations[0].id, {
            status: 'redeemed',
            redeemed_at: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error updating coupon usage:', error);
      throw error;
    }
  }

  // Webhooks
  static async processWebhook(topic: string, data: any) {
    try {
      switch (topic) {
        case 'products/create':
        case 'products/update':
          await this.syncProducts([data]);
          break;
          
        case 'customers/create':
        case 'customers/update':
          await this.syncCustomers([data]);
          break;
          
        case 'orders/create':
          await this.handleOrderCreated(data);
          break;
          
        case 'orders/updated':
          await this.handleOrderUpdated(data);
          break;
          
        default:
          console.log(`Unhandled webhook topic: ${topic}`);
      }
    } catch (error) {
      console.error('Error processing Shopify webhook:', error);
      throw error;
    }
  }

  private static async handleOrderCreated(order: any) {
    try {
      // Verificar si se usó algún cupón
      if (order.discount_codes && order.discount_codes.length > 0) {
        for (const discount of order.discount_codes) {
          await this.updateCouponUsage(discount.code);
        }
      }

      // TODO: Implementar lógica adicional para órdenes
      console.log('Order created:', order.id);
    } catch (error) {
      console.error('Error handling order created:', error);
      throw error;
    }
  }

  private static async handleOrderUpdated(order: any) {
    try {
      // TODO: Implementar lógica para órdenes actualizadas
      console.log('Order updated:', order.id);
    } catch (error) {
      console.error('Error handling order updated:', error);
      throw error;
    }
  }

  // Sincronización
  static async runFullSync() {
    try {
      const results = {
        products: 0,
        customers: 0,
        errors: [] as string[]
      };

      const settings = await this.getSettings();
      if (!settings) {
        throw new Error('Shopify settings not configured');
      }

      // Implementar llamadas reales a la API de Shopify
      const apiClient = await this.getAPIClient();
      
      try {
        // Sincronizar productos
        console.log('Fetching products from Shopify...');
        const products = await apiClient.getProducts();
        const syncedProducts = await this.syncProducts(products);
        results.products = syncedProducts.length;
      } catch (error) {
        console.error('Error syncing products:', error);
        results.errors.push(`Products sync error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      try {
        // Sincronizar clientes
        console.log('Fetching customers from Shopify...');
        const customers = await apiClient.getCustomers();
        const syncedCustomers = await this.syncCustomers(customers);
        results.customers = syncedCustomers.length;
      } catch (error) {
        console.error('Error syncing customers:', error);
        results.errors.push(`Customers sync error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Registrar sincronización
      await DirectusService.createItem('sync_history', {
        id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        service: 'shopify',
        type: 'full_sync',
        status: 'completed',
        details: results,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      });

      return results;
    } catch (error: any) {
      console.error('Error running full sync:', error);
      
      // Registrar error
      await DirectusService.createItem('sync_history', {
        id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        service: 'shopify',
        type: 'full_sync',
        status: 'failed',
        error: error.message,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      });
      
      throw error;
    }
  }
}

export default ShopifyService;
