import DirectusService, { ShopifySettings, ShopifyProduct, ShopifyCoupon } from './directus.service';

export class ShopifyService {
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
        created_at: new Date().toISOString()
      });
      
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
          shopify_product_id: product.id.toString(),
          title: product.title,
          handle: product.handle,
          product_type: product.product_type,
          vendor: product.vendor,
          tags: product.tags,
          status: product.status,
          variants: product.variants,
          images: product.images,
          price: product.variants?.[0]?.price ? parseFloat(product.variants[0].price) : 0,
          compare_at_price: product.variants?.[0]?.compare_at_price ? parseFloat(product.variants[0].compare_at_price) : undefined,
          inventory_quantity: product.variants?.[0]?.inventory_quantity
        };

        // Verificar si el producto ya existe
        const existing = await DirectusService.getItems<ShopifyProduct>('shopify_products', {
          shopify_product_id: { _eq: productData.shopify_product_id }
        });

        if (existing.length > 0 && existing[0].id) {
          // Actualizar
          const updated = await DirectusService.updateItem('shopify_products', existing[0].id, productData);
          results.push(updated);
        } else {
          // Crear nuevo con ID único
          const created = await DirectusService.createItem('shopify_products', {
            id: `shopify_prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...productData
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
      const customers = await DirectusService.getItems<any>('shopify_customers', filter);
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
        const customerData = {
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
        const existing = await DirectusService.getItems<any>('shopify_customers', {
          shopify_customer_id: { _eq: customerData.shopify_customer_id }
        });

        if (existing.length > 0 && existing[0].id) {
          // Actualizar
          const updated = await DirectusService.updateItem('shopify_customers', existing[0].id, customerData);
          results.push(updated);
        } else {
          // Crear nuevo
          const created = await DirectusService.createItem('shopify_customers', customerData);
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

  private static async syncWithLocalCustomer(shopifyCustomer: any) {
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
        value: creditAmount,
        value_type: 'fixed_amount',
        usage_count: 0,
        usage_limit: 1,
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 días
        active: true,
        customer_id: customerId,
        evaluation_id: evaluationId,
        created_for: 'trade_in'
      };

      const coupon = await DirectusService.createItem('shopify_coupons', couponData);

      // Actualizar evaluación con el código del cupón
      await DirectusService.updateEvaluation(evaluationId, {
        coupon_code: code,
        status: 'approved',
        expires_at: couponData.ends_at
      });

      // TODO: Llamar a la API de Shopify para crear el Price Rule y Discount Code
      // Este es un placeholder - necesitarás implementar la llamada real a la API de Shopify
      console.log('TODO: Create coupon in Shopify API', {
        priceRule: {
          title: `Trade-In Credit - ${code}`,
          target_type: 'line_item',
          target_selection: 'all',
          allocation_method: 'across',
          value_type: 'fixed_amount',
          value: `-${creditAmount}`,
          customer_selection: 'all',
          once_per_customer: true,
          usage_limit: 1,
          starts_at: couponData.starts_at,
          ends_at: couponData.ends_at
        },
        discountCode: {
          code: code
        }
      });

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
          active: isStillActive
        });

        // Si es un cupón de Trade-In y se ha usado, actualizar la evaluación
        if (coupon.evaluation_id) {
          await DirectusService.updateEvaluation(coupon.evaluation_id, {
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

      // TODO: Implementar llamadas reales a la API de Shopify
      // Este es un placeholder
      console.log('TODO: Implement actual Shopify API calls for sync');

      // Registrar sincronización
      await DirectusService.createItem('sync_history', {
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
