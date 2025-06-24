// Tipos TypeScript generados automáticamente para Sleep Plus Admin
// Generado el: 6/24/2025
// Basado en la exploración de Directus API

// ==========================================
// TIPOS PRINCIPALES DEL NEGOCIO
// ==========================================

export interface Customer {
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
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface Sale {
  id?: number;
  sale_number: string;
  customer_id?: number;
  sale_date?: Date | string;
  status?: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  subtotal?: number;
  tax?: number;
  discount?: number;
  total?: number;
  payment_method?: 'cash' | 'credit_card' | 'debit_card' | 'transfer' | 'financing';
  notes?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface Call {
  id?: string;
  customer_id?: string;
  user_id?: string;
  type: 'inbound' | 'outbound' | 'callback';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  disposition?: 'sale' | 'callback' | 'no_answer' | 'not_interested' | 'busy';
  duration?: number;
  start_time?: Date | string;
  end_time?: Date | string;
  notes?: string;
  script?: any;
  objections?: any;
  next_action?: any;
  metadata?: any;
  created_at?: Date | string;
}

export interface Product {
  id?: number;
  name: string;
  description?: string;
  sku?: string;
  price?: number;
  cost?: number;
  stock?: number;
  category?: string;
  active?: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface Employee {
  id?: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  hire_date?: Date | string;
  salary?: number;
  active?: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface Store {
  id?: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  manager?: string;
  active?: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}

// ==========================================
// SISTEMA DE CITAS Y EVALUACIONES
// ==========================================

export interface Appointment {
  id?: string;
  customer_id: string;
  store_id?: string;
  employee_id?: string;
  appointment_type: 'consultation' | 'evaluation' | 'delivery' | 'follow_up';
  appointment_date: Date | string;
  duration_minutes?: number;
  status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  symptoms?: any;
  test_results?: any;
  recommendations?: any;
  reminder_sent?: boolean;
  created_by?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface Campaign {
  id?: number;
  name: string;
  description?: string;
  type?: 'email' | 'sms' | 'phone' | 'social' | 'paid_ads';
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  start_date?: Date | string;
  end_date?: Date | string;
  budget?: number;
  target_audience?: string;
  goals?: any;
  metrics?: any;
  created_by?: number;
  created_at?: Date | string;
  updated_at?: Date | string;
}

// ==========================================
// EQUIPOS Y GESTIÓN
// ==========================================

export interface Team {
  id?: string;
  name: string;
  description?: string;
  leader_id?: string;
  members?: string[];
  goals?: {
    daily_calls?: number;
    daily_sales?: number;
    monthly_revenue?: number;
  };
  active?: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}

// ==========================================
// USUARIOS DIRECTUS
// ==========================================

export interface DirectusUser {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  location?: string;
  title?: string;
  description?: string;
  tags?: string[];
  avatar?: string;
  language?: string;
  theme?: 'light' | 'dark' | 'auto';
  tfa_secret?: string;
  status?: 'active' | 'invited' | 'draft' | 'suspended' | 'deleted';
  role?: string | DirectusRole;
  token?: string;
  last_access?: Date | string;
  last_page?: string;
  provider?: string;
  external_identifier?: string;
  auth_data?: any;
  email_notifications?: boolean;
  appearance?: string;
  theme_dark?: string;
  theme_light?: string;
  theme_light_overrides?: any;
  theme_dark_overrides?: any;
  
  // Campos personalizados para Sleep Plus
  phone?: string;
  commission_rate?: number;
  daily_goal_calls?: number;
  daily_goal_sales?: number;
  team_id?: string;
  employee_status?: 'active' | 'inactive' | 'break';
  notes?: string;
}

export interface DirectusRole {
  id?: string;
  name?: string;
  icon?: string;
  description?: string;
  ip_access?: string[];
  enforce_tfa?: boolean;
  admin_access?: boolean;
  app_access?: boolean;
  users?: DirectusUser[];
}

// ==========================================
// TIPOS DE APOYO
// ==========================================

export type UserRole = 'admin' | 'manager' | 'agent';
export type CallStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type CallDisposition = 'sale' | 'callback' | 'no_answer' | 'not_interested' | 'busy';
export type SaleStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';
export type AppointmentType = 'consultation' | 'evaluation' | 'delivery' | 'follow_up';
export type CampaignType = 'email' | 'sms' | 'phone' | 'social' | 'paid_ads';

// ==========================================
// INTERFACES PARA FORMULARIOS
// ==========================================

export interface CreateCustomerForm {
  first_name: string;
  last_name: string;
  email: string;
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

export interface CreateSaleForm {
  sale_number: string;
  customer_id: number;
  sale_date: Date;
  status: SaleStatus;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment_method: string;
  notes?: string;
}

export interface CreateCallForm {
  customer_id: string;
  type: 'inbound' | 'outbound' | 'callback';
  notes?: string;
  script?: any;
}

export interface CreateProductForm {
  name: string;
  description?: string;
  sku?: string;
  price: number;
  cost?: number;
  stock?: number;
  category?: string;
  active: boolean;
}

// ==========================================
// FILTROS Y CONSULTAS
// ==========================================

export interface CustomerFilters {
  search?: string;
  type?: string;
  vip?: boolean;
  city?: string;
  created_after?: Date;
  created_before?: Date;
}

export interface SaleFilters {
  status?: SaleStatus;
  customer_id?: number;
  payment_method?: string;
  date_from?: Date;
  date_to?: Date;
  min_amount?: number;
  max_amount?: number;
}

export interface CallFilters {
  status?: CallStatus;
  disposition?: CallDisposition;
  type?: 'inbound' | 'outbound' | 'callback';
  user_id?: string;
  customer_id?: string;
  date_from?: Date;
  date_to?: Date;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  active?: boolean;
  low_stock?: boolean;
  price_range?: {
    min: number;
    max: number;
  };
}
