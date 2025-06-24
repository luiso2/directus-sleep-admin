import { createDirectus, rest, authentication, createItem, readItems, updateItem, deleteItem } from '@directus/sdk';

// Configuración de Directus
const DIRECTUS_URL = 'https://admin-api-directus.dqyvuv.easypanel.host';
const DIRECTUS_TOKEN = 'mcp_414xdh4vq47mcao0jg2';

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

export interface StripeConfig extends DirectusBaseItem {
  id?: string;
  publishable_key?: string;
  secret_key?: string;
  webhook_secret?: string;
  active?: boolean;
}

export interface StripePaymentLink extends DirectusBaseItem {
  id?: string;
  stripe_payment_link_id?: string;
  customer_id?: string;
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
  created_by?: string;
  expires_at?: string;
  completed_at?: string;
}

export interface StripeSubscription extends DirectusBaseItem {
  id?: string;
  customer_id?: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  canceled_at?: string;
  plan_id?: string;
  plan_name?: string;
  amount?: number;
  currency?: string;
  interval?: string;
  metadata?: any;
}

export interface ShopifySettings extends DirectusBaseItem {
  id?: string;
  shop_domain?: string;
  api_key?: string;
  api_secret?: string;
  access_token?: string;
  webhook_secret?: string;
  active?: boolean;
  last_sync?: string;
}

export interface ShopifyProduct extends DirectusBaseItem {
  id?: string;
  shopify_product_id: string;
  title: string;
  handle?: string;
  product_type?: string;
  vendor?: string;
  tags?: string;
  status?: string;
  variants?: any;
  images?: any;
  price?: number;
  compare_at_price?: number;
  inventory_quantity?: number;
}

export interface ShopifyCoupon extends DirectusBaseItem {
  id?: string;
  shopify_price_rule_id?: string;
  shopify_discount_code_id?: string;
  code: string;
  value: number;
  value_type: string;
  usage_count?: number;
  usage_limit?: number;
  starts_at?: string;
  ends_at?: string;
  active?: boolean;
  customer_id?: string;
  evaluation_id?: string;
  created_for?: string;
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
  shopify_customers: any[];
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
      const customers = await directus.request(
        readItems('new_customers', {
          filter,
          sort: ['-created_at'],
          limit: -1
        })
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
      const subscriptions = await directus.request(
        readItems('subscriptions', {
          filter,
          sort: ['-created_at'],
          limit: -1
        })
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
      const evaluations = await directus.request(
        readItems('evaluations', {
          filter,
          sort: ['-created_at'],
          limit: -1
        })
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
      const items = await directus.request(
        readItems(collection, {
          filter,
          sort: ['-created_at'],
          limit: -1
        })
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
