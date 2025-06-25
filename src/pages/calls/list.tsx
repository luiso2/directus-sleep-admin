import React from "react";
import {
  List,
  useTable,
  EditButton,
  ShowButton,
  DeleteButton,
  CreateButton,
} from "@refinedev/antd";
import { useOne } from "@refinedev/core";
import { Table, Space, Tag, Input, Select, DatePicker, Badge, Avatar } from "antd";
import { 
  PhoneOutlined, 
  PhoneFilled,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  PhoneOutlined as PhoneMissedOutlined
} from "@ant-design/icons";
import type { Call, Customer, DirectusUser } from "../../types/directus";
import type { Dayjs } from "dayjs";

const { Search } = Input;
const { RangePicker } = DatePicker;

export const CallList: React.FC = () => {
  const { tableProps, searchFormProps, sorters } = useTable<Call>({
    resource: "calls",
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

  const getCallTypeIcon = (type: string) => {
    switch (type) {
      case "inbound":
        return <PhoneOutlined style={{ color: "#1890ff" }} />;
      case "outbound":
        return <PhoneFilled style={{ color: "#52c41a" }} />;
      case "callback":
        return <PhoneMissedOutlined style={{ color: "#faad14" }} />;
      default:
        return <PhoneOutlined />;
    }
  };

  const getCallTypeLabel = (type: string) => {
    switch (type) {
      case "inbound":
        return "Entrante";
      case "outbound":
        return "Saliente";
      case "callback":
        return "Devolución";
      default:
        return type || "Sin tipo";
    }
  };

  const getCallStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <ClockCircleOutlined />;
      case "in_progress":
        return <LoadingOutlined />;
      case "completed":
        return <CheckCircleOutlined />;
      case "failed":
        return <CloseCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getCallStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "in_progress":
        return "processing";
      case "completed":
        return "success";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  const getCallStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "in_progress":
        return "En Progreso";
      case "completed":
        return "Completada";
      case "failed":
        return "Fallida";
      default:
        return status || "Sin estado";
    }
  };

  const getDispositionColor = (disposition: string) => {
    switch (disposition) {
      case "sale":
        return "success";
      case "callback":
        return "processing";
      case "no_answer":
        return "warning";
      case "not_interested":
        return "error";
      case "busy":
        return "default";
      default:
        return "default";
    }
  };

  const getDispositionLabel = (disposition: string) => {
    switch (disposition) {
      case "sale":
        return "Venta";
      case "callback":
        return "Volver a llamar";
      case "no_answer":
        return "No contesta";
      case "not_interested":
        return "No interesado";
      case "busy":
        return "Ocupado";
      default:
        return disposition || "Sin resultado";
    }
  };

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return "-";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const CustomerCell: React.FC<{ customerId?: string }> = ({ customerId }) => {
    const { data, isLoading } = useOne<Customer>({
      resource: "customers",
      id: customerId || "",
      queryOptions: {
        enabled: !!customerId,
      },
    });

    if (isLoading) return <span>Cargando...</span>;
    if (!data?.data) return <span>-</span>;

    const customer = data.data;
    return (
      <Space>
        <Avatar size="small" icon={<UserOutlined />} />
        <span>
          {customer.first_name} {customer.last_name}
          {customer.vip && <Tag color="gold" style={{ marginLeft: 4 }}>VIP</Tag>}
        </span>
      </Space>
    );
  };

  const AgentCell: React.FC<{ userId?: string }> = ({ userId }) => {
    const { data, isLoading } = useOne<DirectusUser>({
      resource: "directus_users",
      id: userId || "",
      queryOptions: {
        enabled: !!userId,
      },
    });

    if (isLoading) return <span>Cargando...</span>;
    if (!data?.data) return <span>-</span>;

    const user = data.data;
    return (
      <span>
        {user.first_name} {user.last_name}
      </span>
    );
  };

  return (
    <List
      headerButtons={
        <CreateButton>Nueva Llamada/Tarea</CreateButton>
      }
      title="Gestión de Llamadas y Tareas"
    >
      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          <Search
            placeholder="Buscar por notas..."
            onSearch={(value) => {
              searchFormProps.onFinish?.({
                notes: value,
              });
            }}
            style={{ width: 250 }}
          />
          <Select
            placeholder="Tipo de llamada"
            style={{ width: 150 }}
            allowClear
            onChange={(value) => {
              searchFormProps.onFinish?.({
                type: value,
              });
            }}
          >
            <Select.Option value="inbound">Entrante</Select.Option>
            <Select.Option value="outbound">Saliente</Select.Option>
            <Select.Option value="callback">Devolución</Select.Option>
          </Select>
          <Select
            placeholder="Estado"
            style={{ width: 150 }}
            allowClear
            onChange={(value) => {
              searchFormProps.onFinish?.({
                status: value,
              });
            }}
          >
            <Select.Option value="pending">Pendiente</Select.Option>
            <Select.Option value="in_progress">En Progreso</Select.Option>
            <Select.Option value="completed">Completada</Select.Option>
            <Select.Option value="failed">Fallida</Select.Option>
          </Select>
          <Select
            placeholder="Resultado"
            style={{ width: 180 }}
            allowClear
            onChange={(value) => {
              searchFormProps.onFinish?.({
                disposition: value,
              });
            }}
          >
            <Select.Option value="sale">Venta</Select.Option>
            <Select.Option value="callback">Volver a llamar</Select.Option>
            <Select.Option value="no_answer">No contesta</Select.Option>
            <Select.Option value="not_interested">No interesado</Select.Option>
            <Select.Option value="busy">Ocupado</Select.Option>
          </Select>
          <RangePicker
            placeholder={["Fecha inicial", "Fecha final"]}
            onChange={(dates: [Dayjs | null, Dayjs | null] | null) => {
              if (dates) {
                searchFormProps.onFinish?.({
                  created_at_gte: dates[0]?.format("YYYY-MM-DD"),
                  created_at_lte: dates[1]?.format("YYYY-MM-DD"),
                });
              } else {
                searchFormProps.onFinish?.({
                  created_at_gte: undefined,
                  created_at_lte: undefined,
                });
              }
            }}
          />
        </Space>
      </div>

      <Table {...tableProps} rowKey="id" scroll={{ x: 1400 }}>
        <Table.Column
          dataIndex="type"
          title="Tipo"
          width={100}
          render={(value) => (
            <Space>
              {getCallTypeIcon(value)}
              <span>{getCallTypeLabel(value)}</span>
            </Space>
          )}
        />
        
        <Table.Column
          dataIndex="customer_id"
          title="Cliente"
          width={200}
          render={(value) => <CustomerCell customerId={value} />}
        />
        
        <Table.Column
          dataIndex="user_id"
          title="Agente"
          width={150}
          render={(value) => <AgentCell userId={value} />}
        />
        
        <Table.Column
          dataIndex="status"
          title="Estado"
          width={120}
          render={(value) => (
            <Badge status={getCallStatusColor(value) as any} text={
              <Tag color={getCallStatusColor(value)}>
                {getCallStatusIcon(value)} {getCallStatusLabel(value)}
              </Tag>
            } />
          )}
          sorter
        />
        
        <Table.Column
          dataIndex="disposition"
          title="Resultado"
          width={140}
          render={(value) => value ? (
            <Tag color={getDispositionColor(value)}>
              {getDispositionLabel(value)}
            </Tag>
          ) : "-"}
        />
        
        <Table.Column
          dataIndex="duration"
          title="Duración"
          width={100}
          align="center"
          render={(value) => (
            <Space>
              <ClockCircleOutlined />
              {formatDuration(value)}
            </Space>
          )}
          sorter
        />
        
        <Table.Column
          dataIndex="start_time"
          title="Hora de Inicio"
          width={150}
          render={(value) => {
            if (!value) return "-";
            return new Date(value).toLocaleString("es-MX", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });
          }}
          sorter
        />
        
        <Table.Column
          dataIndex="notes"
          title="Notas"
          width={200}
          ellipsis
          render={(value) => value || "-"}
        />
        
        <Table.Column
          title="Acciones"
          dataIndex="actions"
          fixed="right"
          width={120}
          render={(_, record: Call) => (
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
