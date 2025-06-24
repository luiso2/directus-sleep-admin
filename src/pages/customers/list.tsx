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
import { Table, Space, Tag, Input, Select, Avatar } from "antd";
import { UserOutlined, CrownOutlined } from "@ant-design/icons";
import type { Customer } from "../../types/directus";

const { Search } = Input;

export const CustomerList: React.FC = () => {
  const { tableProps, searchFormProps, sorters } = useTable<Customer>({
    resource: "customers",
    sorters: {
      initial: [
        {
          field: "created_at",
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

  const getCustomerTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "vip":
        return "gold";
      case "business":
        return "blue";
      case "individual":
        return "green";
      default:
        return "default";
    }
  };

  const getCustomerTypeLabel = (type: string) => {
    switch (type?.toLowerCase()) {
      case "vip":
        return "VIP";
      case "business":
        return "Empresa";
      case "individual":
        return "Individual";
      default:
        return type || "Sin tipo";
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "Sin límite";
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  return (
    <List
      headerButtons={
        <CreateButton>Agregar Cliente</CreateButton>
      }
      title="Gestión de Clientes"
    >
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Search
            placeholder="Buscar clientes..."
            onSearch={(value) => {
              searchFormProps.onFinish?.({
                search: value,
              });
            }}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filtrar por tipo"
            style={{ width: 200 }}
            allowClear
            onChange={(value) => {
              searchFormProps.onFinish?.({
                type: value,
              });
            }}
          >
            <Select.Option value="individual">Individual</Select.Option>
            <Select.Option value="business">Empresa</Select.Option>
            <Select.Option value="vip">VIP</Select.Option>
          </Select>
          <Select
            placeholder="Solo VIP"
            style={{ width: 150 }}
            allowClear
            onChange={(value) => {
              searchFormProps.onFinish?.({
                vip: value,
              });
            }}
          >
            <Select.Option value={true}>Solo VIP</Select.Option>
            <Select.Option value={false}>No VIP</Select.Option>
          </Select>
        </Space>
      </div>

      <Table {...tableProps} rowKey="id" scroll={{ x: 1200 }}>
        <Table.Column
          dataIndex="id"
          title="ID"
          width={80}
          sorter
        />
        
        <Table.Column 
          dataIndex="first_name" 
          title="Cliente"
          width={200}
          render={(value, record: Customer) => (
            <Space>
              <Avatar icon={<UserOutlined />} size="small" />
              <div>
                <div style={{ fontWeight: 500 }}>
                  {`${value || ""} ${record.last_name || ""}`}
                  {record.vip && <CrownOutlined style={{ color: "gold", marginLeft: 8 }} />}
                </div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  {record.email}
                </div>
              </div>
            </Space>
          )}
          sorter
        />
        
        <Table.Column 
          dataIndex="phone" 
          title="Teléfono"
          width={150}
          render={(value) => value || "Sin teléfono"}
        />
        
        <Table.Column
          dataIndex="city"
          title="Ciudad"
          width={120}
          render={(value) => value || "No especificada"}
        />
        
        <Table.Column
          dataIndex="type"
          title="Tipo"
          width={120}
          render={(value) => (
            <Tag color={getCustomerTypeColor(value)}>
              {getCustomerTypeLabel(value)}
            </Tag>
          )}
          sorter
        />
        
        <Table.Column
          dataIndex="vip"
          title="VIP"
          width={80}
          align="center"
          render={(value) => (
            value ? (
              <Tag color="gold">
                <CrownOutlined /> VIP
              </Tag>
            ) : (
              <Tag color="default">Regular</Tag>
            )
          )}
          sorter
        />
        
        <Table.Column
          dataIndex="credit_limit"
          title="Límite de Crédito"
          width={150}
          align="right"
          render={(value) => formatCurrency(value)}
          sorter
        />
        
        <Table.Column
          dataIndex="created_at"
          title="Registrado"
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
          render={(_, record: Customer) => (
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
