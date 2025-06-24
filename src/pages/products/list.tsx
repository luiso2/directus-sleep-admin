import React from "react";
import {
  List,
  useTable,
  getDefaultSortOrder,
  EditButton,
  ShowButton,
  DeleteButton,
  CreateButton,
} from "@refinedev/antd";
import { Table, Space, Tag, Input, Select, InputNumber, Switch } from "antd";
import { ShoppingOutlined, WarningOutlined, CheckCircleOutlined } from "@ant-design/icons";
import type { Product } from "../../types/directus";

const { Search } = Input;

export const ProductList: React.FC = () => {
  const { tableProps, searchFormProps, sorters } = useTable<Product>({
    resource: "products",
    sorters: {
      initial: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
  });

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case "electronics":
        return "blue";
      case "colchones":
        return "green";
      case "bases":
        return "orange";
      case "almohadas":
        return "purple";
      case "accesorios":
        return "cyan";
      default:
        return "default";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category?.toLowerCase()) {
      case "electronics":
        return "Electrónicos";
      case "colchones":
        return "Colchones";
      case "bases":
        return "Bases";
      case "almohadas":
        return "Almohadas";
      case "accesorios":
        return "Accesorios";
      default:
        return category || "Sin categoría";
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "$0";
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const getStockStatus = (stock: number | undefined) => {
    if (!stock || stock === 0) {
      return { color: "error", icon: <WarningOutlined />, text: "Agotado" };
    } else if (stock < 10) {
      return { color: "warning", icon: <WarningOutlined />, text: "Stock bajo" };
    } else {
      return { color: "success", icon: <CheckCircleOutlined />, text: "Disponible" };
    }
  };

  return (
    <List
      headerButtons={
        <CreateButton>Agregar Producto</CreateButton>
      }
      title="Gestión de Productos"
    >
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Search
            placeholder="Buscar productos..."
            onSearch={(value) => {
              searchFormProps.onFinish?.({
                search: value,
              });
            }}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filtrar por categoría"
            style={{ width: 200 }}
            allowClear
            onChange={(value) => {
              searchFormProps.onFinish?.({
                category: value,
              });
            }}
          >
            <Select.Option value="colchones">Colchones</Select.Option>
            <Select.Option value="bases">Bases</Select.Option>
            <Select.Option value="almohadas">Almohadas</Select.Option>
            <Select.Option value="accesorios">Accesorios</Select.Option>
            <Select.Option value="electronics">Electrónicos</Select.Option>
          </Select>
          <Select
            placeholder="Estado"
            style={{ width: 150 }}
            allowClear
            onChange={(value) => {
              searchFormProps.onFinish?.({
                active: value,
              });
            }}
          >
            <Select.Option value={true}>Activos</Select.Option>
            <Select.Option value={false}>Inactivos</Select.Option>
          </Select>
        </Space>
      </div>

      <Table {...tableProps} rowKey="id" scroll={{ x: 1400 }}>
        <Table.Column
          dataIndex="id"
          title="ID"
          width={80}
          sorter
        />
        
        <Table.Column 
          dataIndex="name" 
          title="Producto"
          width={250}
          render={(value, record: Product) => (
            <Space>
              <ShoppingOutlined />
              <div>
                <div style={{ fontWeight: 500 }}>{value}</div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  SKU: {record.sku || "Sin SKU"}
                </div>
              </div>
            </Space>
          )}
          sorter
        />
        
        <Table.Column
          dataIndex="category"
          title="Categoría"
          width={120}
          render={(value) => (
            <Tag color={getCategoryColor(value)}>
              {getCategoryLabel(value)}
            </Tag>
          )}
          sorter
        />
        
        <Table.Column
          dataIndex="price"
          title="Precio"
          width={120}
          align="right"
          render={(value) => (
            <span style={{ fontWeight: 500, color: "#52c41a" }}>
              {formatCurrency(value)}
            </span>
          )}
          sorter
        />
        
        <Table.Column
          dataIndex="cost"
          title="Costo"
          width={120}
          align="right"
          render={(value) => (
            <span style={{ color: "#ff4d4f" }}>
              {formatCurrency(value)}
            </span>
          )}
          sorter
        />
        
        <Table.Column
          dataIndex="stock"
          title="Stock"
          width={120}
          align="center"
          render={(value) => {
            const status = getStockStatus(value);
            return (
              <Space>
                <Tag color={status.color} icon={status.icon}>
                  {value || 0}
                </Tag>
              </Space>
            );
          }}
          sorter
        />
        
        <Table.Column
          dataIndex="active"
          title="Estado"
          width={100}
          align="center"
          render={(value) => (
            <Tag color={value ? "success" : "error"}>
              {value ? "Activo" : "Inactivo"}
            </Tag>
          )}
          sorter
        />
        
        <Table.Column
          dataIndex="created_at"
          title="Creado"
          width={120}
          render={(value) => {
            if (!value) return "-";
            return new Date(value).toLocaleDateString("es-MX");
          }}
          sorter
        />
        
        <Table.Column
          title="Acciones"
          dataIndex="actions"
          fixed="right"
          width={120}
          render={(_, record: Product) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
              <EditButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
