import React from "react";
import { Show, TextField, NumberField, DateField } from "@refinedev/antd";
import { Card, Row, Col, Space, Tag, Avatar, Descriptions, Button, Statistic, Timeline, Badge, Progress, Alert } from "antd";
import { 
  PhoneOutlined, 
  UserOutlined, 
  ClockCircleOutlined,
  CalendarOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  PhoneOutlined as PhoneMissedOutlined,
  FileTextOutlined,
  TeamOutlined,
  TrophyOutlined,
  WarningOutlined
} from "@ant-design/icons";
import { useShow, useNavigation, useOne } from "@refinedev/core";
import type { Call, Customer, DirectusUser } from "../../types/directus";

export const CallShow: React.FC = () => {
  const { query } = useShow<Call>({
    resource: "calls",
  });
  
  const { edit } = useNavigation();
  const call = query?.data?.data;

  // Obtener datos del cliente
  const { data: customerData } = useOne<Customer>({
    resource: "customers",
    id: call?.customer_id || "",
    queryOptions: {
      enabled: !!call?.customer_id,
    },
  });

  // Obtener datos del agente
  const { data: agentData } = useOne<DirectusUser>({
    resource: "directus_users",
    id: call?.user_id || "",
    queryOptions: {
      enabled: !!call?.user_id,
    },
  });

  const customer = customerData?.data;
  const agent = agentData?.data;

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return "00:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const getCallTypeIcon = (type: string) => {
    switch (type) {
      case "inbound":
        return <PhoneOutlined style={{ color: "#1890ff" }} />;
      case "outbound":
        return <PhoneOutlined style={{ color: "#52c41a" }} />;
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

  const getStatusIcon = (status: string) => {
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

  const getStatusColor = (status: string) => {
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

  const getStatusLabel = (status: string) => {
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

  const getDispositionIcon = (disposition: string) => {
    switch (disposition) {
      case "sale":
        return <TrophyOutlined />;
      case "callback":
        return <PhoneMissedOutlined />;
      case "no_answer":
        return <CloseCircleOutlined />;
      case "not_interested":
        return <CloseCircleOutlined />;
      case "busy":
        return <WarningOutlined />;
      default:
        return <PhoneOutlined />;
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

  const getTimelineItems = () => {
    const items = [];
    
    if (call?.created_at) {
      items.push({
        color: "blue",
        children: (
          <div>
            <p>Llamada creada</p>
            <small>{new Date(call.created_at).toLocaleString("es-MX")}</small>
          </div>
        ),
      });
    }

    if (call?.start_time) {
      items.push({
        color: "green",
        children: (
          <div>
            <p>Llamada iniciada</p>
            <small>{new Date(call.start_time).toLocaleString("es-MX")}</small>
          </div>
        ),
      });
    }

    if (call?.end_time) {
      items.push({
        color: call.status === "completed" ? "green" : "red",
        dot: call.status === "completed" ? <CheckCircleOutlined /> : <CloseCircleOutlined />,
        children: (
          <div>
            <p>Llamada {call.status === "completed" ? "completada" : "finalizada"}</p>
            <small>{new Date(call.end_time).toLocaleString("es-MX")}</small>
            <p style={{ fontSize: "12px", marginTop: 4 }}>
              Duración: {formatDuration(call.duration)}
            </p>
          </div>
        ),
      });
    }

    if (call?.disposition === "sale") {
      items.push({
        color: "green",
        dot: <TrophyOutlined />,
        children: (
          <div>
            <p style={{ fontWeight: "bold", color: "#52c41a" }}>¡Venta realizada!</p>
            <small>Cliente interesado en productos</small>
          </div>
        ),
      });
    }

    return items;
  };

  return (
    <Show
      title={
        <Space>
          <Avatar 
            size={64} 
            icon={<PhoneOutlined />} 
            style={{ backgroundColor: "#1890ff" }}
          />
          <div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              Llamada {getCallTypeLabel(call?.type || "")}
            </div>
            <Space>
              <Tag color={getStatusColor(call?.status || "")}>
                {getStatusIcon(call?.status || "")} {getStatusLabel(call?.status || "")}
              </Tag>
              {call?.disposition && (
                <Tag color={getDispositionColor(call.disposition)}>
                  {getDispositionIcon(call.disposition)} {getDispositionLabel(call.disposition)}
                </Tag>
              )}
            </Space>
          </div>
        </Space>
      }
      headerButtons={
        <Button 
          type="primary" 
          icon={<EditOutlined />}
          onClick={() => call && edit("calls", call.id!)}
        >
          Editar Llamada
        </Button>
      }
    >
      <Row gutter={[16, 16]}>
        {/* Estadísticas principales */}
        <Col xs={24} lg={8}>
          <Card bordered={false}>
            <Statistic
              title="Duración Total"
              value={formatDuration(call?.duration)}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card bordered={false}>
            <Statistic
              title="Tipo de Llamada"
              value={getCallTypeLabel(call?.type || "")}
              prefix={getCallTypeIcon(call?.type || "")}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card bordered={false}>
            <Statistic
              title="Resultado"
              value={call?.disposition ? getDispositionLabel(call.disposition) : "Sin resultado"}
              prefix={call?.disposition ? getDispositionIcon(call.disposition) : <PhoneOutlined />}
              valueStyle={{ 
                color: call?.disposition === "sale" ? '#52c41a' : undefined 
              }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* Información del Cliente */}
        <Col xs={24} lg={12}>
          <Card title="Información del Cliente" bordered={false}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Cliente">
                <Space>
                  <UserOutlined />
                  <strong>
                    {customer?.first_name} {customer?.last_name}
                  </strong>
                  {customer?.vip && (
                    <Tag color="gold">VIP</Tag>
                  )}
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Email">
                <a href={`mailto:${customer?.email}`}>{customer?.email || "No disponible"}</a>
              </Descriptions.Item>
              
              <Descriptions.Item label="Teléfono">
                <a href={`tel:${customer?.phone}`}>{customer?.phone || "No disponible"}</a>
              </Descriptions.Item>
              
              <Descriptions.Item label="Tipo de Cliente">
                <Tag>{customer?.type || "No especificado"}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Información del Agente */}
        <Col xs={24} lg={12}>
          <Card title="Información del Agente" bordered={false}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Agente">
                <Space>
                  <TeamOutlined />
                  <strong>
                    {agent?.first_name} {agent?.last_name}
                  </strong>
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Email">
                <a href={`mailto:${agent?.email}`}>{agent?.email || "No disponible"}</a>
              </Descriptions.Item>
              
              <Descriptions.Item label="ID de Usuario">
                <TextField value={call?.user_id} />
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* Línea de tiempo */}
        <Col xs={24} lg={12}>
          <Card title="Línea de Tiempo" bordered={false}>
            <Timeline items={getTimelineItems()} />
          </Card>
        </Col>

        {/* Detalles de la Llamada */}
        <Col xs={24} lg={12}>
          <Card title="Detalles de la Llamada" bordered={false}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="ID de Llamada">
                <TextField value={call?.id} />
              </Descriptions.Item>
              
              <Descriptions.Item label="Hora de Inicio">
                {call?.start_time ? (
                  <DateField value={call.start_time} format="DD/MM/YYYY HH:mm:ss" />
                ) : "-"}
              </Descriptions.Item>
              
              <Descriptions.Item label="Hora de Finalización">
                {call?.end_time ? (
                  <DateField value={call.end_time} format="DD/MM/YYYY HH:mm:ss" />
                ) : "-"}
              </Descriptions.Item>
              
              {call?.script?.used && (
                <Descriptions.Item label="Script Utilizado">
                  <Tag color="blue">{call.script.used}</Tag>
                </Descriptions.Item>
              )}
              
              {call?.objections && Array.isArray(call.objections) && call.objections.length > 0 && (
                <Descriptions.Item label="Objeciones">
                  <Space wrap>
                    {call.objections.map((obj: string, index: number) => (
                      <Tag key={index} color="orange">{obj}</Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
              )}
              
              {call?.next_action && (
                <Descriptions.Item label="Próxima Acción">
                  <div>
                    <Tag color="purple">{call.next_action.type || "Sin definir"}</Tag>
                    {call.next_action.date && (
                      <div style={{ fontSize: "12px", marginTop: 4 }}>
                        Fecha: {new Date(call.next_action.date).toLocaleDateString("es-MX")}
                      </div>
                    )}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Notas */}
      {call?.notes && (
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card 
              title={
                <Space>
                  <FileTextOutlined />
                  Notas y Observaciones
                </Space>
              } 
              bordered={false}
            >
              <div style={{ 
                padding: "16px", 
                backgroundColor: "#fafafa", 
                borderRadius: "6px",
                whiteSpace: "pre-wrap",
                lineHeight: "1.6"
              }}>
                {call.notes}
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Metadata adicional */}
      {call?.metadata && (
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="Información Adicional" bordered={false}>
              <Descriptions column={3} size="small">
                {call.metadata.phone && (
                  <Descriptions.Item label="Teléfono Contactado">
                    <a href={`tel:${call.metadata.phone}`}>{call.metadata.phone}</a>
                  </Descriptions.Item>
                )}
                {call.metadata.campaign && (
                  <Descriptions.Item label="Campaña">
                    <Tag color="blue">{call.metadata.campaign}</Tag>
                  </Descriptions.Item>
                )}
                {call.metadata.sentiment && (
                  <Descriptions.Item label="Sentimiento">
                    <Tag color={
                      call.metadata.sentiment === "positive" ? "success" :
                      call.metadata.sentiment === "negative" ? "error" : "default"
                    }>
                      {call.metadata.sentiment === "positive" ? "Positivo" :
                       call.metadata.sentiment === "negative" ? "Negativo" : "Neutral"}
                    </Tag>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>
        </Row>
      )}

      {/* Alertas según el resultado */}
      {call?.disposition === "callback" && call?.next_action?.date && (
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Alert
              message="Seguimiento Requerido"
              description={`Esta llamada requiere seguimiento. Próxima acción programada para: ${new Date(call.next_action.date).toLocaleDateString("es-MX")}`}
              type="warning"
              showIcon
              icon={<CalendarOutlined />}
            />
          </Col>
        </Row>
      )}

      {call?.disposition === "sale" && (
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Alert
              message="¡Venta Exitosa!"
              description="Esta llamada resultó en una venta. Asegúrese de dar seguimiento al proceso de entrega y satisfacción del cliente."
              type="success"
              showIcon
              icon={<TrophyOutlined />}
            />
          </Col>
        </Row>
      )}
    </Show>
  );
};
