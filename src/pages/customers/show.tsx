import React from "react";
import { Show, TextField, NumberField, BooleanField, DateField } from "@refinedev/antd";
import { Card, Row, Col, Space, Tag, Avatar, Descriptions, Button } from "antd";
import { 
  UserOutlined, 
  CrownOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  EnvironmentOutlined,
  EditOutlined,
  DollarOutlined
} from "@ant-design/icons";
import { useShow, useNavigation } from "@refinedev/core";
import type { Customer } from "../../types/directus";

export const CustomerShow: React.FC = () => {
  const { query } = useShow<Customer>({
    resource: "customers",
  });
  
  const { edit } = useNavigation();
  const customer = query?.data?.data;

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "Sin límite establecido";
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const getCustomerTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "vip":
        return "gold";
      case "business":
        return "blue";
      case "individual":
        return "green";
      default:
        return "default";
    }
  };

  const getCustomerTypeLabel = (type: string) => {
    switch (type?.toLowerCase()) {
      case "vip":
        return "VIP";
      case "business":
        return "Empresa";
      case "individual":
        return "Individual";
      default:
        return type || "Sin tipo";
    }
  };

  return (
    <Show
      title={
        <Space>
          <Avatar 
            size={64} 
            icon={<UserOutlined />} 
            style={{ backgroundColor: customer?.vip ? "#faad14" : "#1890ff" }}
          />
          <div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              {customer?.first_name} {customer?.last_name}
              {customer?.vip && <CrownOutlined style={{ color: "gold", marginLeft: 8 }} />}
            </div>
            <div style={{ fontSize: "14px", color: "#666" }}>
              Cliente #{customer?.id}
            </div>
          </div>
        </Space>
      }
      headerButtons={
        <Button 
          type="primary" 
          icon={<EditOutlined />}
          onClick={() => customer && edit("customers", customer.id!)}
        >
          Editar Cliente
        </Button>
      }
    >
      <Row gutter={[16, 16]}>
        {/* Información Personal */}
        <Col xs={24} lg={12}>
          <Card title="Información Personal" bordered={false}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Nombre completo">
                <Space>
                  <strong>{customer?.first_name} {customer?.last_name}</strong>
                  {customer?.vip && (
                    <Tag color="gold">
                      <CrownOutlined /> VIP
                    </Tag>
                  )}
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Email">
                <Space>
                  <MailOutlined />
                  <a href={`mailto:${customer?.email}`}>{customer?.email}</a>
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Teléfono">
                <Space>
                  <PhoneOutlined />
                  <a href={`tel:${customer?.phone}`}>{customer?.phone || "No proporcionado"}</a>
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Tipo de Cliente">
                <Tag color={getCustomerTypeColor(customer?.type || "")}>
                  {getCustomerTypeLabel(customer?.type || "")}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Cliente VIP">
                <BooleanField value={customer?.vip} />
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Información de Contacto */}
        <Col xs={24} lg={12}>
          <Card title="Información de Contacto" bordered={false}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Dirección">
                <Space>
                  <EnvironmentOutlined />
                  <div>
                    {customer?.address || "No proporcionada"}
                    {customer?.city && (
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        {customer.city}
                        {customer?.state && `, ${customer.state}`}
                        {customer?.zip_code && ` ${customer.zip_code}`}
                      </div>
                    )}
                  </div>
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Ciudad">
                <TextField value={customer?.city || "No especificada"} />
              </Descriptions.Item>
              
              <Descriptions.Item label="Estado">
                <TextField value={customer?.state || "No especificado"} />
              </Descriptions.Item>
              
              <Descriptions.Item label="Código Postal">
                <TextField value={customer?.zip_code || "No especificado"} />
              </Descriptions.Item>
              
              <Descriptions.Item label="País">
                <TextField value={customer?.country || "No especificado"} />
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* Información Financiera */}
        <Col xs={24} lg={12}>
          <Card title="Información Financiera" bordered={false}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Límite de Crédito">
                <Space>
                  <DollarOutlined />
                  <span style={{ fontSize: "16px", fontWeight: "bold", color: "#52c41a" }}>
                    {formatCurrency(customer?.credit_limit)}
                  </span>
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Información del Sistema */}
        <Col xs={24} lg={12}>
          <Card title="Información del Sistema" bordered={false}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="ID del Cliente">
                <TextField value={customer?.id} />
              </Descriptions.Item>
              
              <Descriptions.Item label="Fecha de Registro">
                <DateField 
                  value={customer?.created_at} 
                  format="DD/MM/YYYY HH:mm"
                />
              </Descriptions.Item>
              
              <Descriptions.Item label="Última Actualización">
                <DateField 
                  value={customer?.updated_at} 
                  format="DD/MM/YYYY HH:mm"
                />
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Notas */}
      {customer?.notes && (
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="Notas y Observaciones" bordered={false}>
              <div style={{ 
                padding: "12px", 
                backgroundColor: "#fafafa", 
                borderRadius: "6px",
                whiteSpace: "pre-wrap" 
              }}>
                {customer.notes}
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </Show>
  );
};
