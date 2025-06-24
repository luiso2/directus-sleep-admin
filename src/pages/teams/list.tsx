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
import { Table, Space, Tag, Input, Avatar, Badge, Tooltip } from "antd";
import { TeamOutlined, CrownOutlined, UserOutlined } from "@ant-design/icons";
import type { Team } from "../../types/directus";

const { Search } = Input;

export const TeamList: React.FC = () => {
  const { tableProps, searchFormProps, sorters } = useTable<Team>({
    resource: "teams",
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

  const getStatusColor = (active: boolean | undefined) => {
    return active ? "success" : "error";
  };

  const getStatusText = (active: boolean | undefined) => {
    return active ? "Activo" : "Inactivo";
  };

  return (
    <List
      headerButtons={
        <CreateButton>Crear Equipo</CreateButton>
      }
      title="Gestión de Equipos"
    >
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Search
            placeholder="Buscar equipos..."
            onSearch={(value) => {
              searchFormProps.onFinish?.({
                search: value,
              });
            }}
            style={{ width: 300 }}
          />
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
          dataIndex="name" 
          title="Nombre del Equipo"
          width={200}
          render={(value, record: Team) => (
            <Space>
              <Avatar 
                icon={<TeamOutlined />} 
                size="small" 
                style={{ backgroundColor: '#764ba2' }}
              />
              <div>
                <div style={{ fontWeight: 500 }}>
                  {value}
                </div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  {record.description || "Sin descripción"}
                </div>
              </div>
            </Space>
          )}
          sorter
        />
        
        <Table.Column 
          dataIndex="leader_id" 
          title="Líder del Equipo"
          width={150}
          render={(value) => (
            <Space>
              <Avatar icon={<CrownOutlined />} size="small" style={{ backgroundColor: '#faad14' }} />
              <span>{value || "Sin asignar"}</span>
            </Space>
          )}
        />
        
        <Table.Column
          dataIndex="members"
          title="Miembros"
          width={120}
          align="center"
          render={(value: string[] | undefined) => {
            const memberCount = value?.length || 0;
            return (
              <Tooltip title={`${memberCount} miembros`}>
                <Badge count={memberCount} style={{ backgroundColor: '#52c41a' }}>
                  <Avatar icon={<UserOutlined />} />
                </Badge>
              </Tooltip>
            );
          }}
        />
        
        <Table.Column
          dataIndex="goals"
          title="Metas Diarias"
          width={200}
          render={(value) => {
            if (!value) return "Sin metas definidas";
            return (
              <Space direction="vertical" size="small">
                <span style={{ fontSize: "12px" }}>
                  Llamadas: {value.daily_calls || 0}
                </span>
                <span style={{ fontSize: "12px" }}>
                  Ventas: {value.daily_sales || 0}
                </span>
              </Space>
            );
          }}
        />
        
        <Table.Column
          dataIndex="active"
          title="Estado"
          width={100}
          align="center"
          render={(value) => (
            <Tag color={getStatusColor(value)}>
              {getStatusText(value)}
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
          render={(_, record: Team) => (
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
