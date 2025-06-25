// Datos de demostración para cuando hay errores de permisos

export const getDemoEvaluations = () => [
  {
    id: "1",
    customer_name: "Juan Pérez",
    customer_email: "juan.perez@example.com",
    mattress_model: "Sleep+ Elite King",
    status: "pending",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    customer_name: "María García",
    customer_email: "maria.garcia@example.com",
    mattress_model: "Sleep+ Premium Queen",
    status: "approved",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    customer_name: "Carlos Rodríguez",
    customer_email: "carlos.rodriguez@example.com",
    mattress_model: "Sleep+ Basic Full",
    status: "rejected",
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const getDemoCustomers = () => [
  {
    id: "1",
    name: "Juan Pérez",
    email: "juan.perez@example.com",
    phone: "+1234567890",
    stripe_customer_id: "cus_demo_123",
    shopify_customer_id: "shop_demo_456",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "María García",
    email: "maria.garcia@example.com",
    phone: "+0987654321",
    stripe_customer_id: "cus_demo_789",
    shopify_customer_id: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@example.com",
    phone: null,
    stripe_customer_id: null,
    shopify_customer_id: "shop_demo_012",
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const getDemoSubscriptions = () => [
  {
    id: "1",
    customer_id: "1",
    plan_type: "Elite",
    status: "active",
    start_date: new Date().toISOString(),
    next_billing_date: new Date(Date.now() + 2592000000).toISOString(), // 30 días
    amount: 99.99,
  },
  {
    id: "2",
    customer_id: "2",
    plan_type: "Premium",
    status: "active",
    start_date: new Date(Date.now() - 2592000000).toISOString(),
    next_billing_date: new Date(Date.now() + 86400000).toISOString(),
    amount: 79.99,
  },
  {
    id: "3",
    customer_id: "3",
    plan_type: "Basic",
    status: "cancelled",
    start_date: new Date(Date.now() - 5184000000).toISOString(),
    next_billing_date: null,
    amount: 49.99,
  },
];