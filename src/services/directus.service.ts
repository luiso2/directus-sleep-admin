import { createDirectus, rest, authentication, createItem, readItems, updateItem, deleteItem } from '@directus/sdk';

// Configuración de Directus
const DIRECTUS_URL = 'https://admin-api-directus.dqyvuv.easypanel.host';
const DIRECTUS_TOKEN = 'mcp_414xdh4vq47mcao0jg2';

// Tipos base para las tablas
export interface DirectusBaseItem {
  id?: number;
  date_created?: string;
  date_updated?: string;
}

// Interfaces para las tablas del sistema
export interface NewCustomer extends DirectusBaseItem {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  subscription_status?: 'active' | 'inactive' | 'paused' | 'cancelled';
  stripe_customer_id?: string;
  shopify_customer_id?: string;
}

export interface Subscription extends DirectusBaseItem {
  customer_id: number;
  plan_type: 'basic' | 'premium' | 'elite';
  status: 'active' | 'inactive' | 'paused' | 'cancelled';
  start_date: string;
  end_date?: string;
  stripe_subscription_id?: string;
  monthly_price: number;
  included_cleanings: number;
  included_inspections: number;
  has_protection: boolean;
  has_trade_in: boolean;
}

export interface Evaluation extends DirectusBaseItem {
  customer_id: number;
  mattress_brand: string;
  mattress_model?: string;
  purchase_date?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  estimated_value: number;
  credit_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'redeemed';
  evaluation_date: string;
  expiry_date: string;
  coupon_code?: string;
  notes?: string;
}

// Schema de Directus
type DirectusSchema = {
  new_customers: NewCustomer[];
  subscriptions: Subscription[];
  evaluations: Evaluation[];
  stripe_config: any[];
  stripe_payment_links: any[];
  stripe_subscriptions: any[];
  stripe_webhooks: any[];
  shopify_settings: any[];
  shopify_products: any[];
  shopify_customers: any[];
  shopify_coupons: any[];
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
          sort: ['-date_created'],
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
          sort: ['-date_created'],
          limit: -1
        })
      );
      return subscriptions;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  }

  static async getSubscriptionById(id: number) {
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
      const subscription = await directus.request(
        createItem('subscriptions', data)
      );
      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  static async updateSubscription(id: number, data: Partial<Subscription>) {
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
          sort: ['-date_created'],
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
      const evaluation = await directus.request(
        createItem('evaluations', data)
      );
      return evaluation;
    } catch (error) {
      console.error('Error creating evaluation:', error);
      throw error;
    }
  }

  static async updateEvaluation(id: number, data: Partial<Evaluation>) {
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
          sort: ['-date_created'],
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

  static async updateItem<T>(collection: keyof DirectusSchema, id: number, data: any) {
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

  static async deleteItem(collection: keyof DirectusSchema, id: number) {
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
