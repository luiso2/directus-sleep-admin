import { message } from "antd";

// Demo data for testing when permissions are not available
export const demoEvaluations = [
  {
    id: "eval_demo_1",
    customer_id: "cust_demo_1",
    mattress_brand: "Sealy",
    mattress_model: "Posturepedic Plus",
    years_of_use: 3,
    condition_rating: 4,
    has_stains: false,
    has_odors: false,
    has_bedbugs: false,
    has_structural_damage: false,
    photos: [],
    evaluation_status: "pending",
    trade_in_value: 150,
    discount_percentage: 15,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "eval_demo_2",
    customer_id: "cust_demo_2",
    mattress_brand: "Tempur-Pedic",
    mattress_model: "Cloud Supreme",
    years_of_use: 5,
    condition_rating: 3,
    has_stains: true,
    has_odors: false,
    has_bedbugs: false,
    has_structural_damage: false,
    photos: [],
    evaluation_status: "approved",
    trade_in_value: 200,
    discount_percentage: 20,
    coupon_code: "TRADEIN20123456",
    coupon_generated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const demoCustomers = [
  {
    id: "cust_demo_1",
    first_name: "María",
    last_name: "García",
    email: "maria.garcia@example.com",
    phone: "+1234567890",
  },
  {
    id: "cust_demo_2",
    first_name: "Juan",
    last_name: "Pérez",
    email: "juan.perez@example.com",
    phone: "+0987654321",
  },
  {
    id: "cust_demo_3",
    first_name: "Ana",
    last_name: "Martínez",
    email: "ana.martinez@example.com",
    phone: "+1122334455",
  },
];

export const handleApiError = (error: any, resourceName: string) => {
  console.error(`Error fetching ${resourceName}:`, error);
  
  if (error.response?.status === 403) {
    message.warning(
      `No tienes permisos para acceder a ${resourceName}. Mostrando datos de demostración.`,
      5
    );
    return true; // Indicates to use demo data
  }
  
  message.error(`Error al cargar ${resourceName}`);
  return false;
};

export const isUsingDemoData = () => {
  const demoMode = localStorage.getItem("demoMode");
  return demoMode === "true";
};

export const setDemoMode = (enabled: boolean) => {
  localStorage.setItem("demoMode", enabled.toString());
};
