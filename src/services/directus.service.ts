import { createDirectus, rest, authentication, createItem, readItems, updateItem, deleteItem } from '@directus/sdk';

// Configuración de Directus
// En desarrollo, usa el proxy de Vite. En producción, usa el proxy de Vercel
const isDevelopment = import.meta.env.DEV;
const DIRECTUS_URL = isDevelopment 
  ? window.location.origin + import.meta.env.VITE_DIRECTUS_API_BASE 
  : window.location.origin + '/api/directus';
const DIRECTUS_TOKEN = import.meta.env.VITE_DIRECTUS_TOKEN;

console.log('Directus Config:', {
  isDevelopment,
  url: DIRECTUS_URL,
  hasToken: !!DIRECTUS_TOKEN
});

// Tipos base para las tablas - ACTUALIZADOS según estructura real
export interface DirectusBaseItem {
  id?: string | number;
  created_at?: string;
  updated_at?: string;
}

// Interfaces actualizadas según la estructura real de la BD
export interface NewCustomer extends DirectusBaseItem {
  id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  type?: string;
  vip?: boolean;
  credit_limit?: number;
  notes?: string;
}

export interface Subscription extends DirectusBaseItem {
  id?: string;
  customer_id?: string;
  plan: string;
  status: string;
  pricing: {
    amount?: number;
    currency?: string;
    interval?: string;
  };
  billing: {
    next_payment?: string;
    last_payment?: string;
    method?: string;
  };
  services?: {
    cleanings?: number;
    inspections?: number;
    protection?: boolean;
    trade_in?: boolean;
  };
  credits?: {
    cleanings_used?: number;
    inspections_used?: number;
  };
  start_date: string;
  cancelled_at?: string;
  paused_at?: string;
  cancel_reason?: string;
  sold_by?: string;
}

export interface Evaluation extends DirectusBaseItem {
  id?: string;
  customer_id: string;
  mattress: {
    brand?: string;
    model?: string;
    age?: number;
    condition?: string;
    size?: string;
  };
  photos?: any;
  ai_evaluation?: any;
  credit_approved?: number;
  status: string;
  employee_id?: string;
  store_id?: string;
  coupon_code?: string;
  shopify_price_rule_id?: string;
  shopify_discount_code_id?: string;
  customer_info?: any;
  expires_at?: string;
  redeemed_at?: string;
}

// STRIPE - Interfaces actualizadas según estructura real de BD
export interface StripeConfig extends DirectusBaseItem {
  id?: string;
  publishable_key?: string;
  secret_key?: string;
  webhook_secret?: string;
  test_secret_key?: string;
  test_webhook_secret?: string;
  live_secret_key?: string;
  live_webhook_secret?: string;
  mode?: string; // 'test' | 'live'
  active?: boolean;
}

export interface StripePaymentLink extends DirectusBaseItem {
  id?: string; // UUID
  stripe_payment_link_id?: string;
  customer_id?: string; // UUID
  customer_email?: string;
  product_name: string;
  description?: string;
  amount: number;
  currency?: string;
  status?: string;
  type?: string;
  url?: string;
  metadata?: any;
  settings?: any;
  created_by?: string; // UUID
  expires_at?: string;
  completed_at?: string;
}

export interface StripeSubscription extends DirectusBaseItem {
  id?: string; // UUID
  stripe_subscription_id?: string;
  customer_id?: string; // UUID
  stripe_customer_id?: string;
  stripe_price_id?: string;
  stripe_product_id?: string;
  status?: string;
  plan: string;
  interval: string;
  interval_count?: number;
  amount: number;
  currency?: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  canceled_at?: string;
  trial_start?: string;
  trial_end?: string;
  metadata?: any;
  created_by?: string; // UUID
}

// SHOPIFY - Interfaces actualizadas según estructura real de BD
export interface ShopifySettings extends DirectusBaseItem {
  id?: string;
  store_name: string;
  shopify_domain: string;
  api_key?: string;
  api_secret_key?: string;
  access_token?: string;
  webhook_api_version?: string;
  is_active?: boolean;
  last_sync?: string;
  sync_settings?: any;
  shop_domain?: string; // Campo adicional
  api_secret?: string; // Campo adicional
  webhook_secret?: string;
  active?: boolean; // Campo adicional
}

export interface ShopifyProduct extends DirectusBaseItem {
  id?: string;
  shopify_id?: string; // Cambiado de shopify_product_id
  title: string;
  body_html?: string;
  vendor?: string;
  product_type?: string;
  tags?: string;
  status?: string;
  variants?: any;
  options?: any;
  images?: any;
  image_url?: string;
}

export interface ShopifyCoupon extends DirectusBaseItem {
  id?: string;
  code: string;
  description?: string;
  discount_type?: string;
  discount_value?: number;
  minimum_amount?: number;
  usage_limit?: number;
  usage_count?: number;
  expires_at?: string;
  active?: boolean;
}

export interface ShopifyCustomer extends DirectusBaseItem {
  id?: string;
  shopify_customer_id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  tags?: string;
  total_spent?: number;
  orders_count?: number;
  accepts_marketing?: boolean;
  marketing_opt_in_level?: string;
}

// Schema de Directus actualizado
type DirectusSchema = {
  new_customers: NewCustomer[];
  subscriptions: Subscription[];
  evaluations: Evaluation[];
  stripe_config: StripeConfig[];
  stripe_payment_links: StripePaymentLink[];
  stripe_subscriptions: StripeSubscription[];
  stripe_webhooks: any[];
  shopify_settings: ShopifySettings[];
  shopify_products: ShopifyProduct[];
  shopify_customers: ShopifyCustomer[];
  shopify_coupons: ShopifyCoupon[];
  sync_history: any[];
  entity_mappings: any[];
};

// Crear instancia de Directus
const directus = createDirectus<DirectusSchema>(DIRECTUS_URL)
  .with(authentication('static', { token: DIRECTUS_TOKEN }))
  .with(rest());

// Servicio principal de Directus
export class DirectusService {
  // Métodos para Clientes
  static async getCustomers(filter?: any) {
    try {
      const params: any = {
        sort: ['-created_at'],
        limit: -1
      };
      
      // Solo agregar filter si existe
      if (filter && Object.keys(filter).length > 0) {
        params.filter = filter;
      }
      
      const customers = await directus.request(
        readItems('new_customers', params)
      );
      return customers;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  static async getCustomerById(id: number) {
    try {
      const customers = await directus.request(
        readItems('new_customers', {
          filter: { id: { _eq: id } },
          limit: 1
        })
      );
      return customers[0];
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  }

  static async createCustomer(data: Partial<NewCustomer>) {
    try {
      const customer = await directus.request(
        createItem('new_customers', data)
      );
      return customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  static async updateCustomer(id: number, data: Partial<NewCustomer>) {
    try {
      const customer = await directus.request(
        updateItem('new_customers', id, data)
      );
      return customer;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  // Métodos para Suscripciones
  static async getSubscriptions(filter?: any) {
    try {
      const params: any = {
        sort: ['-created_at'],
        limit: -1
      };
      
      // Solo agregar filter si existe
      if (filter && Object.keys(filter).length > 0) {
        params.filter = filter;
      }
      
      const subscriptions = await directus.request(
        readItems('subscriptions', params)
      );
      return subscriptions;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  }

  static async getSubscriptionById(id: string) {
    try {
      const subscriptions = await directus.request(
        readItems('subscriptions', {
          filter: { id: { _eq: id } },
          limit: 1
        })
      );
      return subscriptions[0];
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  }

  static async createSubscription(data: Partial<Subscription>) {
    try {
      // Generar ID único si no existe
      if (!data.id) {
        data.id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      const subscription = await directus.request(
        createItem('subscriptions', data)
      );
      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  static async updateSubscription(id: string, data: Partial<Subscription>) {
    try {
      const subscription = await directus.request(
        updateItem('subscriptions', id, data)
      );
      return subscription;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  // Métodos para Evaluaciones Trade-In
  static async getEvaluations(filter?: any) {
    try {
      const params: any = {
        sort: ['-created_at'],
        limit: -1
      };
      
      // Solo agregar filter si existe
      if (filter && Object.keys(filter).length > 0) {
        params.filter = filter;
      }
      
      const evaluations = await directus.request(
        readItems('evaluations', params)
      );
      return evaluations;
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      throw error;
    }
  }

  static async createEvaluation(data: Partial<Evaluation>) {
    try {
      // Generar ID único si no existe
      if (!data.id) {
        data.id = `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      const evaluation = await directus.request(
        createItem('evaluations', data)
      );
      return evaluation;
    } catch (error) {
      console.error('Error creating evaluation:', error);
      throw error;
    }
  }

  static async updateEvaluation(id: string, data: Partial<Evaluation>) {
    try {
      const evaluation = await directus.request(
        updateItem('evaluations', id, data)
      );
      return evaluation;
    } catch (error) {
      console.error('Error updating evaluation:', error);
      throw error;
    }
  }

  // Métodos genéricos para otras tablas
  static async getItems<T>(collection: keyof DirectusSchema, filter?: any) {
    try {
      const params: any = {
        sort: ['-created_at'],
        limit: -1
      };
      
      // Solo agregar filter si existe
      if (filter && Object.keys(filter).length > 0) {
        params.filter = filter;
      }
      
      const items = await directus.request(
        readItems(collection, params)
      );
      return items as T[];
    } catch (error) {
      console.error(`Error fetching ${collection}:`, error);
      throw error;
    }
  }

  static async createItem<T>(collection: keyof DirectusSchema, data: any) {
    try {
      const item = await directus.request(
        createItem(collection, data)
      );
      return item as T;
    } catch (error) {
      console.error(`Error creating ${collection}:`, error);
      throw error;
    }
  }

  static async updateItem<T>(collection: keyof DirectusSchema, id: string | number, data: any) {
    try {
      const item = await directus.request(
        updateItem(collection, id, data)
      );
      return item as T;
    } catch (error) {
      console.error(`Error updating ${collection}:`, error);
      throw error;
    }
  }

  static async deleteItem(collection: keyof DirectusSchema, id: string | number) {
    try {
      await directus.request(
        deleteItem(collection, id)
      );
      return true;
    } catch (error) {
      console.error(`Error deleting ${collection}:`, error);
      throw error;
    }
  }
}

export default DirectusService;
