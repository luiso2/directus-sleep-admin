import DirectusService, { StripeConfig, StripePaymentLink, StripeSubscription } from './directus.service';

// Definir los precios de los planes
export const PLAN_PRICES = {
  basic: {
    monthly: 25,
    yearly: 250,
    cleanings: 3,
    inspections: 1,
    protection: false,
    tradeIn: false
  },
  premium: {
    monthly: 50,
    yearly: 500,
    cleanings: 6,
    inspections: 2,
    protection: true,
    tradeIn: false
  },
  elite: {
    monthly: 75,
    yearly: 750,
    cleanings: 12,
    inspections: 2,
    protection: true,
    tradeIn: true
  }
};

export class StripeService {
  // Configuración de Stripe
  static async getConfig(): Promise<StripeConfig | null> {
    try {
      const configs = await DirectusService.getItems<StripeConfig>('stripe_config', {
        active: { _eq: true }
      });
      return configs[0] || null;
    } catch (error) {
      console.error('Error fetching Stripe config:', error);
      throw error;
    }
  }

  static async saveConfig(config: Partial<StripeConfig>) {
    try {
      // Intentar desactivar configuraciones anteriores (si tenemos permisos)
      try {
        const existingConfigs = await DirectusService.getItems<StripeConfig>('stripe_config', {
          active: { _eq: true }
        });
        
        // Solo actualizar si encontramos configuraciones activas
        for (const existing of existingConfigs) {
          if (existing.id) {
            await DirectusService.updateItem('stripe_config', existing.id, { active: false });
          }
        }
      } catch (error) {
        // Si no podemos leer las configuraciones existentes, continuamos
        console.log('Could not read existing config, continuing with creation');
      }

      // Crear nueva configuración activa con ID único
      const newConfig = await DirectusService.createItem('stripe_config', {
        id: `stripe_config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...config,
        active: true,
        created_at: new Date().toISOString()
      });
      
      return newConfig;
    } catch (error) {
      console.error('Error saving Stripe config:', error);
      throw error;
    }
  }

  // Payment Links
  static async getPaymentLinks() {
    try {
      const links = await DirectusService.getItems<StripePaymentLink>('stripe_payment_links', {
        status: { _neq: 'deleted' }
      });
      return links;
    } catch (error) {
      console.error('Error fetching payment links:', error);
      throw error;
    }
  }

  static async createPaymentLink(data: Partial<StripePaymentLink>) {
    try {
      const link = await DirectusService.createItem('stripe_payment_links', {
        ...data,
        status: data.status || 'active',
        currency: data.currency || 'USD',
        type: data.type || 'recurring'
      });
      return link;
    } catch (error) {
      console.error('Error creating payment link:', error);
      throw error;
    }
  }

  static async updatePaymentLink(id: string, data: Partial<StripePaymentLink>) {
    try {
      const link = await DirectusService.updateItem('stripe_payment_links', id, data);
      return link;
    } catch (error) {
      console.error('Error updating payment link:', error);
      throw error;
    }
  }

  static async deletePaymentLink(id: string) {
    try {
      // Soft delete - cambiar estado
      await DirectusService.updateItem('stripe_payment_links', id, { status: 'deleted' });
      return true;
    } catch (error) {
      console.error('Error deleting payment link:', error);
      throw error;
    }
  }

  // Suscripciones
  static async getSubscriptions(filter?: any) {
    try {
      const subscriptions = await DirectusService.getItems<StripeSubscription>('stripe_subscriptions', filter);
      return subscriptions;
    } catch (error) {
      console.error('Error fetching Stripe subscriptions:', error);
      throw error;
    }
  }

  static async getSubscriptionsByCustomer(customerId: string) {
    try {
      const subscriptions = await DirectusService.getItems<StripeSubscription>('stripe_subscriptions', {
        customer_id: { _eq: customerId }
      });
      return subscriptions;
    } catch (error) {
      console.error('Error fetching customer subscriptions:', error);
      throw error;
    }
  }

  static async createOrUpdateSubscription(data: Partial<StripeSubscription>) {
    try {
      // Verificar si ya existe
      const existing = await DirectusService.getItems<StripeSubscription>('stripe_subscriptions', {
        stripe_subscription_id: { _eq: data.stripe_subscription_id }
      });

      if (existing.length > 0 && existing[0].id) {
        // Actualizar
        return await DirectusService.updateItem('stripe_subscriptions', existing[0].id, data);
      } else {
        // Crear nueva con ID único
        return await DirectusService.createItem('stripe_subscriptions', {
          id: `stripe_sub_${Date.now()}`,
          ...data
        });
      }
    } catch (error) {
      console.error('Error creating/updating Stripe subscription:', error);
      throw error;
    }
  }

  // Webhooks
  static async logWebhook(eventData: any) {
    try {
      const webhook = await DirectusService.createItem('stripe_webhooks', {
        stripe_event_id: eventData.id,
        type: eventData.type,
        data: eventData,
        processed: false,
        created_at: new Date().toISOString()
      });
      return webhook;
    } catch (error) {
      console.error('Error logging webhook:', error);
      throw error;
    }
  }

  static async markWebhookProcessed(id: string, error?: string) {
    try {
      await DirectusService.updateItem('stripe_webhooks', id, {
        processed: true,
        error: error || null
      });
    } catch (error) {
      console.error('Error marking webhook as processed:', error);
      throw error;
    }
  }

  static async getWebhookHistory(limit: number = 50) {
    try {
      const webhooks = await DirectusService.getItems<any>('stripe_webhooks', {
        _limit: limit,
        _sort: '-created_at'
      });
      return webhooks;
    } catch (error) {
      console.error('Error fetching webhook history:', error);
      throw error;
    }
  }

  // Procesar eventos de webhook
  static async processWebhookEvent(event: any) {
    try {
      const webhookLog = await this.logWebhook(event);
      
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object);
          break;
          
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdate(event.data.object);
          break;
          
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
          
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
          
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
          
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      if (webhookLog.id) {
        await this.markWebhookProcessed(webhookLog.id);
      }
    } catch (error: any) {
      console.error('Error processing webhook:', error);
      throw error;
    }
  }

  // Handlers específicos para eventos
  private static async handleCheckoutCompleted(session: any) {
    try {
      // Crear o actualizar cliente
      const customerData = {
        email: session.customer_email,
        first_name: session.customer_details?.name?.split(' ')[0] || session.customer_email,
        last_name: session.customer_details?.name?.split(' ').slice(1).join(' ') || '',
        type: 'stripe'
      };

      // Buscar cliente existente
      let customers = await DirectusService.getCustomers({
        email: { _eq: session.customer_email }
      });

      let customerId: number;
      if (customers.length > 0 && customers[0].id) {
        // Actualizar cliente existente
        await DirectusService.updateCustomer(customers[0].id, customerData);
        customerId = customers[0].id;
      } else {
        // Crear nuevo cliente
        const newCustomer = await DirectusService.createCustomer(customerData);
        customerId = newCustomer.id!;
      }

      // Determinar el plan basado en el monto
      let planType: 'basic' | 'premium' | 'elite' = 'basic';
      const amount = session.amount_total / 100; // Convertir de centavos

      if (amount >= PLAN_PRICES.elite.monthly || amount >= PLAN_PRICES.elite.yearly) {
        planType = 'elite';
      } else if (amount >= PLAN_PRICES.premium.monthly || amount >= PLAN_PRICES.premium.yearly) {
        planType = 'premium';
      }

      // Crear suscripción local
      const subscriptionData = {
        customer_id: customerId.toString(),
        plan: planType,
        status: 'active',
        start_date: new Date().toISOString(),
        pricing: {
          amount: PLAN_PRICES[planType].monthly,
          currency: 'USD',
          interval: 'monthly'
        },
        billing: {
          method: 'stripe',
          last_payment: new Date().toISOString()
        },
        services: {
          cleanings: PLAN_PRICES[planType].cleanings,
          inspections: PLAN_PRICES[planType].inspections,
          protection: PLAN_PRICES[planType].protection,
          trade_in: PLAN_PRICES[planType].tradeIn
        },
        credits: {
          cleanings_used: 0,
          inspections_used: 0
        }
      };

      await DirectusService.createSubscription(subscriptionData);

      // Crear registro en stripe_subscriptions si hay subscription ID
      if (session.subscription) {
        await this.createOrUpdateSubscription({
          stripe_subscription_id: session.subscription,
          stripe_customer_id: session.customer,
          customer_id: customerId.toString(),
          status: 'active',
          plan_name: planType,
          amount: PLAN_PRICES[planType].monthly,
          currency: 'USD',
          interval: 'monthly'
        });
      }

    } catch (error) {
      console.error('Error handling checkout completed:', error);
      throw error;
    }
  }

  private static async handleSubscriptionUpdate(subscription: any) {
    try {
      // Actualizar suscripción en Stripe
      await this.createOrUpdateSubscription({
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : undefined,
        plan_id: subscription.items.data[0]?.price.id,
        plan_name: subscription.items.data[0]?.price.nickname || subscription.items.data[0]?.price.product,
        amount: subscription.items.data[0]?.price.unit_amount / 100,
        currency: subscription.items.data[0]?.price.currency,
        interval: subscription.items.data[0]?.price.recurring?.interval,
        metadata: subscription.metadata
      });

      // TODO: Actualizar suscripción local si existe mapeo
    } catch (error) {
      console.error('Error handling subscription update:', error);
      throw error;
    }
  }

  private static async handleSubscriptionDeleted(subscription: any) {
    try {
      // Actualizar suscripción en stripe_subscriptions
      const stripeSubscriptions = await this.getSubscriptions({
        stripe_subscription_id: { _eq: subscription.id }
      });

      if (stripeSubscriptions.length > 0 && stripeSubscriptions[0].id) {
        await DirectusService.updateItem('stripe_subscriptions', stripeSubscriptions[0].id, {
          status: 'cancelled',
          canceled_at: new Date().toISOString()
        });
      }

      // TODO: Actualizar suscripción local si existe mapeo
    } catch (error) {
      console.error('Error handling subscription deleted:', error);
      throw error;
    }
  }

  private static async handlePaymentSucceeded(invoice: any) {
    try {
      console.log('Payment succeeded for invoice:', invoice.id);
      // Aquí puedes agregar lógica adicional para pagos exitosos
      // Por ejemplo, actualizar el billing.last_payment en la suscripción local
    } catch (error) {
      console.error('Error handling payment succeeded:', error);
      throw error;
    }
  }

  private static async handlePaymentFailed(invoice: any) {
    try {
      console.log('Payment failed for invoice:', invoice.id);
      
      // Actualizar estado de suscripción si existe
      const stripeSubscriptions = await this.getSubscriptions({
        stripe_subscription_id: { _eq: invoice.subscription }
      });

      if (stripeSubscriptions.length > 0 && stripeSubscriptions[0].id) {
        await DirectusService.updateItem('stripe_subscriptions', stripeSubscriptions[0].id, {
          status: 'past_due'
        });
      }

      // TODO: Actualizar suscripción local a estado 'paused' si existe mapeo
    } catch (error) {
      console.error('Error handling payment failed:', error);
      throw error;
    }
  }
}

export default StripeService;
