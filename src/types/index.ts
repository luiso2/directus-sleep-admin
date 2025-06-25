// Directus Collection Types

export interface ICustomer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  created_at: string;
  updated_at?: string;
}

export interface ISubscription {
  id: string;
  customer_id: string;
  plan_type: "starter" | "premium" | "elite";
  status: "active" | "paused" | "cancelled" | "expired";
  stripe_subscription_id?: string;
  amount: number;
  start_date: string;
  end_date?: string;
  current_period_start?: string;
  current_period_end?: string;
  created_at: string;
  updated_at?: string;
}

export interface IEvaluation {
  id: string;
  customer_id: string;
  mattress_brand: string;
  mattress_model?: string;
  years_of_use: number;
  condition_rating: number;
  has_stains: boolean;
  has_odors: boolean;
  has_bedbugs: boolean;
  has_structural_damage: boolean;
  photos?: string[];
  evaluation_status: "pending" | "in_review" | "approved" | "rejected";
  trade_in_value: number;
  discount_percentage: number;
  coupon_code?: string;
  coupon_generated_at?: string;
  evaluator_notes?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at?: string;
  expires_at?: string;
}

export interface IStripeConfig {
  id: string;
  publishable_key: string;
  secret_key: string;
  webhook_secret: string;
  environment: "test" | "production";
  auto_sync: boolean;
  sync_interval?: number;
  last_sync?: string;
  created_at: string;
  updated_at?: string;
}

export interface IStripePaymentLink {
  id: string;
  name: string;
  plan_type: "starter" | "premium" | "elite";
  amount: number;
  stripe_price_id: string;
  stripe_url: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface IStripeSubscription {
  id: string;
  customer_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan_type: "starter" | "premium" | "elite";
  status: string;
  amount: number;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface IStripeWebhook {
  id: string;
  stripe_event_id: string;
  event_type: string;
  status: "success" | "failed" | "pending";
  payload?: any;
  error_message?: string;
  created_at: string;
}

export interface IShopifySettings {
  id: string;
  shop_domain: string;
  access_token: string;
  webhook_secret?: string;
  auto_sync: boolean;
  sync_interval?: number;
  last_sync?: string;
  created_at: string;
  updated_at?: string;
}

export interface IShopifyProduct {
  id: string;
  shopify_product_id: string;
  title: string;
  description?: string;
  vendor?: string;
  product_type?: string;
  status: "active" | "archived" | "draft";
  variants?: any[];
  images?: any[];
  created_at: string;
  updated_at?: string;
}

export interface IShopifyCoupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed_amount";
  value: number;
  usage_limit?: number;
  usage_count?: number;
  status: "active" | "expired" | "used";
  trade_in_evaluation_id?: string;
  customer_id?: string;
  shopify_price_rule_id?: string;
  shopify_discount_code_id?: string;
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at?: string;
}

export interface IShopifyCustomer {
  id: string;
  shopify_customer_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  total_spent?: number;
  orders_count?: number;
  tags?: string[];
  created_at: string;
  updated_at?: string;
}

export interface ISyncHistory {
  id: string;
  entity_type: "stripe" | "shopify";
  sync_type: "full" | "partial";
  status: "started" | "completed" | "failed";
  records_synced?: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}
