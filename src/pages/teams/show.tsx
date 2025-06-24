import React from "react";
import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Card, Row, Col, Space, Tag, Avatar, List, Statistic, Progress } from "antd";
import { 
  TeamOutlined, 
  CrownOutlined, 
  AimOutlined, 
  UserOutlined,
  PhoneOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import type { Team } from "../../types/directus";

const { Title, Text } = Typography;

export const TeamShow: React.FC = () => {
  const { queryResult } = useShow<Team>();
  const { data, isLoading } = queryResult;
  const record = data?.data;

  const mockMembers = [
    { id: "1", name: "Juan Pérez", role: "Agente de Ventas", dailySales: 8, dailyCalls: 45 },
    { id: "2", name: "María García", role: "Agente de Ventas", dailySales: 12, dailyCalls: 52 },
    { id: "3", name: "Carlos López", role: "Agente de Ventas", dailySales: 6, dailyCalls: 38 },
  ];

  const calculateTeamProgress = () => {
    const totalSales = mockMembers.reduce((sum, member) => sum + member.dailySales, 0);
    const totalCalls = mockMembers.reduce((sum, member) => sum + member.dailyCalls, 0);
    
    const salesGoal = record?.goals?.daily_sales || 30;
    const callsGoal = record?.goals?.daily_calls || 150;
    
    return {
      salesProgress: Math.round((totalSales / salesGoal) * 100),
      callsProgress: Math.round((totalCalls / callsGoal) * 100),
      totalSales,
      totalCalls,
    };
  };

  const teamProgress = record ? calculateTeamProgress() : { salesProgress: 0, callsProgress: 0, totalSales: 0, totalCalls: 0 };

  return (
    <Show isLoading={isLoading} title="Detalles del Equipo">
      {record && (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Información General */}
          <Card>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Space>
                  <Avatar 
                    icon={<TeamOutlined />} 
                    size={48} 
                    style={{ backgroundColor: '#764ba2' }} 
                  />
                  <div>
                    <Title level={4} style={{ margin: 0 }}>{record.name}</Title>
                    <Text type="secondary">{record.description || "Sin descripción"}</Text>
                  </div>
                </Space>
              </Col>
              
              <Col xs={24} sm={8}>
                <Space>
                  <Avatar 
                    icon={<CrownOutlined />} 
                    size={32} 
                    style={{ backgroundColor: '#faad14' }} 
                  />
                  <div>
                    <Text type="secondary">Líder del Equipo</Text>
                    <div><Text strong>{record.leader_id || "Sin asignar"}</Text></div>
                  </div>
                </Space>
              </Col>
              
              <Col xs={24} sm={8}>
                <Space>
                  <Tag color={record.active ? "success" : "error"} style={{ fontSize: 14, padding: "4px 12px" }}>
                    {record.active ? (
                      <>
                        <CheckCircleOutlined /> Activo
                      </>
                    ) : (
                      <>
                        <CloseCircleOutlined /> Inactivo
                      </>
                    )}
                  </Tag>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Progreso del Equipo */}
          <Card 
            title={
              <Space>
                <AimOutlined />
                <span>Progreso del Equipo (Hoy)</span>
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Ventas Realizadas"
                  value={teamProgress.totalSales}
                  suffix={`/ ${record.goals?.daily_sales || 0}`}
                  prefix={<ShoppingCartOutlined />}
                />
                <Progress 
                  percent={teamProgress.salesProgress} 
                  status={teamProgress.salesProgress >= 100 ? "success" : "active"}
                />
              </Col>
              
              <Col xs={24} sm={8}>
                <Statistic
                  title="Llamadas Realizadas"
                  value={teamProgress.totalCalls}
                  suffix={`/ ${record.goals?.daily_calls || 0}`}
                  prefix={<PhoneOutlined />}
                />
                <Progress 
                  percent={teamProgress.callsProgress} 
                  status={teamProgress.callsProgress >= 100 ? "success" : "active"}
                />
              </Col>
              
              <Col xs={24} sm={8}>
                <Statistic
                  title="Meta Mensual de Ingresos"
                  value={record.goals?.monthly_revenue || 0}
                  prefix={<DollarOutlined />}
                  formatter={(value) => {
                    return new Intl.NumberFormat("es-MX", {
                      style: "currency",
                      currency: "MXN",
                    }).format(Number(value));
                  }}
                />
              </Col>
            </Row>
          </Card>

          {/* Miembros del Equipo */}
          <Card 
            title={
              <Space>
                <UserOutlined />
                <span>Miembros del Equipo ({mockMembers.length})</span>
              </Space>
            }
          >
            <List
              dataSource={mockMembers}
              renderItem={(member) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={member.name}
                    description={member.role}
                  />
                  <Space size="large">
                    <Statistic
                      title="Ventas"
                      value={member.dailySales}
                      valueStyle={{ fontSize: 16 }}
                    />
                    <Statistic
                      title="Llamadas"
                      value={member.dailyCalls}
                      valueStyle={{ fontSize: 16 }}
                    />
                  </Space>
                </List.Item>
              )}
            />
          </Card>

          {/* Información Adicional */}
          <Card title="Información Adicional">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Text type="secondary">Creado el</Text>
                <div>
                  <Text>
                    {record.created_at 
                      ? new Date(record.created_at).toLocaleString("es-MX") 
                      : "No disponible"}
                  </Text>
                </div>
              </Col>
              
              <Col xs={24} sm={12}>
                <Text type="secondary">Última actualización</Text>
                <div>
                  <Text>
                    {record.updated_at 
                      ? new Date(record.updated_at).toLocaleString("es-MX") 
                      : "No disponible"}
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Space>
      )}
    </Show>
  );
};
