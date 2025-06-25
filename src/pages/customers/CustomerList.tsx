import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Statistic,
  Avatar,
  Descriptions,
  Tabs,
  Timeline,
  Alert,
  message,
  Tooltip,
  Badge,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  useList,
  useCreate,
  useUpdate,
  useDelete,
  useOne,
} from "@refinedev/core";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface ICustomer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  date_of_birth?: string;
  stripe_customer_id?: string;
  shopify_customer_id?: string;
  status: "active" | "inactive" | "suspended";
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

interface ISubscription {
  id: string;
  customer_id: string;
  plan: "basic" | "premium" | "elite";
  status: "active" | "cancelled" | "paused" | "expired";
  start_date: string;
  end_date?: string;
  next_payment_date?: string;
  amount: number;
  billing_cycle: "monthly" | "yearly";
}

export const CustomerList: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  // Fetch customers
  const { data: customersData, refetch: refetchCustomers } = useList<ICustomer>({
    resource: "new_customers",
    sorters: [{ field: "created_at", order: "desc" }],
    filters: searchText
      ? [
          {
            operator: "or",
            value: [
              { field: "first_name", operator: "contains", value: searchText },
              { field: "last_name", operator: "contains", value: searchText },
              { field: "email", operator: "contains", value: searchText },
            ],
          },
        ]
      : [],
  });

  // Fetch subscriptions
  const { data: subscriptionsData } = useList<ISubscription>({
    resource: "subscriptions",
  });

  const { mutate: createCustomer } = useCreate();
  const { mutate: updateCustomer } = useUpdate();
  const { mutate: deleteCustomer } = useDelete();

  const handleCreateOrUpdate = (values: any) => {
    if (selectedCustomer) {
      updateCustomer(
        {
          resource: "new_customers",
          id: selectedCustomer.id,
          values: {
            ...values,
            updated_at: new Date().toISOString(),
          },
        },
        {
          onSuccess: () => {
            message.success("Cliente actualizado exitosamente");
            setIsModalVisible(false);
            form.resetFields();
            refetchCustomers();
          },
        }
      );
    } else {
      createCustomer(
        {
          resource: "new_customers",
          values: {
            id: `cust_${Date.now()}`,
            ...values,
            status: "active",
            created_at: new Date().toISOString(),
          },
        },
        {
          onSuccess: () => {
            message.success("Cliente creado exitosamente");
            setIsModalVisible(false);
            form.resetFields();
            refetchCustomers();
          },
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "¿Eliminar cliente?",
      content: "Esta acción no se puede deshacer",
      okText: "Eliminar",
      cancelText: "Cancelar",
      okType: "danger",
      onOk: () => {
        deleteCustomer(
          {
            resource: "new_customers",
            id,
          },
          {
            onSuccess: () => {
              message.success("Cliente eliminado");
              refetchCustomers();
            },
          }
        );
      },
    });
  };

  const getCustomerSubscription = (customerId: string) => {
    return subscriptionsData?.data?.find(
      (sub) => sub.customer_id === customerId && sub.status === "active"
    );
  };

  const columns = [
    {
      title: "Cliente",
      key: "customer",
      render: (_: any, record: ICustomer) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="large">
            {record.first_name?.[0]}{record.last_name?.[0]}
          </Avatar>
          <Space direction="vertical" size="small">
            <Text strong>
              {record.first_name} {record.last_name}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ID: {record.id}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Contacto",
      key: "contact",
      render: (_: any, record: ICustomer) => (
        <Space direction="vertical" size="small">
          <Space>
            <MailOutlined />
            <Text>{record.email}</Text>
          </Space>
          {record.phone && (
            <Space>
              <PhoneOutlined />
              <Text>{record.phone}</Text>
            </Space>
          )}
        </Space>
      ),
    },
    {
      title: "Suscripción",
      key: "subscription",
      render: (_: any, record: ICustomer) => {
        const subscription = getCustomerSubscription(record.id);
        if (!subscription) {
          return <Tag>Sin suscripción</Tag>;
        }

        const planColors = {
          basic: "blue",
          premium: "purple",
          elite: "gold",
        };

        return (
          <Space direction="vertical" size="small">
            <Tag color={planColors[subscription.plan]}>
              {subscription.plan.toUpperCase()}
            </Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ${subscription.amount}/{subscription.billing_cycle === "monthly" ? "mes" : "año"}
            </Text>
          </Space>
        );
      },
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusConfig = {
          active: { color: "green", text: "Activo" },
          inactive: { color: "gray", text: "Inactivo" },
          suspended: { color: "red", text: "Suspendido" },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Fecha de Registro",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
      sorter: true,
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: ICustomer) => (
        <Space>
          <Tooltip title="Ver detalles">
            <Button
              icon={<SearchOutlined />}
              onClick={() => {
                setSelectedCustomer(record);
                setIsDetailModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedCustomer(record);
                form.setFieldsValue({
                  ...record,
                  date_of_birth: record.date_of_birth
                    ? dayjs(record.date_of_birth)
                    : undefined,
                });
                setIsModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const renderCustomerDetails = () => {
    if (!selectedCustomer) return null;

    const subscription = getCustomerSubscription(selectedCustomer.id);

    return (
      <Tabs defaultActiveKey="1">
        <TabPane tab="Información General" key="1">
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Nombre Completo" span={2}>
              {selectedCustomer.first_name} {selectedCustomer.last_name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedCustomer.email}
            </Descriptions.Item>
            <Descriptions.Item label="Teléfono">
              {selectedCustomer.phone || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Fecha de Nacimiento">
              {selectedCustomer.date_of_birth
                ? dayjs(selectedCustomer.date_of_birth).format("DD/MM/YYYY")
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Estado">
              <Tag color={selectedCustomer.status === "active" ? "green" : "red"}>
                {selectedCustomer.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Dirección" span={2}>
              {selectedCustomer.address || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Ciudad">
              {selectedCustomer.city || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Estado/Provincia">
              {selectedCustomer.state || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Código Postal">
              {selectedCustomer.zip_code || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Cliente desde">
              {dayjs(selectedCustomer.created_at).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
          </Descriptions>

          {(selectedCustomer.stripe_customer_id || selectedCustomer.shopify_customer_id) && (
            <>
              <Title level={5} style={{ marginTop: 24 }}>
                IDs de Integración
              </Title>
              <Descriptions bordered size="small">
                {selectedCustomer.stripe_customer_id && (
                  <Descriptions.Item label="Stripe ID">
                    <Text code>{selectedCustomer.stripe_customer_id}</Text>
                  </Descriptions.Item>
                )}
                {selectedCustomer.shopify_customer_id && (
                  <Descriptions.Item label="Shopify ID">
                    <Text code>{selectedCustomer.shopify_customer_id}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </>
          )}
        </TabPane>

        <TabPane tab="Suscripción" key="2">
          {subscription ? (
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              <Card>
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic
                      title="Plan Actual"
                      value={subscription.plan.toUpperCase()}
                      prefix={<ShoppingCartOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Precio"
                      value={subscription.amount}
                      prefix="$"
                      suffix={`/${subscription.billing_cycle === "monthly" ? "mes" : "año"}`}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Estado"
                      value={subscription.status.toUpperCase()}
                      valueStyle={{
                        color: subscription.status === "active" ? "#3f8600" : "#cf1322",
                      }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Próximo Pago"
                      value={
                        subscription.next_payment_date
                          ? dayjs(subscription.next_payment_date).format("DD/MM/YYYY")
                          : "-"
                      }
                      prefix={<CalendarOutlined />}
                    />
                  </Col>
                </Row>
              </Card>

              <Card title="Servicios Incluidos">
                {subscription.plan === "elite" && (
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Alert
                      message="Plan Elite"
                      description="Incluye todos los servicios premium"
                      type="success"
                      showIcon
                    />
                    <ul>
                      <li>12 limpiezas anuales</li>
                      <li>2 inspecciones anuales</li>
                      <li>Protección Elite contra daños</li>
                      <li>Trade-In disponible</li>
                      <li>Soporte prioritario 24/7</li>
                    </ul>
                  </Space>
                )}
                {subscription.plan === "premium" && (
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Alert
                      message="Plan Premium"
                      description="Servicios mejorados"
                      type="info"
                      showIcon
                    />
                    <ul>
                      <li>6 limpiezas anuales</li>
                      <li>1 inspección anual</li>
                      <li>Protección Premium</li>
                      <li>Soporte extendido</li>
                    </ul>
                  </Space>
                )}
                {subscription.plan === "basic" && (
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Alert
                      message="Plan Basic"
                      description="Servicios esenciales"
                      type="info"
                      showIcon
                    />
                    <ul>
                      <li>3 limpiezas anuales</li>
                      <li>Protección básica</li>
                      <li>Soporte estándar</li>
                    </ul>
                  </Space>
                )}
              </Card>
            </Space>
          ) : (
            <Alert
              message="Sin Suscripción Activa"
              description="Este cliente no tiene una suscripción activa actualmente"
              type="warning"
              showIcon
            />
          )}
        </TabPane>

        <TabPane tab="Historial" key="3">
          <Timeline>
            <Timeline.Item color="green">
              <p>Cliente creado</p>
              <Text type="secondary">
                {dayjs(selectedCustomer.created_at).format("DD/MM/YYYY HH:mm")}
              </Text>
            </Timeline.Item>
            {selectedCustomer.updated_at && (
              <Timeline.Item>
                <p>Información actualizada</p>
                <Text type="secondary">
                  {dayjs(selectedCustomer.updated_at).format("DD/MM/YYYY HH:mm")}
                </Text>
              </Timeline.Item>
            )}
            {subscription && (
              <Timeline.Item color="blue">
                <p>Suscripción {subscription.plan} activada</p>
                <Text type="secondary">
                  {dayjs(subscription.start_date).format("DD/MM/YYYY")}
                </Text>
              </Timeline.Item>
            )}
          </Timeline>
        </TabPane>
      </Tabs>
    );
  };

  const activeCustomers = customersData?.data?.filter(c => c.status === "active").length || 0;
  const totalCustomers = customersData?.total || 0;
  const premiumCustomers = subscriptionsData?.data?.filter(
    s => s.status === "active" && (s.plan === "premium" || s.plan === "elite")
  ).length || 0;

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <div>
          <Title level={2}>
            <UserOutlined /> Gestión de Clientes
          </Title>
          <Paragraph type="secondary">
            Administra la información de tus clientes y sus suscripciones
          </Paragraph>
        </div>

        {/* Statistics */}
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total de Clientes"
                value={totalCustomers}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Clientes Activos"
                value={activeCustomers}
                valueStyle={{ color: "#3f8600" }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Clientes Premium/Elite"
                value={premiumCustomers}
                valueStyle={{ color: "#722ed1" }}
                prefix={<ShoppingCartOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tasa de Retención"
                value={totalCustomers > 0 ? ((activeCustomers / totalCustomers) * 100).toFixed(1) : 0}
                suffix="%"
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Customers Table */}
        <Card
          title="Lista de Clientes"
          extra={
            <Space>
              <Input.Search
                placeholder="Buscar por nombre o email"
                onSearch={setSearchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setSelectedCustomer(null);
                  form.resetFields();
                  setIsModalVisible(true);
                }}
              >
                Nuevo Cliente
              </Button>
            </Space>
          }
        >
          <Table
            dataSource={customersData?.data || []}
            columns={columns}
            rowKey="id"
            loading={!customersData}
            pagination={{
              total: customersData?.total,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total: ${total} clientes`,
            }}
          />
        </Card>
      </Space>

      {/* Create/Edit Modal */}
      <Modal
        title={selectedCustomer ? "Editar Cliente" : "Nuevo Cliente"}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={720}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateOrUpdate}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="first_name"
                label="Nombre"
                rules={[{ required: true, message: "Por favor ingrese el nombre" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Nombre" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="last_name"
                label="Apellido"
                rules={[{ required: true, message: "Por favor ingrese el apellido" }]}
              >
                <Input placeholder="Apellido" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Por favor ingrese el email" },
                  { type: "email", message: "Email inválido" },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="email@ejemplo.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Teléfono"
              >
                <Input prefix={<PhoneOutlined />} placeholder="(123) 456-7890" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="date_of_birth"
            label="Fecha de Nacimiento"
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Dirección"
          >
            <Input prefix={<HomeOutlined />} placeholder="Calle y número" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="city"
                label="Ciudad"
              >
                <Input placeholder="Ciudad" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="state"
                label="Estado/Provincia"
              >
                <Input placeholder="Estado" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="zip_code"
                label="Código Postal"
              >
                <Input placeholder="12345" />
              </Form.Item>
            </Col>
          </Row>

          {selectedCustomer && (
            <Form.Item
              name="status"
              label="Estado"
              initialValue="active"
            >
              <Select>
                <Option value="active">Activo</Option>
                <Option value="inactive">Inactivo</Option>
                <Option value="suspended">Suspendido</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item>
            <Space style={{ float: "right" }}>
              <Button onClick={() => setIsModalVisible(false)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                {selectedCustomer ? "Actualizar" : "Crear"} Cliente
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Detalles del Cliente"
        visible={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Cerrar
          </Button>,
        ]}
        width={800}
      >
        {renderCustomerDetails()}
      </Modal>
    </div>
  );
};