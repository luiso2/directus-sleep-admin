import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createDirectus, rest, authentication, createItem } from '@directus/sdk';

// Configuración de Directus
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://admin-api-directus.dqyvuv.easypanel.host';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || 'mcp_414xdh4vq47mcao0jg2';

// Stripe webhook endpoint
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Obtener el evento de Stripe
    const event = req.body;
    
    // En producción, aquí verificarías la firma del webhook
    // const sig = req.headers['stripe-signature'];
    // const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    // Crear cliente de Directus
    const directus = createDirectus(DIRECTUS_URL)
      .with(authentication('static', { token: DIRECTUS_TOKEN }))
      .with(rest());

    // Guardar el evento en la base de datos
    await directus.request(
      createItem('stripe_webhooks', {
        stripe_event_id: event.id,
        type: event.type,
        data: event,
        processed: false,
        created_at: new Date().toISOString()
      })
    );

    // Procesar el evento según su tipo
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(directus, event.data.object);
        break;
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(directus, event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(directus, event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(directus, event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(directus, event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Responder a Stripe
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
}

// Handlers específicos para cada tipo de evento
async function handleCheckoutCompleted(directus: any, session: any) {
  try {
    // Buscar o crear cliente
    const customerEmail = session.customer_email;
    const customers = await directus.request(
      readItems('new_customers', {
        filter: { email: { _eq: customerEmail } },
        limit: 1
      })
    );

    let customerId: number;
    if (customers.length > 0) {
      customerId = customers[0].id;
      // Actualizar cliente con stripe_customer_id
      await directus.request(
        updateItem('new_customers', customerId, {
          stripe_customer_id: session.customer,
          subscription_status: 'active'
        })
      );
    } else {
      // Crear nuevo cliente
      const newCustomer = await directus.request(
        createItem('new_customers', {
          email: customerEmail,
          name: session.customer_details?.name || customerEmail,
          stripe_customer_id: session.customer,
          subscription_status: 'active'
        })
      );
      customerId = newCustomer.id;
    }

    // Determinar el tipo de plan basado en el monto
    const amount = session.amount_total / 100;
    let planType = 'basic';
    if (amount >= 75) {
      planType = 'elite';
    } else if (amount >= 50) {
      planType = 'premium';
    }

    // Crear suscripción local
    await directus.request(
      createItem('subscriptions', {
        customer_id: customerId,
        plan_type: planType,
        status: 'active',
        start_date: new Date().toISOString(),
        stripe_subscription_id: session.subscription,
        monthly_price: amount,
        included_cleanings: planType === 'basic' ? 3 : planType === 'premium' ? 6 : 12,
        included_inspections: planType === 'basic' ? 1 : 2,
        has_protection: planType !== 'basic',
        has_trade_in: planType === 'elite'
      })
    );

    console.log('Checkout completed processed successfully');
  } catch (error) {
    console.error('Error handling checkout completed:', error);
    throw error;
  }
}

async function handleSubscriptionUpdate(directus: any, subscription: any) {
  try {
    // Actualizar información de suscripción en stripe_subscriptions
    const existingSubscriptions = await directus.request(
      readItems('stripe_subscriptions', {
        filter: { stripe_subscription_id: { _eq: subscription.id } },
        limit: 1
      })
    );

    const subscriptionData = {
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      plan_id: subscription.items.data[0]?.price.id,
      plan_name: subscription.items.data[0]?.price.nickname || subscription.items.data[0]?.price.product,
      amount: subscription.items.data[0]?.price.unit_amount / 100,
      currency: subscription.items.data[0]?.price.currency,
      interval: subscription.items.data[0]?.price.recurring?.interval,
      metadata: subscription.metadata
    };

    if (existingSubscriptions.length > 0) {
      await directus.request(
        updateItem('stripe_subscriptions', existingSubscriptions[0].id, subscriptionData)
      );
    } else {
      await directus.request(
        createItem('stripe_subscriptions', subscriptionData)
      );
    }

    // Actualizar suscripción local
    const localSubscriptions = await directus.request(
      readItems('subscriptions', {
        filter: { stripe_subscription_id: { _eq: subscription.id } },
        limit: 1
      })
    );

    if (localSubscriptions.length > 0) {
      await directus.request(
        updateItem('subscriptions', localSubscriptions[0].id, {
          status: subscription.status
        })
      );
    }

    console.log('Subscription update processed successfully');
  } catch (error) {
    console.error('Error handling subscription update:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(directus: any, subscription: any) {
  try {
    // Actualizar suscripción local como cancelada
    const localSubscriptions = await directus.request(
      readItems('subscriptions', {
        filter: { stripe_subscription_id: { _eq: subscription.id } },
        limit: 1
      })
    );

    if (localSubscriptions.length > 0) {
      await directus.request(
        updateItem('subscriptions', localSubscriptions[0].id, {
          status: 'cancelled',
          end_date: new Date().toISOString()
        })
      );
    }

    // Actualizar estado del cliente
    const customers = await directus.request(
      readItems('new_customers', {
        filter: { stripe_customer_id: { _eq: subscription.customer } },
        limit: 1
      })
    );

    if (customers.length > 0) {
      await directus.request(
        updateItem('new_customers', customers[0].id, {
          subscription_status: 'cancelled'
        })
      );
    }

    console.log('Subscription deletion processed successfully');
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
    throw error;
  }
}

async function handlePaymentSucceeded(directus: any, invoice: any) {
  console.log('Payment succeeded for invoice:', invoice.id);
  // Aquí puedes agregar lógica adicional para pagos exitosos
}

async function handlePaymentFailed(directus: any, invoice: any) {
  try {
    // Pausar suscripción por pago fallido
    const localSubscriptions = await directus.request(
      readItems('subscriptions', {
        filter: { stripe_subscription_id: { _eq: invoice.subscription } },
        limit: 1
      })
    );

    if (localSubscriptions.length > 0) {
      await directus.request(
        updateItem('subscriptions', localSubscriptions[0].id, {
          status: 'paused'
        })
      );
    }

    // Actualizar estado del cliente
    const customers = await directus.request(
      readItems('new_customers', {
        filter: { stripe_customer_id: { _eq: invoice.customer } },
        limit: 1
      })
    );

    if (customers.length > 0) {
      await directus.request(
        updateItem('new_customers', customers[0].id, {
          subscription_status: 'paused'
        })
      );
    }

    console.log('Payment failure processed successfully');
  } catch (error) {
    console.error('Error handling payment failed:', error);
    throw error;
  }
}

// Importar funciones necesarias que faltan
import { readItems, updateItem } from '@directus/sdk';
