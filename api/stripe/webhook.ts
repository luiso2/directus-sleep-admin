import { VercelRequest, VercelResponse } from '@vercel/node';
import { createDirectus, rest, authentication } from '@directus/sdk';

// Configuración de Directus
const DIRECTUS_URL = process.env.VITE_DIRECTUS_URL || 'https://admin-api-directus.dqyvuv.easypanel.host';
const DIRECTUS_TOKEN = process.env.VITE_DIRECTUS_TOKEN || 'mcp_414xdh4vq47mcao0jg2';

// Crear cliente de Directus
const directus = createDirectus(DIRECTUS_URL)
  .with(authentication('static', { token: DIRECTUS_TOKEN }))
  .with(rest());

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event = req.body;
    
    // Log del webhook recibido
    await directus.items('stripe_webhooks').createOne({
      stripe_event_id: event.id,
      type: event.type,
      data: event.data,
      processed: false,
      created_at: new Date().toISOString()
    });

    // Procesar según el tipo de evento
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Marcar webhook como procesado
    await directus.items('stripe_webhooks').updateByQuery({
      filter: { stripe_event_id: { _eq: event.id } },
      data: { processed: true }
    });

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    
    // Registrar el error
    if (req.body?.id) {
      await directus.items('stripe_webhooks').updateByQuery({
        filter: { stripe_event_id: { _eq: req.body.id } },
        data: { 
          processed: false,
          error: error.message 
        }
      });
    }
    
    res.status(400).json({ error: error.message });
  }
}

// Manejar checkout completado
async function handleCheckoutCompleted(session: any) {
  const { customer_email, subscription, metadata } = session;
  
  // Buscar o crear cliente
  let customer = await directus.items('new_customers').readByQuery({
    filter: { email: { _eq: customer_email } },
    limit: 1
  });

  if (!customer.data || customer.data.length === 0) {
    // Crear nuevo cliente
    customer = await directus.items('new_customers').createOne({
      email: customer_email,
      first_name: metadata?.first_name || '',
      last_name: metadata?.last_name || '',
      type: 'subscriber',
      status: 'active',
      created_at: new Date().toISOString()
    });
  }

  // Registrar suscripción de Stripe
  await directus.items('stripe_subscriptions').createOne({
    stripe_subscription_id: subscription,
    stripe_customer_id: session.customer,
    customer_id: customer.data?.[0]?.id || customer.id,
    status: 'active',
    created_at: new Date().toISOString()
  });
}

// Manejar actualización de suscripción
async function handleSubscriptionUpdate(subscription: any) {
  const { id, status, current_period_end, items } = subscription;
  
  // Actualizar suscripción en Stripe
  await directus.items('stripe_subscriptions').updateByQuery({
    filter: { stripe_subscription_id: { _eq: id } },
    data: {
      status,
      current_period_end: new Date(current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }
  });

  // Actualizar suscripción local
  const stripeSubscription = await directus.items('stripe_subscriptions').readByQuery({
    filter: { stripe_subscription_id: { _eq: id } },
    limit: 1
  });

  if (stripeSubscription.data && stripeSubscription.data.length > 0) {
    const planType = items.data[0]?.price?.metadata?.plan_type || 'basic';
    
    await directus.items('subscriptions').updateByQuery({
      filter: { customer_id: { _eq: stripeSubscription.data[0].customer_id } },
      data: {
        status: status === 'active' ? 'active' : 'inactive',
        plan: planType,
        updated_at: new Date().toISOString()
      }
    });
  }
}

// Manejar suscripción eliminada
async function handleSubscriptionDeleted(subscription: any) {
  const { id } = subscription;
  
  // Actualizar estado en Stripe
  await directus.items('stripe_subscriptions').updateByQuery({
    filter: { stripe_subscription_id: { _eq: id } },
    data: {
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    }
  });

  // Actualizar suscripción local
  const stripeSubscription = await directus.items('stripe_subscriptions').readByQuery({
    filter: { stripe_subscription_id: { _eq: id } },
    limit: 1
  });

  if (stripeSubscription.data && stripeSubscription.data.length > 0) {
    await directus.items('subscriptions').updateByQuery({
      filter: { customer_id: { _eq: stripeSubscription.data[0].customer_id } },
      data: {
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      }
    });
  }
}

// Manejar pago exitoso
async function handlePaymentSucceeded(invoice: any) {
  const { subscription, customer_email } = invoice;
  
  // Registrar el pago
  console.log(`Payment succeeded for subscription ${subscription}`);
  
  // Actualizar última fecha de pago
  await directus.items('stripe_subscriptions').updateByQuery({
    filter: { stripe_subscription_id: { _eq: subscription } },
    data: {
      last_payment_date: new Date().toISOString()
    }
  });
}

// Manejar pago fallido
async function handlePaymentFailed(invoice: any) {
  const { subscription, customer_email } = invoice;
  
  console.log(`Payment failed for subscription ${subscription}`);
  
  // Actualizar estado a paused
  await directus.items('subscriptions').updateByQuery({
    filter: { stripe_id: { _eq: subscription } },
    data: {
      status: 'paused',
      paused_at: new Date().toISOString()
    }
  });
}
