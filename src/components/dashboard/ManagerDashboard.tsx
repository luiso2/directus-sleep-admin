import React, { useState, useEffect } from "react";
import { Row, Col, Card, Typography, Table, Tag, Button, Badge, Space, Avatar, Progress, Alert } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  TeamOutlined,
  TrophyOutlined,
  FireOutlined,
} from "@ant-design/icons";
import { useList, useCustom } from "@refinedev/core";

const { Title, Text } = Typography;

interface Agent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: "active" | "break" | "offline";
  avatar?: string;
  todayStats?: {
    calls: number;
    sales: number;
    callbacks: number;
    conversion: number;
  };
}

export const ManagerDashboard: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Cargar agentes del equipo
  const { data: agentsData, isLoading: loadingAgents } = useList<Agent>({
    resource: "directus_users",
    filters: [
      {
        field: "role.name",
        operator: "eq",
        value: "Agent",
      },
    ],
    queryOptions: {
      refetchInterval: 30000, // Actualizar cada 30 segundos
    },
  });

  // Estado en tiempo real del equipo
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "green";
      case "break":
        return "orange";
      case "offline":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircleOutlined />;
      case "break":
        return <ClockCircleOutlined />;
      case "offline":
        return <ExclamationCircleOutlined />;
      default:
        return <UserOutlined />;
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleReassignTasks = (agentId: string) => {
    // Lógica para reasignar tareas
    console.log("Reasignar tareas del agente:", agentId);
  };

  // Columnas para la tabla de agentes
  const columns = [
    {
      title: "Agente",
      key: "agent",
      render: (record: Agent) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div>
            <Text strong>{`${record.first_name} ${record.last_name}`}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Llamadas Hoy",
      key: "calls",
      render: (record: Agent) => (
        <Space>
          <PhoneOutlined />
          <Text>{record.todayStats?.calls || 0} / 25</Text>
          <Progress
            percent={((record.todayStats?.calls || 0) / 25) * 100}
            showInfo={false}
            size="small"
            style={{ width: 80 }}
          />
        </Space>
      ),
    },
    {
      title: "Ventas",
      key: "sales",
      render: (record: Agent) => (
        <Space>
          <TrophyOutlined style={{ color: "#52c41a" }} />
          <Text>{record.todayStats?.sales || 0} / 3</Text>
        </Space>
      ),
    },
    {
      title: "Conversión",
      key: "conversion",
      render: (record: Agent) => {
        const rate = record.todayStats?.conversion || 0;
        return (
          <Progress
            percent={rate}
            size="small"
            status={rate < 10 ? "exception" : rate < 20 ? "normal" : "success"}
          />
        );
      },
    },
    {
      title: "Callbacks",
      key: "callbacks",
      render: (record: Agent) => (
        <Badge count={record.todayStats?.callbacks || 0} showZero>
          <ClockCircleOutlined style={{ fontSize: 20 }} />
        </Badge>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (record: Agent) => (
        <Space>
          <Button size="small" onClick={() => setSelectedAgent(record.id)}>
            Ver Detalle
          </Button>
          {record.status === "offline" && (
            <Button
              size="small"
              danger
              onClick={() => handleReassignTasks(record.id)}
            >
              Reasignar
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Estadísticas del equipo
  const teamStats = {
    totalAgents: agentsData?.data?.length || 0,
    activeAgents: agentsData?.data?.filter(a => a.status === "active").length || 0,
    totalCalls: agentsData?.data?.reduce((sum, a) => sum + (a.todayStats?.calls || 0), 0) || 0,
    totalSales: agentsData?.data?.reduce((sum, a) => sum + (a.todayStats?.sales || 0), 0) || 0,
    avgConversion: agentsData?.data?.reduce((sum, a) => sum + (a.todayStats?.conversion || 0), 0) / (agentsData?.data?.length || 1) || 0,
  };

  // Alertas
  const lowPerformers = agentsData?.data?.filter(a => 
    a.status === "active" && 
    a.todayStats && 
    a.todayStats.calls < 10 && 
    new Date().getHours() > 12
  ) || [];

  return (
    <div style={{ padding: "24px" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>Panel de Control - Equipo</Title>
        </Col>
        <Col>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loadingAgents}
          >
            Actualizar
          </Button>
        </Col>
      </Row>

      {/* Alertas */}
      {lowPerformers.length > 0 && (
        <Alert
          message="Agentes con Bajo Rendimiento"
          description={`${lowPerformers.length} agentes están por debajo del 40% de su meta diaria`}
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Estadísticas del equipo */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text type="secondary">Agentes Activos</Text>
              <Title level={3} style={{ margin: 0 }}>
                {teamStats.activeAgents} / {teamStats.totalAgents}
              </Title>
              <Progress
                percent={(teamStats.activeAgents / teamStats.totalAgents) * 100}
                showInfo={false}
                strokeColor="#52c41a"
              />
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text type="secondary">Llamadas del Equipo</Text>
              <Title level={3} style={{ margin: 0 }}>
                <PhoneOutlined /> {teamStats.totalCalls}
              </Title>
              <Text type="secondary">Meta: {teamStats.totalAgents * 25}</Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text type="secondary">Ventas del Equipo</Text>
              <Title level={3} style={{ margin: 0, color: "#52c41a" }}>
                <TrophyOutlined /> {teamStats.totalSales}
              </Title>
              <Text type="secondary">Meta: {teamStats.totalAgents * 3}</Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text type="secondary">Conversión Promedio</Text>
              <Title level={3} style={{ margin: 0 }}>
                {teamStats.avgConversion.toFixed(1)}%
              </Title>
              <Tag color={teamStats.avgConversion > 20 ? "success" : "warning"}>
                {teamStats.avgConversion > 20 ? "Excelente" : "Mejorar"}
              </Tag>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Tabla de agentes */}
      <Card
        title={
          <Space>
            <TeamOutlined />
            <Text>Estado del Equipo en Tiempo Real</Text>
          </Space>
        }
        extra={
          <Space>
            <Badge status="success" text="Activo" />
            <Badge status="warning" text="Break" />
            <Badge status="error" text="Offline" />
          </Space>
        }
      >
        <Table
          dataSource={agentsData?.data}
          columns={columns}
          loading={loadingAgents}
          rowKey="id"
          pagination={false}
          onRow={(record) => ({
            onClick: () => setSelectedAgent(record.id),
            style: { cursor: "pointer" },
          })}
        />
      </Card>

      {/* Ranking rápido */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={8}>
          <Card title="🏆 Top Ventas del Día">
            {agentsData?.data
              ?.sort((a, b) => (b.todayStats?.sales || 0) - (a.todayStats?.sales || 0))
              .slice(0, 3)
              .map((agent, index) => (
                <div key={agent.id} style={{ marginBottom: 12 }}>
                  <Space>
                    <Text strong>{index + 1}.</Text>
                    <Avatar size="small" src={agent.avatar} icon={<UserOutlined />} />
                    <Text>{agent.first_name} {agent.last_name}</Text>
                    <Tag color="green">{agent.todayStats?.sales || 0} ventas</Tag>
                  </Space>
                </div>
              ))}
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="📞 Más Llamadas">
            {agentsData?.data
              ?.sort((a, b) => (b.todayStats?.calls || 0) - (a.todayStats?.calls || 0))
              .slice(0, 3)
              .map((agent, index) => (
                <div key={agent.id} style={{ marginBottom: 12 }}>
                  <Space>
                    <Text strong>{index + 1}.</Text>
                    <Avatar size="small" src={agent.avatar} icon={<UserOutlined />} />
                    <Text>{agent.first_name} {agent.last_name}</Text>
                    <Tag color="blue">{agent.todayStats?.calls || 0} llamadas</Tag>
                  </Space>
                </div>
              ))}
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="🔥 Mejor Conversión">
            {agentsData?.data
              ?.sort((a, b) => (b.todayStats?.conversion || 0) - (a.todayStats?.conversion || 0))
              .slice(0, 3)
              .map((agent, index) => (
                <div key={agent.id} style={{ marginBottom: 12 }}>
                  <Space>
                    <Text strong>{index + 1}.</Text>
                    <Avatar size="small" src={agent.avatar} icon={<UserOutlined />} />
                    <Text>{agent.first_name} {agent.last_name}</Text>
                    <Tag color="gold">{agent.todayStats?.conversion || 0}%</Tag>
                  </Space>
                </div>
              ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
