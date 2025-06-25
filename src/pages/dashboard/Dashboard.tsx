import React from "react";
import { Row, Col, Card, Statistic, Space, Typography, Progress, Table, Tag, List, Avatar } from "antd";
import {
  UserOutlined,
  CrownOutlined,
  DollarOutlined,
  SwapOutlined,
  RiseOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useList } from "@refinedev/core";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export const Dashboard: React.FC = () => {
  // Fetch data for statistics
  const { data: customersData } = useList({
    resource: "new_customers",
    pagination: { pageSize: 1000 },
  });

  const { data: subscriptionsData } = useList({
    resource: "subscriptions",
    pagination: { pageSize: 1000 },
  });

  const { data: evaluationsData } = useList({
    resource: "evaluations",
    pagination: { pageSize: 5 },
    sorters: [{ field: "created_at", order: "desc" }],
  });

  // Calculate statistics
  const totalCustomers = customersData?.total || 0;
  const activeSubscriptions = subscriptionsData?.data?.filter(
    (sub: any) => sub.status === "active"
  ).length || 0;
  const totalRevenue = subscriptionsData?.data?.reduce(
    (sum: number, sub: any) => sum + (sub.amount || 0),
    0
  ) || 0;
  const pendingEvaluations = evaluationsData?.data?.filter(
    (eval: any) => eval.evaluation_status === "pending"
  ).length || 0;

  // Recent activities
  const recentActivities = [
    {
      id: 1,
      type: "subscription",
      icon: <CrownOutlined style={{ color: "#52c41a" }} />,
      title: "Nueva suscripción Elite",
      description: "Juan Pérez ha adquirido el plan Elite",
      time: "Hace 2 horas",
    },
    {
      id: 2,
      type: "evaluation",
      icon: <SwapOutlined style={{ color: "#1890ff" }} />,
      title: "Evaluación Trade-In aprobada",
      description: "María García - Cupón 20% generado",
      time: "Hace 4 horas",
    },
    {
      id: 3,
      type: "customer",
      icon: <UserOutlined style={{ color: "#722ed1" }} />,
      title: "Nuevo cliente registrado",
      description: "Carlos López se ha registrado",
      time: "Hace 6 horas",
    },
  ];

  // Subscription distribution
  const subscriptionDistribution = [
    { type: "Starter", value: 30, color: "#1890ff" },
    { type: "Premium", value: 45, color: "#52c41a" },
    { type: "Elite", value: 25, color: "#faad14" },
  ];

  return (
    <div>
      <Title level={2}>Dashboard</Title>
      <Text type="secondary">Resumen general del sistema</Text>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Clientes"
              value={totalCustomers}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
            <Progress percent={75} showInfo={false} strokeColor="#1890ff" />
            <Text type="secondary">+12% este mes</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Suscripciones Activas"
              value={activeSubscriptions}
              prefix={<CrownOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
            <Progress percent={85} showInfo={false} strokeColor="#52c41a" />
            <Text type="secondary">+8% este mes</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ingresos Mensuales"
              value={totalRevenue}
              prefix="$"
              precision={2}
              valueStyle={{ color: "#fa8c16" }}
            />
            <Progress percent={92} showInfo={false} strokeColor="#fa8c16" />
            <Text type="secondary">+15% este mes</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Trade-In Pendientes"
              value={pendingEvaluations}
              prefix={<SwapOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
            <Progress percent={40} showInfo={false} strokeColor="#722ed1" />
            <Text type="secondary">Requieren evaluación</Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="Distribución de Suscripciones">
            <Row gutter={16}>
              <Col span={12}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  {subscriptionDistribution.map((item) => (
                    <div key={item.type}>
                      <Space style={{ width: "100%", justifyContent: "space-between" }}>
                        <Text>{item.type}</Text>
                        <Text strong>{item.value}%</Text>
                      </Space>
                      <Progress
                        percent={item.value}
                        showInfo={false}
                        strokeColor={item.color}
                      />
                    </div>
                  ))}
                </Space>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: "center", marginTop: 20 }}>
                  <Space direction="vertical">
                    <TeamOutlined style={{ fontSize: 48, color: "#1890ff" }} />
                    <Title level={3}>{activeSubscriptions}</Title>
                    <Text type="secondary">Suscriptores Totales</Text>
                  </Space>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Actividad Reciente" bodyStyle={{ padding: 0 }}>
            <List
              itemLayout="horizontal"
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item style={{ padding: "12px 24px" }}>
                  <List.Item.Meta
                    avatar={<Avatar icon={item.icon} />}
                    title={item.title}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.description}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {item.time}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="Evaluaciones Trade-In Recientes">
            <Table
              dataSource={evaluationsData?.data || []}
              columns={[
                {
                  title: "Cliente",
                  dataIndex: "customer_id",
                  key: "customer",
                  render: (customerId: string) => (
                    <Space>
                      <Avatar icon={<UserOutlined />} size="small" />
                      <Text>Cliente #{customerId.slice(-6)}</Text>
                    </Space>
                  ),
                },
                {
                  title: "Colchón",
                  key: "mattress",
                  render: (record: any) => (
                    <Space direction="vertical" size={0}>
                      <Text>{record.mattress_brand}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.years_of_use} años de uso
                      </Text>
                    </Space>
                  ),
                },
                {
                  title: "Valor Trade-In",
                  dataIndex: "trade_in_value",
                  key: "value",
                  render: (value: number) => (
                    <Text strong>${value}</Text>
                  ),
                },
                {
                  title: "Estado",
                  dataIndex: "evaluation_status",
                  key: "status",
                  render: (status: string) => {
                    const config = {
                      pending: { color: "processing", icon: <ClockCircleOutlined />, text: "Pendiente" },
                      approved: { color: "success", icon: <CheckCircleOutlined />, text: "Aprobado" },
                      rejected: { color: "error", icon: <WarningOutlined />, text: "Rechazado" },
                    };
                    const statusConfig = config[status as keyof typeof config] || config.pending;
                    return (
                      <Tag icon={statusConfig.icon} color={statusConfig.color}>
                        {statusConfig.text}
                      </Tag>
                    );
                  },
                },
                {
                  title: "Fecha",
                  dataIndex: "created_at",
                  key: "date",
                  render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
                },
              ]}
              pagination={false}
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
