// Shopify API Client
// Este archivo maneja las llamadas directas a la API de Shopify

export interface ShopifyConfig {
  shopDomain: string;
  apiKey: string;
  apiSecret: string;
  accessToken: string;
}

export interface ShopifyPriceRule {
  id?: string;
  title: string;
  target_type: 'line_item' | 'shipping_line';
  target_selection: 'all' | 'entitled';
  allocation_method: 'across' | 'each';
  value_type: 'fixed_amount' | 'percentage';
  value: string;
  customer_selection: 'all' | 'prerequisite';
  once_per_customer: boolean;
  usage_limit?: number;
  starts_at?: string;
  ends_at?: string;
}

export interface ShopifyDiscountCode {
  id?: string;
  price_rule_id: string;
  code: string;
  usage_count?: number;
  created_at?: string;
  updated_at?: string;
}

export class ShopifyAPIClient {
  private config: ShopifyConfig;
  private baseUrl: string;

  constructor(config: ShopifyConfig) {
    this.config = config;
    this.baseUrl = `https://${config.shopDomain}/admin/api/2024-01`;
  }

  // Headers para las peticiones
  private getHeaders() {
    return {
      'X-Shopify-Access-Token': this.config.accessToken,
      'Content-Type': 'application/json',
    };
  }

  // Método genérico para hacer peticiones
  private async makeRequest<T>(
    endpoint: string,
    method: string = 'GET',
    data?: any
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const options: RequestInit = {
        method,
        headers: this.getHeaders(),
      };

      if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Shopify API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Productos
  async getProducts(limit: number = 250) {
    try {
      const response = await this.makeRequest<{ products: any[] }>(
        `/products.json?limit=${limit}`
      );
      return response.products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getProduct(productId: string) {
    try {
      const response = await this.makeRequest<{ product: any }>(
        `/products/${productId}.json`
      );
      return response.product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Clientes
  async getCustomers(limit: number = 250) {
    try {
      const response = await this.makeRequest<{ customers: any[] }>(
        `/customers.json?limit=${limit}`
      );
      return response.customers;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  async getCustomer(customerId: string) {
    try {
      const response = await this.makeRequest<{ customer: any }>(
        `/customers/${customerId}.json`
      );
      return response.customer;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  }

  // Price Rules (para descuentos)
  async createPriceRule(priceRule: ShopifyPriceRule) {
    try {
      const response = await this.makeRequest<{ price_rule: ShopifyPriceRule }>(
        '/price_rules.json',
        'POST',
        { price_rule: priceRule }
      );
      return response.price_rule;
    } catch (error) {
      console.error('Error creating price rule:', error);
      throw error;
    }
  }

  async getPriceRules() {
    try {
      const response = await this.makeRequest<{ price_rules: ShopifyPriceRule[] }>(
        '/price_rules.json'
      );
      return response.price_rules;
    } catch (error) {
      console.error('Error fetching price rules:', error);
      throw error;
    }
  }

  async updatePriceRule(priceRuleId: string, updates: Partial<ShopifyPriceRule>) {
    try {
      const response = await this.makeRequest<{ price_rule: ShopifyPriceRule }>(
        `/price_rules/${priceRuleId}.json`,
        'PUT',
        { price_rule: updates }
      );
      return response.price_rule;
    } catch (error) {
      console.error('Error updating price rule:', error);
      throw error;
    }
  }

  async deletePriceRule(priceRuleId: string) {
    try {
      await this.makeRequest(`/price_rules/${priceRuleId}.json`, 'DELETE');
      return true;
    } catch (error) {
      console.error('Error deleting price rule:', error);
      throw error;
    }
  }

  // Discount Codes
  async createDiscountCode(priceRuleId: string, code: string) {
    try {
      const response = await this.makeRequest<{ discount_code: ShopifyDiscountCode }>(
        `/price_rules/${priceRuleId}/discount_codes.json`,
        'POST',
        { discount_code: { code } }
      );
      return response.discount_code;
    } catch (error) {
      console.error('Error creating discount code:', error);
      throw error;
    }
  }

  async getDiscountCodes(priceRuleId: string) {
    try {
      const response = await this.makeRequest<{ discount_codes: ShopifyDiscountCode[] }>(
        `/price_rules/${priceRuleId}/discount_codes.json`
      );
      return response.discount_codes;
    } catch (error) {
      console.error('Error fetching discount codes:', error);
      throw error;
    }
  }

  async lookupDiscountCode(code: string) {
    try {
      const response = await this.makeRequest<{ discount_code: ShopifyDiscountCode }>(
        `/discount_codes/lookup.json?code=${code}`
      );
      return response.discount_code;
    } catch (error) {
      console.error('Error looking up discount code:', error);
      throw error;
    }
  }

  // Órdenes
  async getOrders(params?: { status?: string; limit?: number }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await this.makeRequest<{ orders: any[] }>(
        `/orders.json?${queryParams.toString()}`
      );
      return response.orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async getOrder(orderId: string) {
    try {
      const response = await this.makeRequest<{ order: any }>(
        `/orders/${orderId}.json`
      );
      return response.order;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  // Webhooks
  async createWebhook(topic: string, address: string) {
    try {
      const response = await this.makeRequest<{ webhook: any }>(
        '/webhooks.json',
        'POST',
        {
          webhook: {
            topic,
            address,
            format: 'json'
          }
        }
      );
      return response.webhook;
    } catch (error) {
      console.error('Error creating webhook:', error);
      throw error;
    }
  }

  async getWebhooks() {
    try {
      const response = await this.makeRequest<{ webhooks: any[] }>(
        '/webhooks.json'
      );
      return response.webhooks;
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      throw error;
    }
  }

  // Método helper para crear un cupón completo (Price Rule + Discount Code)
  async createCoupon(
    title: string,
    code: string,
    value: number,
    valueType: 'fixed_amount' | 'percentage' = 'fixed_amount',
    options?: {
      usageLimit?: number;
      oncePerCustomer?: boolean;
      startsAt?: string;
      endsAt?: string;
    }
  ) {
    try {
      // Crear Price Rule
      const priceRule = await this.createPriceRule({
        title,
        target_type: 'line_item',
        target_selection: 'all',
        allocation_method: 'across',
        value_type: valueType,
        value: `-${value}`, // Negativo para descuentos
        customer_selection: 'all',
        once_per_customer: options?.oncePerCustomer ?? true,
        usage_limit: options?.usageLimit,
        starts_at: options?.startsAt,
        ends_at: options?.endsAt,
      });

      if (!priceRule.id) {
        throw new Error('Failed to create price rule');
      }

      // Crear Discount Code
      const discountCode = await this.createDiscountCode(priceRule.id, code);

      return {
        priceRule,
        discountCode,
      };
    } catch (error) {
      console.error('Error creating coupon:', error);
      throw error;
    }
  }

  // Verificar conexión
  async testConnection() {
    try {
      const shop = await this.makeRequest<{ shop: any }>('/shop.json');
      return {
        success: true,
        shop: shop.shop,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default ShopifyAPIClient;
