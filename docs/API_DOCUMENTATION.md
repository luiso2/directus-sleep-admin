# Sleep Plus Admin - API Documentation

**Versión:** 1.0.0
**Descripción:** Documentación de la API de Directus para Sleep Plus Admin
**Base URL:** https://admin-api-directus.dqyvuv.easypanel.host

## 📊 Resumen

- **Colecciones personalizadas:** 32
- **Colecciones del sistema:** 2

## 🗄️ Colecciones Personalizadas

### achievements

Migrated from PostgreSQL table: achievements

**Endpoints:**
- GET /items/achievements
- GET /items/achievements/:id
- POST /items/achievements
- PATCH /items/achievements/:id
- DELETE /items/achievements/:id

**Campos (11):**
- `id` (string) *requerido*
- `code` (string) *requerido*
- `name` (string) *requerido*
- `description` (text)
- `icon` (string)
- `category` (string)
- `criteria` (json)
- `rewards` (json)
- `tier` (string)
- `unlocked_by` (json)
- `created_at` (timestamp)

**Datos de ejemplo:**
```json
{
  "id": "achieve-001",
  "code": "FIRST_SALE",
  "name": "Primera Venta",
  "description": "Completa tu primera venta exitosa",
  "icon": "🏆",
  "category": "milestone",
  "criteria": {
    "type": "sales",
    "count": 1
  },
  "rewards": {
    "badge": "rookie",
    "points": 100
  },
  "tier": "bronze",
  "unlocked_by": {
    "count": 5,
    "users": [
      "emp-002",
      "emp-003",
      "emp-004",
      "emp-005",
      "emp-006"
    ]
  },
  "created_at": "2025-06-23T21:28:24.184Z"
}
```

### activity_logs

Migrated from PostgreSQL table: activity_logs

**Endpoints:**
- GET /items/activity_logs
- GET /items/activity_logs/:id
- POST /items/activity_logs
- PATCH /items/activity_logs/:id
- DELETE /items/activity_logs/:id

**Campos (9):**
- `id` (string) *requerido*
- `user_id` (string)
- `user_name` (string)
- `action` (string)
- `resource` (string)
- `resource_id` (string)
- `details` (json)
- `ip_address` (string)
- `created_at` (timestamp)

**Datos de ejemplo:**
```json
{
  "id": "log-001",
  "user_id": "emp-002",
  "user_name": "María García",
  "action": "create",
  "resource": "sale",
  "resource_id": "sale-001",
  "details": {
    "amount": 72920,
    "customer": "cust-001",
    "products": [
      "prod-001",
      "prod-003"
    ]
  },
  "ip_address": "192.168.1.100",
  "created_at": "2025-06-13T21:14:16.201Z"
}
```

### appointments

Migrated from PostgreSQL table: appointments

**Endpoints:**
- GET /items/appointments
- GET /items/appointments/:id
- POST /items/appointments
- PATCH /items/appointments/:id
- DELETE /items/appointments/:id

**Campos (16):**
- `id` (string) *requerido*
- `customer_id` (string) *requerido*
- `store_id` (string)
- `employee_id` (string)
- `appointment_type` (string) *requerido*
- `appointment_date` (timestamp) *requerido*
- `duration_minutes` (integer)
- `status` (string)
- `notes` (text)
- `symptoms` (json)
- `test_results` (json)
- `recommendations` (json)
- `reminder_sent` (boolean)
- `created_by` (string)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Datos de ejemplo:**
```json
{
  "id": "appt-001",
  "customer_id": "cust-002",
  "store_id": "store-mx-002",
  "employee_id": "emp-004",
  "appointment_type": "consultation",
  "appointment_date": "2024-02-05T16:00:00.000Z",
  "duration_minutes": 60,
  "status": "scheduled",
  "notes": "Cliente interesada en opciones hipoalergénicas para problemas de alergia. Preparar muestras de materiales hipoalergénicos",
  "symptoms": {
    "main_issue": "alergias",
    "sleep_quality": "pobre",
    "current_mattress_age": "7 años"
  },
  "test_results": null,
  "recommendations": null,
  "reminder_sent": false,
  "created_by": "emp-004",
  "created_at": "2025-06-23T21:11:32.385Z",
  "updated_at": "2025-06-23T21:11:32.385Z"
}
```

### calls

Migrated from PostgreSQL table: calls

**Endpoints:**
- GET /items/calls
- GET /items/calls/:id
- POST /items/calls
- PATCH /items/calls/:id
- DELETE /items/calls/:id

**Campos (15):**
- `id` (string) *requerido*
- `customer_id` (string)
- `user_id` (string)
- `type` (string) *requerido*
- `status` (string) *requerido*
- `disposition` (string)
- `duration` (integer)
- `start_time` (timestamp)
- `end_time` (timestamp)
- `notes` (text)
- `script` (json)
- `objections` (json)
- `next_action` (json)
- `metadata` (json)
- `created_at` (timestamp)

**Datos de ejemplo:**
```json
{
  "id": "call-001",
  "customer_id": "cust-001",
  "user_id": "emp-002",
  "type": "outbound",
  "status": "completed",
  "disposition": "sale",
  "duration": 245,
  "start_time": "2025-06-13T21:12:25.563Z",
  "end_time": "2025-06-13T21:16:30.563Z",
  "notes": "Cliente muy receptivo, cerró venta de King + base ajustable",
  "script": {
    "used": "script-001",
    "effectiveness": "high"
  },
  "objections": [],
  "next_action": {
    "date": "2024-01-25",
    "type": "delivery"
  },
  "metadata": {
    "phone": "+52 55 1234 5678",
    "campaign": "camp-001",
    "sentiment": "positive"
  },
  "created_at": "2025-06-23T21:12:25.563Z"
}
```

### campaigns

Migrated from PostgreSQL table: campaigns

**Endpoints:**
- GET /items/campaigns
- GET /items/campaigns/:id
- POST /items/campaigns
- PATCH /items/campaigns/:id
- DELETE /items/campaigns/:id

**Campos (14):**
- `id` (integer)
- `name` (string) *requerido*
- `description` (text)
- `type` (string)
- `status` (string)
- `start_date` (date)
- `end_date` (date)
- `budget` (decimal)
- `target_audience` (text)
- `goals` (json)
- `metrics` (json)
- `created_by` (integer)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Datos de ejemplo:**
```json
{
  "id": 1,
  "name": "Campaña Navideña 2024",
  "description": "Promociones especiales de fin de año con descuentos hasta 40%",
  "type": "email",
  "status": "completed",
  "start_date": "2024-12-01",
  "end_date": "2024-12-31",
  "budget": "150000.00",
  "target_audience": "Clientes VIP y clientes con compras previas",
  "goals": {
    "leads_target": 1000,
    "sales_target": 500000
  },
  "metrics": {
    "total_sales": 623000,
    "conversion_rate": 15.3,
    "leads_generated": 1245
  },
  "created_by": null,
  "created_at": "2025-06-24T15:45:01.761Z",
  "updated_at": null
}
```

### commissions

Migrated from PostgreSQL table: commissions

**Endpoints:**
- GET /items/commissions
- GET /items/commissions/:id
- POST /items/commissions
- PATCH /items/commissions/:id
- DELETE /items/commissions/:id

**Campos (8):**
- `id` (string) *requerido*
- `user_id` (string)
- `period` (json) *requerido*
- `earnings` (json) *requerido*
- `sales` (json)
- `status` (string)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Datos de ejemplo:**
```json
{
  "id": "comm-001",
  "user_id": "emp-002",
  "period": {
    "year": 2024,
    "month": 1,
    "end_date": "2024-01-31",
    "start_date": "2024-01-01"
  },
  "earnings": {
    "total": 25000,
    "bonuses": 2500,
    "commission": 12500,
    "base_salary": 10000
  },
  "sales": {
    "count": 8,
    "details": [
      {
        "amount": 72920,
        "sale_id": "sale-001",
        "commission": 5834
      }
    ],
    "total_amount": 156250
  },
  "status": "paid",
  "created_at": "2025-06-23T21:18:05.067Z",
  "updated_at": "2025-06-23T21:18:05.067Z"
}
```

### customers

Customer management

**Endpoints:**
- GET /items/customers
- GET /items/customers/:id
- POST /items/customers
- PATCH /items/customers/:id
- DELETE /items/customers/:id

**Campos (16):**
- `id` (integer)
- `first_name` (string)
- `last_name` (string)
- `email` (string)
- `phone` (string)
- `address` (text)
- `city` (string)
- `state` (string)
- `zip_code` (string)
- `country` (string)
- `type` (string)
- `vip` (boolean)
- `credit_limit` (decimal)
- `notes` (text)
- `created_at` (dateTime)
- `updated_at` (dateTime)

### employees

Migrated from PostgreSQL table: employees

**Endpoints:**
- GET /items/employees
- GET /items/employees/:id
- POST /items/employees
- PATCH /items/employees/:id
- DELETE /items/employees/:id

**Campos (13):**
- `id` (integer)
- `employee_code` (string) *requerido* - Employee code
- `first_name` (string) *requerido* - First name
- `last_name` (string) *requerido* - Last name
- `email` (string) *requerido* - Email address
- `phone` (string) - Phone number
- `position` (string) - Position
- `department` (string) - Department
- `hire_date` (date) - Hire date
- `salary` (decimal) - Salary
- `active` (boolean) - Active employee$1
- `created_at` (dateTime)
- `updated_at` (dateTime)

**Datos de ejemplo:**
```json
{
  "id": 1,
  "employee_code": "EMP001",
  "first_name": "Luis",
  "last_name": "Hernández García",
  "email": "luis.hernandez@empresa.com",
  "phone": "555-1111111",
  "position": "Gerente de Ventas",
  "department": "sales",
  "hire_date": "2020-01-15",
  "salary": "45000.00",
  "active": true,
  "created_at": "2025-06-24T15:31:02",
  "updated_at": null
}
```

### evaluations

Migrated from PostgreSQL table: evaluations

**Endpoints:**
- GET /items/evaluations
- GET /items/evaluations/:id
- POST /items/evaluations
- PATCH /items/evaluations/:id
- DELETE /items/evaluations/:id

**Campos (17):**
- `id` (string) *requerido*
- `customer_id` (string) *requerido*
- `mattress` (json) *requerido*
- `photos` (json)
- `ai_evaluation` (json)
- `credit_approved` (decimal)
- `status` (string) *requerido*
- `employee_id` (string)
- `store_id` (string)
- `coupon_code` (string)
- `shopify_price_rule_id` (string)
- `shopify_discount_code_id` (string)
- `customer_info` (json)
- `created_at` (timestamp)
- `expires_at` (timestamp)
- `redeemed_at` (timestamp)
- `updated_at` (timestamp)

### new_customers

Base de datos de clientes (nueva versión)

**Endpoints:**
- GET /items/new_customers
- GET /items/new_customers/:id
- POST /items/new_customers
- PATCH /items/new_customers/:id
- DELETE /items/new_customers/:id

**Campos (16):**
- `id` (integer)
- `first_name` (string) *requerido*
- `last_name` (string) *requerido*
- `email` (string) *requerido*
- `phone` (string)
- `address` (text)
- `city` (string)
- `state` (string)
- `zip_code` (string)
- `country` (string)
- `type` (string)
- `vip` (boolean)
- `credit_limit` (decimal)
- `notes` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Datos de ejemplo:**
```json
{
  "id": 1,
  "first_name": "Ana",
  "last_name": "García",
  "email": "ana.garcia@email.com",
  "phone": "555-1234",
  "address": null,
  "city": "Ciudad de México",
  "state": null,
  "zip_code": null,
  "country": null,
  "type": "individual",
  "vip": true,
  "credit_limit": "50000.00",
  "notes": null,
  "created_at": "2025-06-24T15:16:19.886Z",
  "updated_at": null
}
```

### new_employees

Registro de empleados (nueva versión)

**Endpoints:**
- GET /items/new_employees
- GET /items/new_employees/:id
- POST /items/new_employees
- PATCH /items/new_employees/:id
- DELETE /items/new_employees/:id

**Campos (12):**
- `id` (integer)
- `employee_code` (string) *requerido*
- `first_name` (string) *requerido*
- `last_name` (string) *requerido*
- `email` (string) *requerido*
- `phone` (string)
- `position` (string)
- `department` (string)
- `hire_date` (date)
- `salary` (decimal)
- `active` (boolean)
- `created_at` (timestamp)

**Datos de ejemplo:**
```json
{
  "id": 1,
  "employee_code": "EMP001",
  "first_name": "Luis",
  "last_name": "Hernández",
  "email": "luis.h@empresa.com",
  "phone": null,
  "position": "Gerente de Ventas",
  "department": "sales",
  "hire_date": "2020-01-15",
  "salary": "35000.00",
  "active": true,
  "created_at": "2025-06-24T15:16:20.267Z"
}
```

### new_products

Catálogo de productos (nueva versión)

**Endpoints:**
- GET /items/new_products
- GET /items/new_products/:id
- POST /items/new_products
- PATCH /items/new_products/:id
- DELETE /items/new_products/:id

**Campos (11):**
- `id` (integer)
- `name` (string) *requerido*
- `description` (text)
- `sku` (string)
- `price` (decimal)
- `cost` (decimal)
- `stock` (integer)
- `category` (string)
- `active` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Datos de ejemplo:**
```json
{
  "id": 1,
  "name": "Laptop Pro 15\"",
  "description": "Laptop de alto rendimiento",
  "sku": "LAP-001",
  "price": "25999.99",
  "cost": "18000.00",
  "stock": 10,
  "category": "electronics",
  "active": true,
  "created_at": "2025-06-24T15:16:19.648Z",
  "updated_at": null
}
```

### payment_links

Migrated from PostgreSQL table: payment_links

**Endpoints:**
- GET /items/payment_links
- GET /items/payment_links/:id
- POST /items/payment_links
- PATCH /items/payment_links/:id
- DELETE /items/payment_links/:id

**Campos (11):**
- `id` (string) *requerido*
- `name` (string)
- `description` (text)
- `amount` (decimal)
- `currency` (string)
- `stripe_link_id` (string)
- `stripe_link_url` (string)
- `active` (boolean)
- `metadata` (json)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Datos de ejemplo:**
```json
{
  "id": "link-001",
  "name": "Colchón Queen - Roberto Hernández",
  "description": "Pago completo por Colchón Elite Memory Foam Queen",
  "amount": "44080.00",
  "currency": "MXN",
  "stripe_link_id": "plink_1O123456789abcdef",
  "stripe_link_url": "https://buy.stripe.com/test_14k123456789abc",
  "active": false,
  "metadata": {
    "paid": true,
    "order": "ORD-2024-0003",
    "customer": "cust-004"
  },
  "created_at": "2025-06-23T21:18:50.779Z",
  "updated_at": "2025-06-23T21:18:50.779Z"
}
```

### permissions

Migrated from PostgreSQL table: permissions

**Endpoints:**
- GET /items/permissions
- GET /items/permissions/:id
- POST /items/permissions
- PATCH /items/permissions/:id
- DELETE /items/permissions/:id

**Campos (7):**
- `id` (string) *requerido*
- `role_id` (string) *requerido*
- `resource` (string) *requerido*
- `action` (string) *requerido*
- `allowed` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Datos de ejemplo:**
```json
{
  "id": "perm-001",
  "role_id": "agent",
  "resource": "sales",
  "action": "create",
  "allowed": true,
  "created_at": "2025-06-23T21:13:27.054Z",
  "updated_at": "2025-06-23T21:13:27.054Z"
}
```

### products

Migrated from PostgreSQL table: products

**Endpoints:**
- GET /items/products
- GET /items/products/:id
- POST /items/products
- PATCH /items/products/:id
- DELETE /items/products/:id

**Campos (11):**
- `id` (integer)
- `name` (string) *requerido* - Product name
- `description` (text) - Product description
- `sku` (string) - Stock Keeping Unit
- `price` (decimal) - Sale price
- `cost` (decimal) - Cost price
- `stock` (integer) - Available stock
- `category` (string) - Product category
- `active` (boolean) - Is product active$1
- `created_at` (dateTime)
- `updated_at` (dateTime)

**Datos de ejemplo:**
```json
{
  "id": 1,
  "name": "Laptop Dell XPS 15",
  "description": "Laptop de alto rendimiento con Intel i7",
  "sku": "LAP-DELL-001",
  "price": "25999.99",
  "cost": "18000.00",
  "stock": 15,
  "category": "electronics",
  "active": true,
  "created_at": "2025-06-24T15:30:38",
  "updated_at": null
}
```

### sales

Migrated from PostgreSQL table: sales

**Endpoints:**
- GET /items/sales
- GET /items/sales/:id
- POST /items/sales
- PATCH /items/sales/:id
- DELETE /items/sales/:id

**Campos (13):**
- `id` (integer)
- `sale_number` (string) *requerido* - Sale number
- `customer_id` (integer) - Customer
- `sale_date` (dateTime) - Sale date
- `status` (string) - Status
- `subtotal` (decimal) - Subtotal
- `tax` (decimal) - Tax
- `discount` (decimal) - Discount
- `total` (decimal) - Total
- `payment_method` (string) - Payment method
- `notes` (text) - Notes
- `created_at` (dateTime)
- `updated_at` (dateTime)

**Datos de ejemplo:**
```json
{
  "id": 1,
  "sale_number": "VNT-2024-001",
  "customer_id": 1,
  "sale_date": "2024-01-15T10:30:00",
  "status": "delivered",
  "subtotal": "25999.99",
  "tax": "4159.99",
  "discount": "0.00",
  "total": "30159.98",
  "payment_method": "credit_card",
  "notes": "Venta de laptop Dell XPS 15",
  "created_at": "2025-06-24T15:31:13",
  "updated_at": null
}
```

### scripts

Migrated from PostgreSQL table: scripts

**Endpoints:**
- GET /items/scripts
- GET /items/scripts/:id
- POST /items/scripts
- PATCH /items/scripts/:id
- DELETE /items/scripts/:id

**Campos (12):**
- `id` (string) *requerido*
- `name` (string) *requerido*
- `category` (string)
- `type` (string) *requerido*
- `content` (text) *requerido*
- `variables` (json)
- `triggers` (json)
- `effectiveness_score` (decimal)
- `usage_count` (integer)
- `created_by` (string)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Datos de ejemplo:**
```json
{
  "id": "script-001",
  "name": "Script Venta Colchón King",
  "category": "ventas",
  "type": "sales",
  "content": "Buenos días/tardes, mi nombre es {agent_name} de SleepPlus. ¿Cómo está usted {customer_name}$1 Le llamo porque tenemos una promoción especial en colchones King Size...",
  "variables": {
    "discount": "number",
    "agent_name": "string",
    "customer_name": "string"
  },
  "triggers": null,
  "effectiveness_score": "85.50",
  "usage_count": 245,
  "created_by": null,
  "created_at": "2025-06-24T15:45:01.761Z",
  "updated_at": null
}
```

### shopify_coupons

Migrated from PostgreSQL table: shopify_coupons

**Endpoints:**
- GET /items/shopify_coupons
- GET /items/shopify_coupons/:id
- POST /items/shopify_coupons
- PATCH /items/shopify_coupons/:id
- DELETE /items/shopify_coupons/:id

**Campos (12):**
- `id` (string) *requerido*
- `code` (string) *requerido*
- `description` (text)
- `discount_type` (string)
- `discount_value` (decimal)
- `minimum_amount` (decimal)
- `usage_limit` (integer)
- `usage_count` (integer)
- `expires_at` (timestamp)
- `active` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Datos de ejemplo:**
```json
{
  "id": "coupon-001",
  "code": "BLACKFRIDAY2024",
  "description": "Black Friday 40% OFF - Válido del 20 al 30 de noviembre",
  "discount_type": "percentage",
  "discount_value": "40.00",
  "minimum_amount": "20000.00",
  "usage_limit": 100,
  "usage_count": 45,
  "expires_at": "2024-11-30T23:59:59.000Z",
  "active": true,
  "created_at": "2025-06-23T21:17:26.450Z",
  "updated_at": "2025-06-23T21:17:26.450Z"
}
```

### shopify_customers

Migrated from PostgreSQL table: shopify_customers

**Endpoints:**
- GET /items/shopify_customers
- GET /items/shopify_customers/:id
- POST /items/shopify_customers
- PATCH /items/shopify_customers/:id
- DELETE /items/shopify_customers/:id

**Campos (19):**
- `id` (string) *requerido*
- `shopify_id` (string)
- `email` (string)
- `first_name` (string)
- `last_name` (string)
- `phone` (string)
- `total_spent` (decimal)
- `orders_count` (integer)
- `accepts_marketing` (boolean)
- `marketing_opt_in_level` (string)
- `tags` (text)
- `note` (text)
- `verified_email` (boolean)
- `tax_exempt` (boolean)
- `addresses` (json)
- `default_address` (json)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `sync_status` (string)

**Datos de ejemplo:**
```json
{
  "id": "shop-cust-001",
  "shopify_id": "6789012345",
  "email": "maria.gonzalez@email.com",
  "first_name": "María",
  "last_name": "González",
  "phone": "+52 555 123 4567",
  "total_spent": "12500.00",
  "orders_count": 3,
  "accepts_marketing": true,
  "marketing_opt_in_level": null,
  "tags": null,
  "note": null,
  "verified_email": true,
  "tax_exempt": false,
  "addresses": null,
  "default_address": null,
  "created_at": null,
  "updated_at": null,
  "sync_status": "pending"
}
```

### shopify_products

Migrated from PostgreSQL table: shopify_products

**Endpoints:**
- GET /items/shopify_products
- GET /items/shopify_products/:id
- POST /items/shopify_products
- PATCH /items/shopify_products/:id
- DELETE /items/shopify_products/:id

**Campos (14):**
- `id` (string) *requerido*
- `shopify_id` (string)
- `title` (string) *requerido*
- `body_html` (text)
- `vendor` (string)
- `product_type` (string)
- `tags` (text)
- `status` (string)
- `variants` (json)
- `options` (json)
- `images` (json)
- `image_url` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Datos de ejemplo:**
```json
{
  "id": "shop-prod-001",
  "shopify_id": "7890123456",
  "title": "Colchón Memory Foam King",
  "body_html": "<p>El mejor colchón memory foam con 5 zonas de confort</p>",
  "vendor": "SleepPlus",
  "product_type": "Colchones",
  "tags": null,
  "status": "active",
  "variants": null,
  "options": null,
  "images": null,
  "image_url": null,
  "created_at": null,
  "updated_at": null
}
```

### shopify_settings

Migrated from PostgreSQL table: shopify_settings

**Endpoints:**
- GET /items/shopify_settings
- GET /items/shopify_settings/:id
- POST /items/shopify_settings
- PATCH /items/shopify_settings/:id
- DELETE /items/shopify_settings/:id

**Campos (12):**
- `id` (string) *requerido*
- `store_name` (string) *requerido*
- `shopify_domain` (string) *requerido*
- `api_key` (string)
- `api_secret_key` (string)
- `access_token` (string)
- `webhook_api_version` (string)
- `is_active` (boolean)
- `last_sync` (timestamp)
- `sync_settings` (json)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Datos de ejemplo:**
```json
{
  "id": "shopify-001",
  "store_name": "Sleep Plus Elite México",
  "shopify_domain": "sleep-plus-elite.myshopify.com",
  "api_key": "shop_api_key_123456",
  "api_secret_key": "shop_api_secret_encrypted_123456",
  "access_token": "shpat_1234567890abcdef_encrypted",
  "webhook_api_version": "2024-01",
  "is_active": true,
  "last_sync": "2025-06-23T20:15:10.052Z",
  "sync_settings": {
    "sync_orders": true,
    "webhook_url": "https://sleep-plus-admin.vercel.app/api/webhooks/shopify",
    "sync_products": true,
    "sync_customers": true
  },
  "created_at": "2025-06-23T21:15:10.052Z",
  "updated_at": "2025-06-23T21:15:10.052Z"
}
```

### stores

Migrated from PostgreSQL table: stores

**Endpoints:**
- GET /items/stores
- GET /items/stores/:id
- POST /items/stores
- PATCH /items/stores/:id
- DELETE /items/stores/:id

**Campos (12):**
- `id` (integer)
- `name` (string) *requerido* - Store name
- `address` (text) - Address
- `city` (string) - City
- `state` (string) - State
- `zip_code` (string) - ZIP Code
- `phone` (string) - Phone
- `email` (string) - Email
- `manager` (string) - Manager
- `active` (boolean) - Active store$1
- `created_at` (dateTime)
- `updated_at` (dateTime)

**Datos de ejemplo:**
```json
{
  "id": 1,
  "name": "Tienda Centro CDMX",
  "address": "Av. Juárez 100, Col. Centro",
  "city": "Ciudad de México",
  "state": "CDMX",
  "zip_code": null,
  "phone": "555-1001001",
  "email": "centro@tiendas.mx",
  "manager": "Ana María González",
  "active": true,
  "created_at": "2025-06-24T15:31:26",
  "updated_at": null
}
```

### stripe_config

Migrated from PostgreSQL table: stripe_config

**Endpoints:**
- GET /items/stripe_config
- GET /items/stripe_config/:id
- POST /items/stripe_config
- PATCH /items/stripe_config/:id
- DELETE /items/stripe_config/:id

**Campos (7):**
- `id` (string) *requerido*
- `publishable_key` (string)
- `secret_key` (string)
- `webhook_secret` (string)
- `active` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Datos de ejemplo:**
```json
{
  "id": "stripe-config-001",
  "publishable_key": "pk_test_51O1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk",
  "secret_key": "sk_test_51O1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk_encrypted",
  "webhook_secret": "whsec_1234567890abcdefghijklmnopqrstuvwxyz",
  "active": true,
  "created_at": "2025-06-23T21:14:42.292Z",
  "updated_at": "2025-06-23T21:14:42.292Z"
}
```

### subscriptions

Migrated from PostgreSQL table: subscriptions

**Endpoints:**
- GET /items/subscriptions
- GET /items/subscriptions/:id
- POST /items/subscriptions
- PATCH /items/subscriptions/:id
- DELETE /items/subscriptions/:id

**Campos (15):**
- `id` (string) *requerido*
- `customer_id` (string)
- `plan` (string) *requerido*
- `status` (string) *requerido*
- `pricing` (json) *requerido*
- `billing` (json) *requerido*
- `services` (json)
- `credits` (json)
- `start_date` (timestamp) *requerido*
- `cancelled_at` (timestamp)
- `paused_at` (timestamp)
- `cancel_reason` (text)
- `sold_by` (string)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Datos de ejemplo:**
```json
{
  "id": "1",
  "customer_id": "1",
  "plan": "elite",
  "status": "active",
  "pricing": {
    "annual": 99.99,
    "monthly": 9.99,
    "currency": "USD"
  },
  "billing": {
    "lastFour": "4242",
    "frequency": "monthly",
    "paymentMethod": "stripe",
    "stripePriceId": "price_example_price_id",
    "nextBillingDate": "2024-07-15T00:00:00Z",
    "stripeCustomerId": "cus_example_customer_id",
    "stripeSubscriptionId": "sub_example_subscription_id"
  },
  "services": {
    "cleaningsUsed": 3,
    "cleaningsTotal": 12,
    "inspectionsUsed": 0,
    "inspectionsTotal": 2,
    "protectionActive": true
  },
  "credits": {
    "used": 200,
    "expiration": "2025-01-15T00:00:00Z",
    "accumulated": 340
  },
  "start_date": "2023-06-15T00:00:00.000Z",
  "cancelled_at": null,
  "paused_at": null,
  "cancel_reason": null,
  "sold_by": "emp-001",
  "created_at": "2023-06-15T00:00:00.000Z",
  "updated_at": "2024-06-11T00:00:00.000Z"
}
```

### system_settings

Migrated from PostgreSQL table: system_settings

**Endpoints:**
- GET /items/system_settings
- GET /items/system_settings/:id
- POST /items/system_settings
- PATCH /items/system_settings/:id
- DELETE /items/system_settings/:id

**Campos (8):**
- `id` (string) *requerido*
- `daily_call_goal` (integer)
- `working_hours` (string)
- `competition_mode` (boolean)
- `auto_assignment` (boolean)
- `settings` (json)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Datos de ejemplo:**
```json
{
  "id": "system-config-001",
  "daily_call_goal": 30,
  "working_hours": "09:00 - 21:00",
  "competition_mode": true,
  "auto_assignment": true,
  "settings": {
    "company": {
      "name": "Sleep Plus Elite & Trade Sleep",
      "tax_rate": 0.16
    },
    "commission": {
      "base_rate": 0.03,
      "bonus_threshold": 100000
    },
    "appointments": {
      "buffer_time": 15,
      "default_duration": 60
    },
    "notifications": {
      "sms_enabled": false,
      "email_enabled": true
    },
    "trade_program": {
      "max_credit": 8000,
      "min_mattress_age": 3
    }
  },
  "created_at": "2025-06-23T21:12:55.816Z",
  "updated_at": "2025-06-23T21:12:55.816Z"
}
```

### test_customers

Clientes de prueba

**Endpoints:**
- GET /items/test_customers
- GET /items/test_customers/:id
- POST /items/test_customers
- PATCH /items/test_customers/:id
- DELETE /items/test_customers/:id

**Campos (9):**
- `id` (uuid)
- `first_name` (string) *requerido*
- `last_name` (string) *requerido*
- `email` (string) *requerido*
- `phone` (string)
- `date_of_birth` (date)
- `vip` (boolean)
- `notes` (text)
- `created_at` (timestamp)

**Datos de ejemplo:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan.perez@example.com",
  "phone": "+52 555 123 4567",
  "date_of_birth": "1985-03-15",
  "vip": true,
  "notes": "Cliente preferencial, ofrecer descuentos especiales",
  "created_at": "2025-06-24T15:06:12.793Z"
}
```

### test_products

Productos de prueba

**Endpoints:**
- GET /items/test_products
- GET /items/test_products/:id
- POST /items/test_products
- PATCH /items/test_products/:id
- DELETE /items/test_products/:id

**Campos (7):**
- `id` (integer)
- `name` (string) *requerido*
- `description` (text)
- `price` (decimal)
- `stock` (integer)
- `active` (boolean)
- `created_at` (timestamp)

**Datos de ejemplo:**
```json
{
  "id": 1,
  "name": "Laptop Gaming Ultra",
  "description": "<p>Laptop de alta gama para gaming con RTX 4090</p>",
  "price": "2499.99",
  "stock": 15,
  "active": true,
  "created_at": "2025-06-24T15:06:12.462Z"
}
```

### todos

Migrated from PostgreSQL table: todos

**Endpoints:**
- GET /items/todos
- GET /items/todos/:id
- POST /items/todos
- PATCH /items/todos/:id
- DELETE /items/todos/:id

**Campos (5):**
- `id` (integer)
- `text` (string) *requerido*
- `completed` (boolean)
- `created_at` (dateTime)
- `updated_at` (dateTime)

**Datos de ejemplo:**
```json
{
  "id": 1,
  "text": "Ejemplo de tarea 1",
  "completed": false,
  "created_at": "2025-06-23T16:16:36",
  "updated_at": "2025-06-23T16:16:36"
}
```

### user_permission_overrides

Migrated from PostgreSQL table: user_permission_overrides

**Endpoints:**
- GET /items/user_permission_overrides
- GET /items/user_permission_overrides/:id
- POST /items/user_permission_overrides
- PATCH /items/user_permission_overrides/:id
- DELETE /items/user_permission_overrides/:id

**Campos (7):**
- `id` (string) *requerido*
- `user_id` (string) *requerido*
- `resource` (string) *requerido*
- `action` (string) *requerido*
- `allowed` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Datos de ejemplo:**
```json
{
  "id": "override-001",
  "user_id": "emp-002",
  "resource": "reports",
  "action": "view_financial",
  "allowed": true,
  "created_at": "2025-06-23T21:26:32.812Z",
  "updated_at": "2025-06-23T21:26:32.812Z"
}
```

### users

Migrated from PostgreSQL table: users

**Endpoints:**
- GET /items/users
- GET /items/users/:id
- POST /items/users
- PATCH /items/users/:id
- DELETE /items/users/:id

**Campos (8):**
- `id` (integer)
- `email` (string) *requerido*
- `password` (string) *requerido*
- `name` (string)
- `role` (string)
- `is_active` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Datos de ejemplo:**
```json
{
  "id": 1,
  "email": "admin@sleepready.com",
  "password": "admin123",
  "name": "Admin User",
  "role": "administrator",
  "is_active": true,
  "created_at": "2025-06-22T21:31:07.843Z",
  "updated_at": "2025-06-22T21:31:07.843Z"
}
```

### webhook_events

Migrated from PostgreSQL table: webhook_events

**Endpoints:**
- GET /items/webhook_events
- GET /items/webhook_events/:id
- POST /items/webhook_events
- PATCH /items/webhook_events/:id
- DELETE /items/webhook_events/:id

**Campos (8):**
- `id` (string) *requerido*
- `webhook_id` (string)
- `event_type` (string)
- `payload` (json)
- `status` (string)
- `response` (json)
- `attempts` (integer)
- `created_at` (timestamp)

**Datos de ejemplo:**
```json
{
  "id": "event-001",
  "webhook_id": "webhook-001",
  "event_type": "order.created",
  "payload": {
    "items": [
      {
        "id": "prod-001",
        "quantity": 1
      }
    ],
    "total": 72920,
    "customer": "cust-001",
    "order_id": "ORD-2024-0001"
  },
  "status": "delivered",
  "response": {
    "body": {
      "success": true,
      "order_synced": true
    },
    "code": 200
  },
  "attempts": 1,
  "created_at": "2025-06-23T21:27:44.408Z"
}
```

### webhooks

Migrated from PostgreSQL table: webhooks

**Endpoints:**
- GET /items/webhooks
- GET /items/webhooks/:id
- POST /items/webhooks
- PATCH /items/webhooks/:id
- DELETE /items/webhooks/:id

**Campos (9):**
- `id` (string) *requerido*
- `name` (string) *requerido*
- `url` (text) *requerido*
- `events` (json) *requerido*
- `headers` (json)
- `active` (boolean)
- `secret` (string)
- `last_triggered` (timestamp)
- `created_at` (timestamp)

**Datos de ejemplo:**
```json
{
  "id": "webhook-001",
  "name": "Notificación Nueva Venta",
  "url": "https://api.sleepplus.com/webhooks/new-sale",
  "events": [
    "sale.created",
    "sale.updated"
  ],
  "headers": null,
  "active": true,
  "secret": null,
  "last_triggered": null,
  "created_at": "2025-06-24T15:45:01.761Z"
}
```

## 👥 Colecciones del Sistema

### directus_users

**Endpoint:** /users
**Descripción:** Usuarios del sistema
**Registros:** 9

### directus_roles

**Endpoint:** /roles
**Descripción:** Roles del sistema
**Registros:** 3

