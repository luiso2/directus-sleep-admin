import React from "react";
import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Card, Row, Col, Space, Tag, Statistic, Progress, Timeline, List } from "antd";
import { 
  MailOutlined, 
  MessageOutlined, 
  PhoneOutlined, 
  GlobalOutlined, 
  DollarOutlined,
  CalendarOutlined,
  TeamOutlined,
  AimOutlined,
  BarChartOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  RiseOutlined
} from "@ant-design/icons";
import type { Campaign } from "../../types/directus";

const { Title, Text, Paragraph } = Typography;

export const CampaignShow: React.FC = () => {
  const { queryResult } = useShow<Campaign>();
  const { data, isLoading } = queryResult;
  const record = data?.data;

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
    if (!amount) return "$0";
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

  const calculateDaysRemaining = (endDate: string | Date | undefined) => {
    if (!endDate) return null;
    
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    
    if (diff <= 0) return 0;
    
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const calculatePerformance = (current: number | undefined, expected: number | undefined) => {
    if (!current || !expected || expected === 0) return 0;
    return Math.round((current / expected) * 100);
  };

  return (
    <Show isLoading={isLoading} title="Detalles de la Campaña">
      {record && (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Información General */}
          <Card>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Space direction="vertical" size="small">
                  <Title level={4} style={{ margin: 0 }}>
                    {getCampaignTypeIcon(record.type)} {record.name}
                  </Title>
                  <Text type="secondary">{record.description || "Sin descripción"}</Text>
                  <Space>
                    <Tag icon={getCampaignTypeIcon(record.type)}>
                      {getCampaignTypeLabel(record.type)}
                    </Tag>
                    <Tag icon={getStatusIcon(record.status)} color={getStatusColor(record.status)}>
                      {getStatusLabel(record.status)}
                    </Tag>
                  </Space>
                </Space>
              </Col>
              
              <Col xs={24} sm={12}>
                <Row gutter={[16, 16]}>
                  <Col xs={12}>
                    <Statistic
                      title="Presupuesto"
                      value={record.budget || 0}
                      formatter={(value) => formatCurrency(Number(value))}
                      prefix={<DollarOutlined />}
                    />
                  </Col>
                  <Col xs={12}>
                    <Statistic
                      title="Días Restantes"
                      value={calculateDaysRemaining(record.end_date) || 0}
                      suffix="días"
                      prefix={<CalendarOutlined />}
                      valueStyle={{ 
                        color: calculateDaysRemaining(record.end_date) && calculateDaysRemaining(record.end_date)! <= 7 ? '#ff4d4f' : undefined 
                      }}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>

          {/* Progreso y Duración */}
          <Card
            title={
              <Space>
                <CalendarOutlined />
                <span>Duración de la Campaña</span>
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Row justify="space-between">
                    <Text>
                      <CalendarOutlined /> Inicio: {record.start_date ? new Date(record.start_date).toLocaleDateString("es-MX") : "No definida"}
                    </Text>
                    <Text>
                      <CalendarOutlined /> Fin: {record.end_date ? new Date(record.end_date).toLocaleDateString("es-MX") : "No definida"}
                    </Text>
                  </Row>
                  <Progress 
                    percent={calculateProgress(record.start_date, record.end_date)} 
                    status={calculateProgress(record.start_date, record.end_date) === 100 ? "success" : "active"}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Métricas y Rendimiento */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card
                title={
                  <Space>
                    <AimOutlined />
                    <span>Objetivos</span>
                  </Space>
                }
              >
                {record.goals && (
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {record.goals.description && (
                      <Paragraph>{record.goals.description}</Paragraph>
                    )}
                    <Row gutter={[16, 16]}>
                      <Col xs={8}>
                        <Statistic
                          title="Conversiones"
                          value={record.goals.expected_conversions || 0}
                          prefix={<TrophyOutlined />}
                        />
                      </Col>
                      <Col xs={8}>
                        <Statistic
                          title="Alcance"
                          value={record.goals.expected_reach || 0}
                          prefix={<TeamOutlined />}
                        />
                      </Col>
                      <Col xs={8}>
                        <Statistic
                          title="ROI Esperado"
                          value={record.goals.expected_roi || 0}
                          suffix="%"
                          prefix={<RiseOutlined />}
                        />
                      </Col>
                    </Row>
                  </Space>
                )}
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card
                title={
                  <Space>
                    <BarChartOutlined />
                    <span>Rendimiento Actual</span>
                  </Space>
                }
              >
                {record.metrics && (
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Row gutter={[16, 16]}>
                      <Col xs={8}>
                        <Statistic
                          title="Conversiones"
                          value={record.metrics.current_conversions || 0}
                          prefix={<TrophyOutlined />}
                          valueStyle={{ 
                            color: calculatePerformance(record.metrics.current_conversions, record.goals?.expected_conversions) >= 100 ? '#52c41a' : undefined 
                          }}
                        />
                        <Progress 
                          percent={calculatePerformance(record.metrics.current_conversions, record.goals?.expected_conversions)} 
                          size="small"
                        />
                      </Col>
                      <Col xs={8}>
                        <Statistic
                          title="Alcance"
                          value={record.metrics.current_reach || 0}
                          prefix={<TeamOutlined />}
                          valueStyle={{ 
                            color: calculatePerformance(record.metrics.current_reach, record.goals?.expected_reach) >= 100 ? '#52c41a' : undefined 
                          }}
                        />
                        <Progress 
                          percent={calculatePerformance(record.metrics.current_reach, record.goals?.expected_reach)} 
                          size="small"
                        />
                      </Col>
                      <Col xs={8}>
                        <Statistic
                          title="ROI Actual"
                          value={record.metrics.current_roi || 0}
                          suffix="%"
                          prefix={<RiseOutlined />}
                          valueStyle={{ 
                            color: (record.metrics.current_roi || 0) >= (record.goals?.expected_roi || 0) ? '#52c41a' : '#ff4d4f' 
                          }}
                        />
                      </Col>
                    </Row>
                  </Space>
                )}
              </Card>
            </Col>
          </Row>

          {/* Información de Audiencia */}
          <Card
            title={
              <Space>
                <TeamOutlined />
                <span>Audiencia Objetivo</span>
              </Space>
            }
          >
            <Text>{record.target_audience || "No especificada"}</Text>
          </Card>

          {/* Timeline de Actividades */}
          <Card title="Historial de Actividades">
            <Timeline>
              <Timeline.Item color="green">
                Campaña creada - {record.created_at ? new Date(record.created_at).toLocaleDateString("es-MX") : "Fecha no disponible"}
              </Timeline.Item>
              {record.status === 'active' && (
                <Timeline.Item color="blue">
                  Campaña activada - {record.start_date ? new Date(record.start_date).toLocaleDateString("es-MX") : "Fecha no disponible"}
                </Timeline.Item>
              )}
              {record.status === 'paused' && (
                <Timeline.Item color="orange">
                  Campaña pausada
                </Timeline.Item>
              )}
              {record.status === 'completed' && (
                <Timeline.Item color="green">
                  Campaña completada - {record.end_date ? new Date(record.end_date).toLocaleDateString("es-MX") : "Fecha no disponible"}
                </Timeline.Item>
              )}
              {record.status === 'cancelled' && (
                <Timeline.Item color="red">
                  Campaña cancelada
                </Timeline.Item>
              )}
            </Timeline>
          </Card>
        </Space>
      )}
    </Show>
  );
};
