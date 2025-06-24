import React from "react";
import { Show } from "@refinedev/antd";
import { useShow, useOne } from "@refinedev/core";
import { Typography, Card, Row, Col, Space, Tag, Divider, Descriptions, List as AntList } from "antd";
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  DollarOutlined, 
  CalendarOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  TruckOutlined
} from "@ant-design/icons";
import type { Sale, Customer } from "../../types/directus";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export const SaleShow: React.FC = () => {
  const { queryResult } = useShow<Sale>({
    resource: "sales",
  });

  const { data, isLoading } = queryResult;
  const record = data?.data;

  // Obtener datos del cliente
  const { data: customerData } = useOne<Customer>({
    resource: "customers",
    id: record?.customer_id || 0,
    queryOptions: {
      enabled: !!record?.customer_id,
    },
  });

  const customer = customerData?.data;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "orange";
      case "confirmed":
        return "blue";
      case "delivered":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <ClockCircleOutlined />;
      case "confirmed":
        return <CheckCircleOutlined />;
      case "delivered":
        return <TruckOutlined />;
      case "cancelled":
        return <CloseCircleOutlined />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "Pendiente";
      case "confirmed":
        return "Confirmada";
      case "delivered":
        return "Entregada";
      case "cancelled":
        return "Cancelada";
      default:
        return status || "Sin estado";
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method?.toLowerCase()) {
      case "cash":
        return "Efectivo";
      case "credit_card":
        return "Tarjeta de Crédito";
      case "debit_card":
        return "Tarjeta de Débito";
      case "transfer":
        return "Transferencia";
      case "financing":
        return "Financiamiento";
      default:
        return method || "No especificado";
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case "cash":
        return <DollarOutlined />;
      case "credit_card":
      case "debit_card":
        return <CreditCardOutlined />;
      case "transfer":
        return <FileTextOutlined />;
      case "financing":
        return <FileTextOutlined />;
      default:
        return <DollarOutlined />;
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  if (isLoading) return <div>Cargando...</div>;
  if (!record) return <div>No se encontró la venta</div>;

  return (
    <Show
      isLoading={isLoading}
      title={
        <Space>
          <ShoppingCartOutlined />
          Venta {record.sale_number}
        </Space>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Estado de la venta */}
              <div>
                <Title level={5}>Estado de la Venta</Title>
                <Tag 
                  color={getStatusColor(record.status || "")} 
                  icon={getStatusIcon(record.status || "")}
                  style={{ fontSize: "16px", padding: "8px 16px" }}
                >
                  {getStatusLabel(record.status || "")}
                </Tag>
              </div>

              <Divider />

              {/* Información general */}
              <div>
                <Title level={5}>Información General</Title>
                <Descriptions column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Número de Venta">
                    <strong>{record.sale_number}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Fecha de Venta">
                    <Space>
                      <CalendarOutlined />
                      {record.sale_date ? dayjs(record.sale_date).format("DD/MM/YYYY HH:mm") : "Sin fecha"}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Método de Pago">
                    <Space>
                      {getPaymentMethodIcon(record.payment_method || "")}
                      {getPaymentMethodLabel(record.payment_method || "")}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Fecha de Registro">
                    {record.created_at ? dayjs(record.created_at).format("DD/MM/YYYY HH:mm") : "-"}
                  </Descriptions.Item>
                </Descriptions>
              </div>

              <Divider />

              {/* Información del cliente */}
              <div>
                <Title level={5}>
                  <UserOutlined /> Información del Cliente
                </Title>
                {customer ? (
                  <Card type="inner">
                    <Descriptions column={{ xs: 1, sm: 2 }}>
                      <Descriptions.Item label="Nombre">
                        <strong>{`${customer.first_name} ${customer.last_name}`}</strong>
                        {customer.vip && <Tag color="gold" style={{ marginLeft: 8 }}>VIP</Tag>}
                      </Descriptions.Item>
                      <Descriptions.Item label="Email">
                        {customer.email}
                      </Descriptions.Item>
                      <Descriptions.Item label="Teléfono">
                        {customer.phone || "No registrado"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Tipo">
                        <Tag>{customer.type || "Individual"}</Tag>
                      </Descriptions.Item>
                      {customer.city && (
                        <Descriptions.Item label="Ciudad">
                          {customer.city}
                        </Descriptions.Item>
                      )}
                      {customer.credit_limit && (
                        <Descriptions.Item label="Límite de Crédito">
                          {formatCurrency(customer.credit_limit)}
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  </Card>
                ) : (
                  <Text type="secondary">Cliente no asignado</Text>
                )}
              </div>

              {/* Notas */}
              {record.notes && (
                <>
                  <Divider />
                  <div>
                    <Title level={5}>
                      <FileTextOutlined /> Notas de la Venta
                    </Title>
                    <Card type="inner" style={{ backgroundColor: "#f5f5f5" }}>
                      <Text>{record.notes}</Text>
                    </Card>
                  </div>
                </>
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Resumen financiero */}
          <Card 
            title={
              <Space>
                <DollarOutlined />
                Resumen Financiero
              </Space>
            }
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Row justify="space-between">
                <Col><Text>Subtotal:</Text></Col>
                <Col><Text strong>{formatCurrency(record.subtotal)}</Text></Col>
              </Row>
              
              <Row justify="space-between">
                <Col><Text>IVA (16%):</Text></Col>
                <Col><Text strong>{formatCurrency(record.tax)}</Text></Col>
              </Row>
              
              {record.discount !== undefined && record.discount > 0 && (
                <Row justify="space-between">
                  <Col><Text>Descuento:</Text></Col>
                  <Col>
                    <Text strong style={{ color: "#ff4d4f" }}>
                      - {formatCurrency(record.discount)}
                    </Text>
                  </Col>
                </Row>
              )}
              
              <Divider />
              
              <Row justify="space-between">
                <Col>
                  <Title level={4} style={{ margin: 0 }}>Total:</Title>
                </Col>
                <Col>
                  <Title level={4} style={{ margin: 0, color: "#52c41a" }}>
                    {formatCurrency(record.total)}
                  </Title>
                </Col>
              </Row>
            </Space>
          </Card>

          {/* Timeline de actividad */}
          <Card 
            title="Historial de Actividad" 
            style={{ marginTop: 16 }}
          >
            <AntList
              size="small"
              dataSource={[
                {
                  icon: <CalendarOutlined />,
                  text: `Venta creada`,
                  date: record.created_at,
                },
                record.sale_date && {
                  icon: <ShoppingCartOutlined />,
                  text: `Fecha de venta`,
                  date: record.sale_date,
                },
                record.updated_at && {
                  icon: <CheckCircleOutlined />,
                  text: `Última actualización`,
                  date: record.updated_at,
                },
              ].filter(Boolean)}
              renderItem={(item) => (
                <AntList.Item>
                  <Space>
                    {item.icon}
                    <div>
                      <Text>{item.text}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {dayjs(item.date).format("DD/MM/YYYY HH:mm")}
                      </Text>
                    </div>
                  </Space>
                </AntList.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </Show>
  );
};
