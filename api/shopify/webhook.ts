import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createDirectus, rest, authentication, createItem, readItems, updateItem } from '@directus/sdk';
import crypto from 'crypto';

// Configuración de Directus
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://admin-api-directus.dqyvuv.easypanel.host';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || 'mcp_414xdh4vq47mcao0jg2';

// Shopify webhook endpoint
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Obtener el topic del webhook desde los headers
    const topic = req.headers['x-shopify-topic'] as string;
    const shopDomain = req.headers['x-shopify-shop-domain'] as string;
    
    // En producción, verificar la firma HMAC
    // const hmac = req.headers['x-shopify-hmac-sha256'] as string;
    // const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;
    // if (!verifyWebhook(req.body, hmac, webhookSecret)) {
    //   return res.status(401).json({ error: 'Unauthorized' });
    // }

    // Crear cliente de Directus
    const directus = createDirectus(DIRECTUS_URL)
      .with(authentication('static', { token: DIRECTUS_TOKEN }))
      .with(rest());

    // Procesar el webhook según el topic
    switch (topic) {
      case 'products/create':
      case 'products/update':
        await handleProductUpdate(directus, req.body);
        break;
        
      case 'customers/create':
      case 'customers/update':
        await handleCustomerUpdate(directus, req.body);
        break;
        
      case 'orders/create':
        await handleOrderCreated(directus, req.body);
        break;
        
      case 'orders/updated':
        await handleOrderUpdated(directus, req.body);
        break;
        
      default:
        console.log(`Unhandled webhook topic: ${topic}`);
    }

    // Responder a Shopify
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
}

// Verificar firma HMAC de Shopify
function verifyWebhook(body: any, hmac: string, secret: string): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(body), 'utf8')
    .digest('base64');
  return hash === hmac;
}

// Handlers específicos para cada tipo de webhook
async function handleProductUpdate(directus: any, product: any) {
  try {
    const productData = {
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
      compare_at_price: product.variants?.[0]?.compare_at_price ? parseFloat(product.variants[0].compare_at_price) : null,
      inventory_quantity: product.variants?.[0]?.inventory_quantity
    };

    // Verificar si el producto ya existe
    const existingProducts = await directus.request(
      readItems('shopify_products', {
        filter: { shopify_product_id: { _eq: productData.shopify_product_id } },
        limit: 1
      })
    );

    if (existingProducts.length > 0) {
      // Actualizar producto existente
      await directus.request(
        updateItem('shopify_products', existingProducts[0].id, productData)
      );
    } else {
      // Crear nuevo producto
      await directus.request(
        createItem('shopify_products', productData)
      );
    }

    console.log('Product update processed successfully');
  } catch (error) {
    console.error('Error handling product update:', error);
    throw error;
  }
}

async function handleCustomerUpdate(directus: any, customer: any) {
  try {
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

    // Verificar si el cliente ya existe en shopify_customers
    const existingShopifyCustomers = await directus.request(
      readItems('shopify_customers', {
        filter: { shopify_customer_id: { _eq: customerData.shopify_customer_id } },
        limit: 1
      })
    );

    if (existingShopifyCustomers.length > 0) {
      // Actualizar cliente existente
      await directus.request(
        updateItem('shopify_customers', existingShopifyCustomers[0].id, customerData)
      );
    } else {
      // Crear nuevo cliente
      await directus.request(
        createItem('shopify_customers', customerData)
      );
    }

    // Sincronizar con clientes locales
    const localCustomers = await directus.request(
      readItems('new_customers', {
        filter: { email: { _eq: customer.email } },
        limit: 1
      })
    );

    if (localCustomers.length > 0) {
      // Actualizar cliente local con ID de Shopify
      await directus.request(
        updateItem('new_customers', localCustomers[0].id, {
          shopify_customer_id: customer.id.toString(),
          name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
          phone: customer.phone
        })
      );
    } else {
      // Crear nuevo cliente local
      await directus.request(
        createItem('new_customers', {
          email: customer.email,
          name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
          phone: customer.phone,
          shopify_customer_id: customer.id.toString()
        })
      );
    }

    console.log('Customer update processed successfully');
  } catch (error) {
    console.error('Error handling customer update:', error);
    throw error;
  }
}

async function handleOrderCreated(directus: any, order: any) {
  try {
    // Verificar si se usó algún cupón
    if (order.discount_codes && order.discount_codes.length > 0) {
      for (const discount of order.discount_codes) {
        await updateCouponUsage(directus, discount.code);
      }
    }

    // Registrar la orden (opcional, para futuras funcionalidades)
    console.log('Order created:', order.id, 'Total:', order.total_price);

    // Aquí podrías agregar más lógica, como:
    // - Crear registro de venta local
    // - Actualizar inventario local
    // - Enviar notificaciones
    // - etc.
  } catch (error) {
    console.error('Error handling order created:', error);
    throw error;
  }
}

async function handleOrderUpdated(directus: any, order: any) {
  try {
    // Verificar cambios en el estado del pedido
    if (order.fulfillment_status === 'fulfilled') {
      console.log('Order fulfilled:', order.id);
      // Aquí podrías actualizar el estado de servicios relacionados
    }

    if (order.financial_status === 'refunded' || order.financial_status === 'partially_refunded') {
      console.log('Order refunded:', order.id);
      // Aquí podrías manejar la lógica de reembolsos
    }

    console.log('Order updated:', order.id, 'Status:', order.financial_status);
  } catch (error) {
    console.error('Error handling order updated:', error);
    throw error;
  }
}

// Función auxiliar para actualizar el uso de cupones
async function updateCouponUsage(directus: any, code: string) {
  try {
    const coupons = await directus.request(
      readItems('shopify_coupons', {
        filter: { code: { _eq: code } },
        limit: 1
      })
    );

    if (coupons.length > 0) {
      const coupon = coupons[0];
      const newUsageCount = (coupon.usage_count || 0) + 1;
      const isStillActive = coupon.usage_limit ? newUsageCount < coupon.usage_limit : true;

      await directus.request(
        updateItem('shopify_coupons', coupon.id, {
          usage_count: newUsageCount,
          is_active: isStillActive
        })
      );

      // Si es un cupón de Trade-In y se ha usado, actualizar la evaluación
      if (coupon.evaluation_id) {
        await directus.request(
          updateItem('evaluations', coupon.evaluation_id, {
            status: 'redeemed'
          })
        );
      }

      console.log(`Coupon ${code} usage updated`);
    }
  } catch (error) {
    console.error('Error updating coupon usage:', error);
    // No lanzar error para no interrumpir el procesamiento del pedido
  }
}
