import React from "react";
import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Card, Row, Col, Tag, Descriptions, Statistic, Space, Progress } from "antd";
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  TeamOutlined,
  DollarOutlined,
  PhoneFilled,
  ShoppingCartOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

export const UserShow: React.FC = () => {
  const { queryResult } = useShow({
    resource: "directus_users",
    meta: {
      fields: "*,role.*",
    },
  });
  const { data, isLoading } = queryResult;
  const record = data?.data;

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
    <Show isLoading={isLoading} title="Detalles del Usuario">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <UserOutlined style={{ fontSize: 64, color: "#764ba2" }} />
              <Title level={3} style={{ margin: "16px 0 8px" }}>
                {record?.first_name} {record?.last_name}
              </Title>
              <Space>
                <Tag color={getRoleColor(record?.role?.name)}>
                  {getRoleLabel(record?.role?.name)}
                </Tag>
                <Tag color={getStatusColor(record?.status)}>
                  {getStatusLabel(record?.status)}
                </Tag>
              </Space>
            </div>

            <Descriptions column={1} bordered={false}>
              <Descriptions.Item label={<><MailOutlined /> Email</>}>
                {record?.email}
              </Descriptions.Item>
              <Descriptions.Item label={<><PhoneOutlined /> Teléfono</>}>
                {record?.phone || "No especificado"}
              </Descriptions.Item>
              <Descriptions.Item label={<><TeamOutlined /> Equipo</>}>
                {record?.team?.name || "Sin equipo asignado"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="Metas Diarias">
                <Row gutter={16}>
                  <Col xs={12}>
                    <Statistic
                      title="Meta de Llamadas"
                      value={record?.daily_goal_calls || 0}
                      prefix={<PhoneFilled />}
                      suffix="llamadas"
                    />
                    <Progress 
                      percent={75} 
                      status="active"
                      strokeColor="#52c41a"
                    />
                  </Col>
                  <Col xs={12}>
                    <Statistic
                      title="Meta de Ventas"
                      value={record?.daily_goal_sales || 0}
                      prefix={<ShoppingCartOutlined />}
                      suffix="ventas"
                    />
                    <Progress 
                      percent={60} 
                      status="active"
                      strokeColor="#1890ff"
                    />
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col span={24}>
              <Card title="Comisiones y Rendimiento">
                <Row gutter={16}>
                  <Col xs={8}>
                    <Statistic
                      title="Tasa de Comisión"
                      value={record?.commission_rate || 0}
                      prefix={<DollarOutlined />}
                      suffix="%"
                      valueStyle={{ color: "#3f8600" }}
                    />
                  </Col>
                  <Col xs={8}>
                    <Statistic
                      title="Ventas del Mes"
                      value={0}
                      prefix="€"
                    />
                  </Col>
                  <Col xs={8}>
                    <Statistic
                      title="Comisiones Ganadas"
                      value={0}
                      prefix="€"
                      valueStyle={{ color: "#cf1322" }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col span={24}>
              <Card title="Información Adicional">
                <Descriptions column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fecha de Registro">
                    {new Date(record?.created_at).toLocaleDateString("es-ES")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Última Actualización">
                    {new Date(record?.updated_at).toLocaleDateString("es-ES")}
                  </Descriptions.Item>
                  <Descriptions.Item label="ID de Usuario" span={2}>
                    {record?.id}
                  </Descriptions.Item>
                  {record?.notes && (
                    <Descriptions.Item label="Notas" span={2}>
                      <Text type="secondary">{record.notes}</Text>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Show>
  );
};
