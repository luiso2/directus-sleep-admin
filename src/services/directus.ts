import { DataProvider } from "@refinedev/core";
import { createDirectus, rest, staticToken } from "@directus/sdk";
import axios from "axios";

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL;
const DIRECTUS_TOKEN = import.meta.env.VITE_DIRECTUS_TOKEN;

// Configuración del cliente de Directus
export const directusClient = createDirectus(DIRECTUS_URL)
  .with(staticToken(DIRECTUS_TOKEN))
  .with(rest());

// Configuración de Axios para Directus
const axiosInstance = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    Authorization: `Bearer ${DIRECTUS_TOKEN}`,
    "Content-Type": "application/json",
  },
});

// Implementación del DataProvider para Refine
export const directusDataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters, sorters }) => {
    const current = pagination?.current || 1;
    const pageSize = pagination?.pageSize || 10;
    const offset = (current - 1) * pageSize;
    
    let params: any = {
      limit: pageSize,
      offset: offset,
      meta: "total_count",
    };

    // Aplicar filtros
    if (filters && filters.length > 0) {
      const filterObj: any = {};
      filters.forEach((filter) => {
        if (filter.operator === "eq") {
          filterObj[filter.field] = { _eq: filter.value };
        } else if (filter.operator === "contains") {
          filterObj[filter.field] = { _contains: filter.value };
        }
      });
      params.filter = filterObj;
    }

    // Aplicar ordenamiento
    if (sorters && sorters.length > 0) {
      params.sort = sorters.map((sorter) => 
        sorter.order === "asc" ? sorter.field : `-${sorter.field}`
      );
    }

    try {
      const { data } = await axiosInstance.get(`/items/${resource}`, { params });
      
      return {
        data: data.data,
        total: data.meta?.total_count || 0,
      };
    } catch (error) {
      console.error("Error fetching list:", error);
      throw error;
    }
  },

  getOne: async ({ resource, id }) => {
    try {
      const { data } = await axiosInstance.get(`/items/${resource}/${id}`);
      return { data: data.data };
    } catch (error) {
      console.error("Error fetching one:", error);
      throw error;
    }
  },

  create: async ({ resource, variables }) => {
    try {
      const { data } = await axiosInstance.post(`/items/${resource}`, variables);
      return { data: data.data };
    } catch (error) {
      console.error("Error creating:", error);
      throw error;
    }
  },

  update: async ({ resource, id, variables }) => {
    try {
      const { data } = await axiosInstance.patch(`/items/${resource}/${id}`, variables);
      return { data: data.data };
    } catch (error) {
      console.error("Error updating:", error);
      throw error;
    }
  },

  deleteOne: async ({ resource, id }) => {
    try {
      await axiosInstance.delete(`/items/${resource}/${id}`);
      return { data: { id } };
    } catch (error) {
      console.error("Error deleting:", error);
      throw error;
    }
  },

  getApiUrl: () => DIRECTUS_URL,

  custom: async ({ url, method, payload }) => {
    try {
      const { data } = await axiosInstance({
        url,
        method,
        data: payload,
      });
      return { data };
    } catch (error) {
      console.error("Error in custom request:", error);
      throw error;
    }
  },
};

// Funciones auxiliares para operaciones específicas
export const directusService = {
  // Obtener colecciones
  getCollections: async () => {
    try {
      const { data } = await axiosInstance.get("/collections");
      return data.data;
    } catch (error) {
      console.error("Error fetching collections:", error);
      throw error;
    }
  },

  // Obtener campos de una colección
  getFields: async (collection: string) => {
    try {
      const { data } = await axiosInstance.get(`/fields/${collection}`);
      return data.data;
    } catch (error) {
      console.error("Error fetching fields:", error);
      throw error;
    }
  },

  // Operaciones batch
  batchCreate: async (collection: string, items: any[]) => {
    try {
      const { data } = await axiosInstance.post(`/items/${collection}`, items);
      return data.data;
    } catch (error) {
      console.error("Error in batch create:", error);
      throw error;
    }
  },

  // Operaciones con relaciones
  getWithRelations: async (collection: string, id: string, fields: string[]) => {
    try {
      const { data } = await axiosInstance.get(`/items/${collection}/${id}`, {
        params: {
          fields: fields.join(","),
        },
      });
      return data.data;
    } catch (error) {
      console.error("Error fetching with relations:", error);
      throw error;
    }
  },
};
