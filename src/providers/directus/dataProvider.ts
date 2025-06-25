import { DataProvider, HttpError, BaseRecord, DeleteOneParams, DeleteManyParams } from "@refinedev/core";
import queryString from "query-string";

// Asegurar que no haya espacios en blanco en la URL
const API_URL = import.meta.env.PROD 
  ? "/api/directus" 
  : (import.meta.env.VITE_DIRECTUS_URL || '').trim();

const getToken = () => {
  return localStorage.getItem("directus_access_token");
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
  
  // Entidades principales del negocio - CORREGIDO con nombres reales de las tablas
  customers: "new_customers",
  products: "new_products",
  employees: "new_employees",
  sales: "sales",
  calls: "calls",
  tasks: "calls", // Alias para llamadas/tareas
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
  
  // Integraciones Stripe
  stripe_config: "stripe_config",
  stripe_payment_links: "stripe_payment_links",
  stripe_subscriptions: "stripe_subscriptions",
  stripe_webhooks: "stripe_webhooks",
  
  // Integraciones Shopify
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
  sync_history: "sync_history",
  entity_mappings: "entity_mappings",
};

const getCollectionName = (resource: string): string => {
  return resourceMap[resource] || resource;
};

export const directusDataProvider: DataProvider = {
  // Get List
  getList: async ({ resource, pagination, filters, sorters }) => {
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
