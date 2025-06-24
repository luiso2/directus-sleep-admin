import { DataProvider, HttpError, BaseRecord, DeleteOneParams, DeleteManyParams } from "@refinedev/core";
import queryString from "query-string";

const API_URL = import.meta.env.PROD ? "/api/directus" : import.meta.env.VITE_DIRECTUS_URL;

const getToken = () => {
  return localStorage.getItem("directus_access_token");
};

const isMockToken = (token: string | null) => {
  return token && token.startsWith("mock-token-");
};

const fetcher = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Solo agregar Content-Type si tenemos un body
  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error: HttpError = {
      message: response.statusText,
      statusCode: response.status,
    };
    
    try {
      const data = await response.json();
      error.message = data.errors?.[0]?.message || response.statusText;
    } catch {
      // Si no podemos parsear el JSON, usamos el statusText
    }
    
    throw error;
  }

  return response.json();
};

// Mapeo de nombres de recursos a nombres de colecciones en Directus
const resourceMap: Record<string, string> = {
  // Sistema Directus
  users: "directus_users",
  roles: "directus_roles",
  
  // Entidades principales del negocio
  customers: "customers",
  products: "products",
  sales: "sales",
  calls: "calls",
  tasks: "calls", // Alias para llamadas/tareas
  employees: "employees",
  stores: "stores",
  teams: "stores", // Usar stores como teams por ahora
  
  // Marketing y campañas
  campaigns: "campaigns",
  scripts: "scripts",
  
  // Sistema de citas
  appointments: "appointments",
  evaluations: "evaluations",
  
  // Comisiones y logros
  commissions: "commissions",
  achievements: "achievements",
  
  // Suscripciones y pagos
  subscriptions: "subscriptions",
  payment_links: "payment_links",
  
  // Integraciones
  shopify_products: "shopify_products",
  shopify_customers: "shopify_customers",
  shopify_coupons: "shopify_coupons",
  shopify_settings: "shopify_settings",
  
  // Sistema
  activity_logs: "activity_logs",
  permissions: "permissions",
  user_permission_overrides: "user_permission_overrides",
  system_settings: "system_settings",
  webhooks: "webhooks",
  webhook_events: "webhook_events",
};

const getCollectionName = (resource: string): string => {
  return resourceMap[resource] || resource;
};

// Mock data for demo purposes
const mockData = {
  customers: [
    { id: 1, first_name: "Juan", last_name: "Pérez", email: "juan@example.com", phone: "555-0101", city: "Ciudad de México", type: "individual", vip: false, credit_limit: 10000, created_at: "2024-01-15" },
    { id: 2, first_name: "María", last_name: "García", email: "maria@example.com", phone: "555-0102", city: "Guadalajara", type: "vip", vip: true, credit_limit: 50000, created_at: "2024-02-20" },
    { id: 3, first_name: "Empresa ABC", last_name: "", email: "contacto@abc.com", phone: "555-0103", city: "Monterrey", type: "business", vip: false, credit_limit: 100000, created_at: "2024-03-10" },
  ],
  products: [
    { id: 1, name: "Colchón Ortopédico Premium", sku: "COL-001", price: 12000, category: "colchones", status: "active", stock: 25, created_at: "2024-01-01" },
    { id: 2, name: "Almohada Memory Foam", sku: "ALM-001", price: 800, category: "almohadas", status: "active", stock: 100, created_at: "2024-01-05" },
    { id: 3, name: "Base Ajustable", sku: "BAS-001", price: 8000, category: "bases", status: "active", stock: 15, created_at: "2024-01-10" },
  ],
  sales: [
    { id: 1, sale_number: "VTA-001", sale_date: "2024-06-20", customer_id: 1, status: "delivered", payment_method: "credit_card", subtotal: 12000, tax: 1920, discount: 0, total: 13920 },
    { id: 2, sale_number: "VTA-002", sale_date: "2024-06-21", customer_id: 2, status: "confirmed", payment_method: "cash", subtotal: 16000, tax: 2560, discount: 1000, total: 17560 },
    { id: 3, sale_number: "VTA-003", sale_date: "2024-06-22", customer_id: 3, status: "pending", payment_method: "transfer", subtotal: 20000, tax: 3200, discount: 0, total: 23200 },
  ],
  calls: [
    { id: 1, customer_id: 1, call_date: "2024-06-24", call_type: "follow_up", status: "completed", notes: "Cliente satisfecho con su compra", duration: 15, created_at: "2024-06-24" },
    { id: 2, customer_id: 2, call_date: "2024-06-24", call_type: "complaint", status: "in_progress", notes: "Problema con la entrega", duration: 25, created_at: "2024-06-24" },
    { id: 3, customer_id: 3, call_date: "2024-06-24", call_type: "sales", status: "scheduled", notes: "Llamada programada para cerrar venta", duration: 0, created_at: "2024-06-23" },
  ],
  teams: [
    { id: 1, name: "Ventas Norte", manager: "Ana Martinez", members_count: 12, region: "Norte", status: "active", created_at: "2024-01-01" },
    { id: 2, name: "Ventas Sur", manager: "Carlos Rodriguez", members_count: 8, region: "Sur", status: "active", created_at: "2024-01-01" },
  ],
  campaigns: [
    { id: 1, name: "Verano 2024", type: "seasonal", status: "active", start_date: "2024-06-01", end_date: "2024-08-31", budget: 50000, spent: 25000 },
    { id: 2, name: "Black Friday", type: "promotional", status: "planned", start_date: "2024-11-25", end_date: "2024-11-30", budget: 100000, spent: 0 },
  ],
  directus_users: [
    { id: 1, email: "lbencomo94@gmail.com", first_name: "Luis", last_name: "Bencomo", status: "active", role: { id: 1, name: "Administrator" } },
    { id: 2, email: "ana.martinez@sleepplus.com", first_name: "Ana", last_name: "Martinez", status: "active", role: { id: 2, name: "Manager" } },
    { id: 3, email: "carlos.rodriguez@sleepplus.com", first_name: "Carlos", last_name: "Rodriguez", status: "active", role: { id: 3, name: "Agent" } },
  ],
};

export const directusDataProvider: DataProvider = {
  // Get List
  getList: async ({ resource, pagination, filters, sorters }) => {
    const token = getToken();
    
    // Return mock data for demo purposes when using mock token
    if (isMockToken(token)) {
      const collection = getCollectionName(resource);
      const data = mockData[collection as keyof typeof mockData] || [];
      
      // Apply pagination
      const current = pagination?.current || 1;
      const pageSize = pagination?.pageSize || 10;
      const start = (current - 1) * pageSize;
      const end = start + pageSize;
      
      return {
        data: data.slice(start, end),
        total: data.length,
      };
    }
    const collection = getCollectionName(resource);
    const current = pagination?.current || 1;
    const pageSize = pagination?.pageSize || 10;
    const offset = (current - 1) * pageSize;

    // Construir query params
    const params: any = {
      limit: pageSize,
      offset,
      meta: "total_count,filter_count",
    };

    // Ordenamiento
    if (sorters && sorters.length > 0) {
      const sortFields = sorters.map((s) => {
        return s.order === "desc" ? `-${s.field}` : s.field;
      });
      params.sort = sortFields.join(",");
    }

    // Filtros
    if (filters && filters.length > 0) {
      const filterObj: any = {};
      filters.forEach((filter) => {
        if ("field" in filter) {
          // Manejo especial para búsquedas de texto
          if (filter.operator === "contains") {
            filterObj[filter.field] = { _contains: filter.value };
          } else if (filter.operator === "eq") {
            filterObj[filter.field] = { _eq: filter.value };
          } else if (filter.operator === "ne") {
            filterObj[filter.field] = { _neq: filter.value };
          } else if (filter.operator === "gt") {
            filterObj[filter.field] = { _gt: filter.value };
          } else if (filter.operator === "gte") {
            filterObj[filter.field] = { _gte: filter.value };
          } else if (filter.operator === "lt") {
            filterObj[filter.field] = { _lt: filter.value };
          } else if (filter.operator === "lte") {
            filterObj[filter.field] = { _lte: filter.value };
          } else if (filter.operator === "in") {
            filterObj[filter.field] = { _in: filter.value };
          } else if (filter.operator === "nin") {
            filterObj[filter.field] = { _nin: filter.value };
          } else if (filter.operator === "null") {
            filterObj[filter.field] = { _null: true };
          } else if (filter.operator === "nnull") {
            filterObj[filter.field] = { _nnull: true };
          }
        }
      });
      
      if (Object.keys(filterObj).length > 0) {
        params.filter = JSON.stringify(filterObj);
      }
    }

    // Incluir campos relacionados
    if (resource === "users" || resource === "directus_users") {
      params.fields = "*,role.*";
    }

    const queryStringParams = queryString.stringify(params);
    const { data, meta } = await fetcher(`${API_URL}/items/${collection}?${queryStringParams}`);

    return {
      data: data || [],
      total: meta?.filter_count || meta?.total_count || 0,
    };
  },

  // Get One
  getOne: async ({ resource, id }) => {
    const token = getToken();
    
    // Return mock data for demo purposes when using mock token
    if (isMockToken(token)) {
      const collection = getCollectionName(resource);
      const data = mockData[collection as keyof typeof mockData] || [];
      const item = data.find((item: any) => item.id === Number(id));
      
      if (!item) {
        throw new Error("Item not found");
      }
      
      return {
        data: item,
      };
    }
    const collection = getCollectionName(resource);
    let params = "";
    
    // Incluir campos relacionados para usuarios
    if (resource === "users" || resource === "directus_users") {
      params = "?fields=*,role.*";
    }
    
    const { data } = await fetcher(`${API_URL}/items/${collection}/${id}${params}`);
    
    return {
      data,
    };
  },

  // Create
  create: async ({ resource, variables }) => {
    const token = getToken();
    
    // Return mock response for demo purposes when using mock token
    if (isMockToken(token)) {
      const newItem = {
        id: Date.now(),
        ...variables,
        created_at: new Date().toISOString(),
      };
      
      return {
        data: newItem,
      };
    }
    const collection = getCollectionName(resource);
    const { data } = await fetcher(`${API_URL}/items/${collection}`, {
      method: "POST",
      body: JSON.stringify(variables),
    });

    return {
      data,
    };
  },

  // Update
  update: async ({ resource, id, variables }) => {
    const token = getToken();
    
    // Return mock response for demo purposes when using mock token
    if (isMockToken(token)) {
      return {
        data: {
          id,
          ...variables,
          updated_at: new Date().toISOString(),
        },
      };
    }
    
    const collection = getCollectionName(resource);
    const { data } = await fetcher(`${API_URL}/items/${collection}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(variables),
    });

    return {
      data,
    };
  },

  // Delete One
  deleteOne: async <TData extends BaseRecord = BaseRecord>({ resource, id }: DeleteOneParams) => {
    const token = getToken();
    
    // Return mock response for demo purposes when using mock token
    if (isMockToken(token)) {
      return {
        data: { id } as TData,
      };
    }
    
    const collection = getCollectionName(resource);
    await fetcher(`${API_URL}/items/${collection}/${id}`, {
      method: "DELETE",
    });

    return {
      data: { id } as TData,
    };
  },

  // Get Many
  getMany: async ({ resource, ids }) => {
    const token = getToken();
    
    // Return mock data for demo purposes when using mock token
    if (isMockToken(token)) {
      const collection = getCollectionName(resource);
      const data = mockData[collection as keyof typeof mockData] || [];
      const items = data.filter((item: any) => ids.includes(item.id));
      
      return {
        data: items,
      };
    }
    
    const collection = getCollectionName(resource);
    const params = {
      filter: JSON.stringify({
        id: { _in: ids },
      }),
    };
    
    const queryStringParams = queryString.stringify(params);
    const { data } = await fetcher(`${API_URL}/items/${collection}?${queryStringParams}`);

    return {
      data: data || [],
    };
  },

  // Create Many
  createMany: async ({ resource, variables }) => {
    const token = getToken();
    
    // Return mock response for demo purposes when using mock token
    if (isMockToken(token)) {
      const items = Array.isArray(variables) ? variables : [variables];
      const data = items.map((item, index) => ({
        id: Date.now() + index,
        ...item,
        created_at: new Date().toISOString(),
      }));
      
      return {
        data,
      };
    }
    
    const collection = getCollectionName(resource);
    const { data } = await fetcher(`${API_URL}/items/${collection}`, {
      method: "POST",
      body: JSON.stringify(variables),
    });

    return {
      data,
    };
  },

  // Delete Many
  deleteMany: async <TData extends BaseRecord = BaseRecord>({ resource, ids }: DeleteManyParams) => {
    const token = getToken();
    
    // Return mock response for demo purposes when using mock token
    if (isMockToken(token)) {
      return {
        data: ids.map((id) => ({ id } as TData)),
      };
    }
    
    const collection = getCollectionName(resource);
    await fetcher(`${API_URL}/items/${collection}`, {
      method: "DELETE",
      body: JSON.stringify(ids),
    });

    return {
      data: ids.map((id) => ({ id } as TData)),
    };
  },

  // Update Many
  updateMany: async ({ resource, ids, variables }) => {
    const token = getToken();
    
    // Return mock response for demo purposes when using mock token
    if (isMockToken(token)) {
      const data = ids.map((id) => ({
        id,
        ...variables,
        updated_at: new Date().toISOString(),
      }));
      
      return {
        data,
      };
    }
    
    const collection = getCollectionName(resource);
    const promises = ids.map((id) =>
      fetcher(`${API_URL}/items/${collection}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(variables),
      })
    );

    const results = await Promise.all(promises);
    
    return {
      data: results.map((result) => result.data),
    };
  },

  // Custom
  custom: async ({ url, method, filters, sorters, payload, query, headers }) => {
    const token = getToken();
    
    // Return empty response for demo purposes when using mock token
    if (isMockToken(token)) {
      return {
        data: {},
      };
    }
    let requestUrl = `${API_URL}${url}`;

    // Agregar query params si existen
    if (query) {
      const queryStringParams = queryString.stringify(query);
      requestUrl = `${requestUrl}?${queryStringParams}`;
    }

    const { data } = await fetcher(requestUrl, {
      method,
      headers,
      body: payload ? JSON.stringify(payload) : undefined,
    });

    return {
      data,
    };
  },

  // Get API URL
  getApiUrl: () => {
    return API_URL;
  },
};

// Función helper para obtener estadísticas
export const getStats = async (endpoint: string, params?: any) => {
  const queryStringParams = params ? `?${queryString.stringify(params)}` : "";
  return fetcher(`${API_URL}${endpoint}${queryStringParams}`);
};
