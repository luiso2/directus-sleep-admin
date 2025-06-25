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
import { Table, Space, Tag, Input, Select, Progress, Tooltip } from "antd";
import { 
  MailOutlined, 
  MessageOutlined, 
  PhoneOutlined, 
  GlobalOutlined, 
  DollarOutlined,
  CalendarOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import type { Campaign } from "../../types/directus";

const { Search } = Input;

export const CampaignList: React.FC = () => {
  const { tableProps, searchFormProps, sorters } = useTable<Campaign>({
    resource: "campaigns",
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

  const getCampaignTypeIcon = (type: string | undefined) => {
    switch (type) {
      case 'email':
        return <MailOutlined />;
      case 'sms':
        return <MessageOutlined />;
      case 'phone':
        return <PhoneOutlined />;
      case 'social':
        return <GlobalOutlined />;
      case 'paid_ads':
        return <DollarOutlined />;
      default:
        return <GlobalOutlined />;
    }
  };

  const getCampaignTypeLabel = (type: string | undefined) => {
    switch (type) {
      case 'email':
        return 'Email';
      case 'sms':
        return 'SMS';
      case 'phone':
        return 'Llamadas';
      case 'social':
        return 'Redes Sociales';
      case 'paid_ads':
        return 'Anuncios Pagados';
      default:
        return type || 'Otro';
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'draft':
        return <ClockCircleOutlined />;
      case 'active':
        return <PlayCircleOutlined />;
      case 'paused':
        return <PauseCircleOutlined />;
      case 'completed':
        return <CheckCircleOutlined />;
      case 'cancelled':
        return <CloseCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'active':
        return 'processing';
      case 'paused':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string | undefined) => {
    switch (status) {
      case 'draft':
        return 'Borrador';
      case 'active':
        return 'Activa';
      case 'paused':
        return 'Pausada';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status || 'Sin estado';
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "Sin presupuesto";
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const calculateProgress = (startDate: string | Date | undefined, endDate: string | Date | undefined) => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end - start;
    const elapsed = now - start;
    
    return Math.round((elapsed / total) * 100);
  };

  return (
    <List
      headerButtons={
        <CreateButton>Crear Campaña</CreateButton>
      }
      title="Gestión de Campañas"
    >
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Search
            placeholder="Buscar campañas..."
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
            <Select.Option value="email">Email</Select.Option>
            <Select.Option value="sms">SMS</Select.Option>
            <Select.Option value="phone">Llamadas</Select.Option>
            <Select.Option value="social">Redes Sociales</Select.Option>
            <Select.Option value="paid_ads">Anuncios Pagados</Select.Option>
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
            <Select.Option value="draft">Borrador</Select.Option>
            <Select.Option value="active">Activa</Select.Option>
            <Select.Option value="paused">Pausada</Select.Option>
            <Select.Option value="completed">Completada</Select.Option>
            <Select.Option value="cancelled">Cancelada</Select.Option>
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
          title="Campaña"
          width={250}
          render={(value, record: Campaign) => (
            <Space>
              {getCampaignTypeIcon(record.type)}
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
          dataIndex="type" 
          title="Tipo"
          width={150}
          render={(value) => (
            <Tag icon={getCampaignTypeIcon(value)}>
              {getCampaignTypeLabel(value)}
            </Tag>
          )}
          sorter
        />
        
        <Table.Column
          dataIndex="status"
          title="Estado"
          width={120}
          render={(value) => (
            <Tag icon={getStatusIcon(value)} color={getStatusColor(value)}>
              {getStatusLabel(value)}
            </Tag>
          )}
          sorter
        />
        
        <Table.Column
          dataIndex="start_date"
          title="Duración"
          width={200}
          render={(value, record: Campaign) => {
            if (!value) return "Sin fecha de inicio";
            const progress = calculateProgress(value, record.end_date);
            return (
              <div>
                <div style={{ fontSize: "12px", marginBottom: 4 }}>
                  <CalendarOutlined /> {new Date(value).toLocaleDateString("es-MX")} - {record.end_date ? new Date(record.end_date).toLocaleDateString("es-MX") : "Sin fin"}
                </div>
                <Tooltip title={`${progress}% completado`}>
                  <Progress 
                    percent={progress} 
                    size="small" 
                    status={progress === 100 ? "success" : "active"}
                  />
                </Tooltip>
              </div>
            );
          }}
        />
        
        <Table.Column
          dataIndex="budget"
          title="Presupuesto"
          width={150}
          align="right"
          render={(value) => formatCurrency(value)}
          sorter
        />
        
        <Table.Column
          dataIndex="target_audience"
          title="Audiencia"
          width={150}
          render={(value) => value || "No especificada"}
        />
        
        <Table.Column
          dataIndex="created_at"
          title="Creada"
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
          render={(_, record: Campaign) => (
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
