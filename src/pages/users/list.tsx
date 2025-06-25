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
import { Table, Space, Tag, Input, Select } from "antd";
import { useNavigate } from "react-router-dom";

const { Search } = Input;

export const UserList: React.FC = () => {
  const navigate = useNavigate();
  const { tableProps, searchFormProps, sorters } = useTable({
    resource: "directus_users",
    meta: {
      fields: "*,role.*",
    },
    sorters: {
      initial: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
  });

  const getRoleColor = (roleName: string) => {
    switch (roleName?.toLowerCase()) {
      case "admin":
        return "red";
      case "manager":
        return "blue";
      case "agent":
        return "green";
      default:
        return "default";
    }
  };

  const getRoleLabel = (roleName: string) => {
    switch (roleName?.toLowerCase()) {
      case "admin":
        return "Administrador";
      case "manager":
        return "Manager";
      case "agent":
        return "Agente";
      default:
        return roleName || "Sin Rol";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "error";
      case "break":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Activo";
      case "inactive":
        return "Inactivo";
      case "break":
        return "En Descanso";
      default:
        return status || "Desconocido";
    }
  };

  return (
    <List
      headerButtons={
        <CreateButton>Crear Usuario</CreateButton>
      }
      title="Gestión de Usuarios"
    >
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Search
            placeholder="Buscar usuarios..."
            onSearch={(value) => {
              searchFormProps.onFinish?.({
                q: value,
              });
            }}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filtrar por rol"
            style={{ width: 200 }}
            allowClear
            onChange={(value) => {
              searchFormProps.onFinish?.({
                role: value,
              });
            }}
          >
            <Select.Option value="admin">Administrador</Select.Option>
            <Select.Option value="manager">Manager</Select.Option>
            <Select.Option value="agent">Agente</Select.Option>
          </Select>
          <Select
            placeholder="Filtrar por estado"
            style={{ width: 200 }}
            allowClear
            onChange={(value) => {
              searchFormProps.onFinish?.({
                status: value,
              });
            }}
          >
            <Select.Option value="active">Activo</Select.Option>
            <Select.Option value="inactive">Inactivo</Select.Option>
            <Select.Option value="break">En Descanso</Select.Option>
          </Select>
        </Space>
      </div>

      <Table {...tableProps} rowKey="id">
        <Table.Column 
          dataIndex="first_name" 
          title="Nombre"
          render={(value, record: any) => `${value || ""} ${record.last_name || ""}`}
          sorter
        />
        <Table.Column 
          dataIndex="email" 
          title="Email"
          sorter
        />
        <Table.Column 
          dataIndex="phone" 
          title="Teléfono"
        />
        <Table.Column
          dataIndex="role"
          title="Rol"
          render={(value) => (
            <Tag color={getRoleColor(value?.name)}>
              {getRoleLabel(value?.name)}
            </Tag>
          )}
          sorter
        />
        <Table.Column
          dataIndex="status"
          title="Estado"
          render={(value) => (
            <Tag color={getStatusColor(value)}>
              {getStatusLabel(value)}
            </Tag>
          )}
          sorter
        />
        <Table.Column
          dataIndex="daily_goal_calls"
          title="Meta Llamadas"
          align="center"
        />
        <Table.Column
          dataIndex="daily_goal_sales"
          title="Meta Ventas"
          align="center"
        />
        <Table.Column
          dataIndex="commission_rate"
          title="Comisión %"
          align="center"
          render={(value) => value ? `${value}%` : "-"}
        />
        <Table.Column
          title="Acciones"
          dataIndex="actions"
          fixed="right"
          render={(_, record) => (
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
