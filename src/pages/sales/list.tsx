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
import { Table, Space, Tag, Input, Select, DatePicker, Avatar } from "antd";
import { ShoppingCartOutlined, DollarOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, TruckOutlined } from "@ant-design/icons";
import type { Sale } from "../../types/directus";
import dayjs from "dayjs";

const { Search } = Input;
const { RangePicker } = DatePicker;

export const SaleList: React.FC = () => {
  const { tableProps, searchFormProps, sorters } = useTable<Sale>({
    resource: "sales",
    sorters: {
      initial: [
        {
          field: "sale_date",
          order: "desc",
        },
      ],
    },
    filters: {
      permanent: [
        {
          field: "id",
          operator: "nnull",
          value: undefined,
        },
      ],
    },
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "orange";
      case "confirmed":
        return "blue";
      case "delivered":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <ClockCircleOutlined />;
      case "confirmed":
        return <CheckCircleOutlined />;
      case "delivered":
        return <TruckOutlined />;
      case "cancelled":
        return <CloseCircleOutlined />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "Pendiente";
      case "confirmed":
        return "Confirmada";
      case "delivered":
        return "Entregada";
      case "cancelled":
        return "Cancelada";
      default:
        return status || "Sin estado";
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method?.toLowerCase()) {
      case "cash":
        return "Efectivo";
      case "credit_card":
        return "Tarjeta de Crédito";
      case "debit_card":
        return "Tarjeta de Débito";
      case "transfer":
        return "Transferencia";
      case "financing":
        return "Financiamiento";
      default:
        return method || "No especificado";
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method?.toLowerCase()) {
      case "cash":
        return "green";
      case "credit_card":
        return "blue";
      case "debit_card":
        return "cyan";
      case "transfer":
        return "purple";
      case "financing":
        return "gold";
      default:
        return "default";
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  return (
    <List
      headerButtons={
        <CreateButton>Nueva Venta</CreateButton>
      }
      title="Gestión de Ventas"
    >
      <div style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Space wrap>
            <Search
              placeholder="Buscar por número de venta..."
              onSearch={(value) => {
                searchFormProps.onFinish?.({
                  sale_number: value,
                });
              }}
              style={{ width: 250 }}
            />
            <Select
              placeholder="Estado de venta"
              style={{ width: 180 }}
              allowClear
              onChange={(value) => {
                searchFormProps.onFinish?.({
                  status: value,
                });
              }}
            >
              <Select.Option value="pending">Pendiente</Select.Option>
              <Select.Option value="confirmed">Confirmada</Select.Option>
              <Select.Option value="delivered">Entregada</Select.Option>
              <Select.Option value="cancelled">Cancelada</Select.Option>
            </Select>
            <Select
              placeholder="Método de pago"
              style={{ width: 180 }}
              allowClear
              onChange={(value) => {
                searchFormProps.onFinish?.({
                  payment_method: value,
                });
              }}
            >
              <Select.Option value="cash">Efectivo</Select.Option>
              <Select.Option value="credit_card">Tarjeta de Crédito</Select.Option>
              <Select.Option value="debit_card">Tarjeta de Débito</Select.Option>
              <Select.Option value="transfer">Transferencia</Select.Option>
              <Select.Option value="financing">Financiamiento</Select.Option>
            </Select>
            <RangePicker
              placeholder={["Fecha inicio", "Fecha fin"]}
              onChange={(dates) => {
                searchFormProps.onFinish?.({
                  date_from: dates?.[0]?.toISOString(),
                  date_to: dates?.[1]?.toISOString(),
                });
              }}
            />
          </Space>
        </Space>
      </div>

      <Table {...tableProps} rowKey="id" scroll={{ x: 1400 }}>
        <Table.Column
          dataIndex="sale_number"
          title="# Venta"
          width={120}
          render={(value) => (
            <Space>
              <ShoppingCartOutlined />
              <strong>{value}</strong>
            </Space>
          )}
          sorter
        />
        
        <Table.Column 
          dataIndex="sale_date" 
          title="Fecha"
          width={120}
          render={(value) => {
            if (!value) return "-";
            return dayjs(value).format("DD/MM/YYYY");
          }}
          sorter
        />
        
        <Table.Column 
          dataIndex="customer_id" 
          title="Cliente"
          width={200}
          render={(value) => (
            <Space>
              <Avatar icon={<ShoppingCartOutlined />} size="small" />
              <span>Cliente #{value || "Sin asignar"}</span>
            </Space>
          )}
        />
        
        <Table.Column
          dataIndex="status"
          title="Estado"
          width={120}
          render={(value) => (
            <Tag color={getStatusColor(value)} icon={getStatusIcon(value)}>
              {getStatusLabel(value)}
            </Tag>
          )}
          sorter
        />
        
        <Table.Column
          dataIndex="payment_method"
          title="Método de Pago"
          width={150}
          render={(value) => (
            <Tag color={getPaymentMethodColor(value)}>
              {getPaymentMethodLabel(value)}
            </Tag>
          )}
        />
        
        <Table.Column
          dataIndex="subtotal"
          title="Subtotal"
          width={120}
          align="right"
          render={(value) => formatCurrency(value)}
          sorter
        />
        
        <Table.Column
          dataIndex="tax"
          title="IVA"
          width={100}
          align="right"
          render={(value) => formatCurrency(value)}
        />
        
        <Table.Column
          dataIndex="discount"
          title="Descuento"
          width={100}
          align="right"
          render={(value) => value ? formatCurrency(value) : "-"}
        />
        
        <Table.Column
          dataIndex="total"
          title="Total"
          width={150}
          align="right"
          render={(value) => (
            <strong style={{ fontSize: "16px", color: "#52c41a" }}>
              {formatCurrency(value)}
            </strong>
          )}
          sorter
        />
        
        <Table.Column
          title="Acciones"
          dataIndex="actions"
          fixed="right"
          width={120}
          render={(_, record: Sale) => (
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
