import React from "react";
import { useGetIdentity } from "@refinedev/core";
import { Card, Typography, Space, Tag, Row, Col, Statistic } from "antd";
import { UserOutlined, PhoneOutlined, DollarOutlined, TeamOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface IUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

export const Dashboard: React.FC = () => {
  const { data: identity } = useGetIdentity<IUser>();

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "red";
      case "manager":
        return "orange";
      case "agent":
        return "green";
      default:
        return "default";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "manager":
        return "Gerente";
      case "agent":
        return "Agente";
      default:
        return role;
    }
  };

  const getDashboardContent = () => {
    if (!identity) return null;

    switch (identity.role) {
      case "admin":
        return (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Ventas Totales"
                  value={125000}
                  prefix={<DollarOutlined />}
                  suffix="USD"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Empleados"
                  value={45}
                  prefix={<TeamOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Llamadas Hoy"
                  value={1250}
                  prefix={<PhoneOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Clientes Activos"
                  value={3400}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
          </Row>
        );

      case "manager":
        return (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic
                  title="Mi Equipo"
                  value={12}
                  suffix="agentes"
                  prefix={<TeamOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic
                  title="Ventas del Equipo Hoy"
                  value={15600}
                  prefix={<DollarOutlined />}
                  suffix="USD"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic
                  title="Llamadas del Equipo"
                  value={145}
                  suffix="/ 300"
                  prefix={<PhoneOutlined />}
                />
              </Card>
            </Col>
          </Row>
        );

      case "agent":
        return (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic
                  title="Mis Llamadas Hoy"
                  value={15}
                  suffix="/ 25"
                  prefix={<PhoneOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic
                  title="Mis Ventas"
                  value={1}
                  suffix="/ 3"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic
                  title="Mi Comisión"
                  value={125}
                  prefix="$"
                />
              </Card>
            </Col>
          </Row>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card>
          <Space>
            <Title level={3} style={{ margin: 0 }}>
              Bienvenido, {identity?.name || "Usuario"}
            </Title>
            <Tag color={getRoleColor(identity?.role || "")}>
              {getRoleLabel(identity?.role || "")}
            </Tag>
          </Space>
          <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </Card>

        {getDashboardContent()}

        <Card>
          <Title level={4}>Información del Sistema</Title>
          <Space direction="vertical">
            <Text>Email: {identity?.email}</Text>
            <Text>Rol: {getRoleLabel(identity?.role || "")}</Text>
            <Text>ID: {identity?.id}</Text>
          </Space>
        </Card>
      </Space>
    </div>
  );
};