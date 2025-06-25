import { createDirectus, rest, authentication, staticToken } from '@directus/sdk';

// Configuración de Directus con el token estático proporcionado
const DIRECTUS_URL = 'https://admin-api-directus.dqyvuv.easypanel.host';
const DIRECTUS_TOKEN = 'mcp_414xdh4vq47mcao0jg2';

// Definir tipos para las colecciones principales
interface StripeConfig {
  id: string;
  api_key_test: string;
  api_key_live: string;
  webhook_secret_test?: string;
  webhook_secret_live?: string;
  mode: 'test' | 'live';
  created_at?: string;
  updated_at?: string;
}

interface ShopifySettings {
  id: string;
  store_domain: string;
  api_key: string;
  api_secret: string;
  access_token: string;
  webhook_secret?: string;
  created_at?: string;
  updated_at?: string;
}

interface NewCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  customer_type: 'individual' | 'business';
  is_vip: boolean;
  credit_limit?: number;
  stripe_customer_id?: string;
  shopify_customer_id?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

interface Subscription {
  id: string;
  customer_id: string;
  plan_type: 'basic' | 'premium' | 'elite';
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  price_monthly: number;
  start_date: string;
  end_date?: string;
  stripe_subscription_id?: string;
  services_included: {
    cleanings_per_year: number;
    protection_level: string;
    inspections_per_year: number;
    trade_in_eligible: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

interface Evaluation {
  id: string;
  customer_id: string;
  customer?: NewCustomer;
  mattress_brand: string;
  mattress_model: string;
  purchase_date?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  approved_credit: number;
  status: 'pending' | 'approved' | 'rejected' | 'used';
  coupon_code?: string;
  shopify_price_rule_id?: string;
  evaluation_date: string;
  expiry_date: string;
  notes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

// Crear instancia de Directus con autenticación estática
export const directus = createDirectus(DIRECTUS_URL)
  .with(staticToken(DIRECTUS_TOKEN))
  .with(rest());

// Servicio mejorado para Directus
export class DirectusService {
  // Métodos para Stripe Config
  static async getStripeConfig() {
    try {
      const response = await directus.request(
        rest.readItems('stripe_config', {
          limit: 1,
          sort: ['-created_at']
        })
      );
      return response[0] || null;
    } catch (error) {
      console.error('Error fetching Stripe config:', error);
      throw error;
    }
  }

  static async saveStripeConfig(config: Partial<StripeConfig>) {
    try {
      const existing = await this.getStripeConfig();
      
      if (existing) {
        return await directus.request(
          rest.updateItem('stripe_config', existing.id, config)
        );
      } else {
        return await directus.request(
          rest.createItem('stripe_config', config)
        );
      }
    } catch (error) {
      console.error('Error saving Stripe config:', error);
      throw error;
    }
  }

  // Métodos para Shopify Settings
  static async getShopifySettings() {
    try {
      const response = await directus.request(
        rest.readItems('shopify_settings', {
          limit: 1,
          sort: ['-created_at']
        })
      );
      return response[0] || null;
    } catch (error) {
      console.error('Error fetching Shopify settings:', error);
      throw error;
    }
  }

  static async saveShopifySettings(settings: Partial<ShopifySettings>) {
    try {
      const existing = await this.getShopifySettings();
      
      if (existing) {
        return await directus.request(
          rest.updateItem('shopify_settings', existing.id, settings)
        );
      } else {
        return await directus.request(
          rest.createItem('shopify_settings', settings)
        );
      }
    } catch (error) {
      console.error('Error saving Shopify settings:', error);
      throw error;
    }
  }

  // Métodos para Customers
  static async getCustomers(params?: {
    filter?: any;
    sort?: string[];
    limit?: number;
    offset?: number;
    search?: string;
  }) {
    try {
      return await directus.request(
        rest.readItems('new_customers', params)
      );
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  static async getCustomer(id: string) {
    try {
      return await directus.request(
        rest.readItem('new_customers', id)
      );
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  }

  static async createCustomer(customer: Partial<NewCustomer>) {
    try {
      return await directus.request(
        rest.createItem('new_customers', customer)
      );
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  static async updateCustomer(id: string, customer: Partial<NewCustomer>) {
    try {
      return await directus.request(
        rest.updateItem('new_customers', id, customer)
      );
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  // Métodos para Subscriptions
  static async getSubscriptions(params?: {
    filter?: any;
    sort?: string[];
    limit?: number;
    offset?: number;
  }) {
    try {
      return await directus.request(
        rest.readItems('subscriptions', {
          ...params,
          fields: ['*', 'customer_id.*'] // Include customer relation
        })
      );
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  }

  static async createSubscription(subscription: Partial<Subscription>) {
    try {
      return await directus.request(
        rest.createItem('subscriptions', subscription)
      );
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  static async updateSubscription(id: string, subscription: Partial<Subscription>) {
    try {
      return await directus.request(
        rest.updateItem('subscriptions', id, subscription)
      );
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  // Métodos para Trade-In Evaluations
  static async getEvaluations(params?: {
    filter?: any;
    sort?: string[];
    limit?: number;
    offset?: number;
  }) {
    try {
      return await directus.request(
        rest.readItems('evaluations', {
          ...params,
          fields: ['*', 'customer_id.*'] // Include customer relation
        })
      );
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      throw error;
    }
  }

  static async createEvaluation(evaluation: Partial<Evaluation>) {
    try {
      return await directus.request(
        rest.createItem('evaluations', evaluation)
      );
    } catch (error) {
      console.error('Error creating evaluation:', error);
      throw error;
    }
  }

  static async updateEvaluation(id: string, evaluation: Partial<Evaluation>) {
    try {
      return await directus.request(
        rest.updateItem('evaluations', id, evaluation)
      );
    } catch (error) {
      console.error('Error updating evaluation:', error);
      throw error;
    }
  }

  static async approveEvaluation(id: string, creditAmount: number) {
    try {
      const evaluation = await directus.request(
        rest.readItem('evaluations', id, {
          fields: ['*', 'customer_id.*']
        })
      );

      if (!evaluation) {
        throw new Error('Evaluation not found');
      }

      // Generate coupon code
      const couponCode = `TRADEIN-${Date.now().toString(36).toUpperCase()}`;
      
      // Calculate expiry date (90 days from now)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 90);

      // Update evaluation
      const updatedEvaluation = await this.updateEvaluation(id, {
        status: 'approved',
        approved_credit: creditAmount,
        coupon_code: couponCode,
        expiry_date: expiryDate.toISOString()
      });

      // TODO: Create Shopify price rule and discount code
      // This would be handled by the ShopifyService

      return updatedEvaluation;
    } catch (error) {
      console.error('Error approving evaluation:', error);
      throw error;
    }
  }

  // Métodos para Sync History
  static async createSyncRecord(record: {
    sync_type: 'stripe' | 'shopify' | 'full';
    status: 'started' | 'completed' | 'failed';
    details?: any;
    error?: string;
  }) {
    try {
      return await directus.request(
        rest.createItem('sync_history', {
          ...record,
          sync_date: new Date().toISOString()
        })
      );
    } catch (error) {
      console.error('Error creating sync record:', error);
      throw error;
    }
  }

  static async getSyncHistory(limit: number = 10) {
    try {
      return await directus.request(
        rest.readItems('sync_history', {
          limit,
          sort: ['-sync_date']
        })
      );
    } catch (error) {
      console.error('Error fetching sync history:', error);
      throw error;
    }
  }
}

export default DirectusService;
