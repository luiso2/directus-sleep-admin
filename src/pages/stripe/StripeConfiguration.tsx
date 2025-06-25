import React, { useState } from "react";
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Space,
  Typography,
  Alert,
  Table,
  Tag,
  Modal,
  Select,
  InputNumber,
  Switch,
  Divider,
  Row,
  Col,
  Statistic,
  message,
  Descriptions,
  Badge,
  List,
  Timeline,
} from "antd";
import {
  CreditCardOutlined,
  KeyOutlined,
  LinkOutlined,
  DollarOutlined,
  CalendarOutlined,
  SettingOutlined,
  WebhookOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useList, useCreate, useUpdate, useDelete } from "@refinedev/core";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

export const StripeConfiguration: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPaymentLink, setEditingPaymentLink] = useState<any>(null);
  const [form] = Form.useForm();
  const [configForm] = Form.useForm();
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch Stripe configuration
  const { data: configData } = useList({
    resource: "stripe_config",
    pagination: { pageSize: 1 },
  });

  // Fetch payment links
  const { data: paymentLinksData, refetch: refetchPaymentLinks } = useList({
    resource: "stripe_payment_links",
    sorters: [{ field: "created_at", order: "desc" }],
  });

  // Fetch webhook logs
  const { data: webhookLogsData } = useList({
    resource: "stripe_webhooks",
    pagination: { pageSize: 10 },
    sorters: [{ field: "created_at", order: "desc" }],
  });

  // Fetch subscriptions
  const { data: subscriptionsData } = useList({
    resource: "stripe_subscriptions",
    pagination: { pageSize: 5 },
    sorters: [{ field: "created_at", order: "desc" }],
  });

  const { mutate: createPaymentLink } = useCreate();
  const { mutate: updatePaymentLink } = useUpdate();
  const { mutate: deletePaymentLink } = useDelete();
  const { mutate: updateConfig } = useUpdate();

  const currentConfig = configData?.data?.[0];

  const handleSaveConfig = (values: any) => {
    if (currentConfig) {
      updateConfig(
        {
          resource: "stripe_config",
          id: currentConfig.id,
          values: {
            ...values,
            updated_at: new Date().toISOString(),
          },
        },
        {
          onSuccess: () => {
            message.success("Configuración actualizada exitosamente");
          },
        }
      );
    }
  };

  const handleCreatePaymentLink = (values: any) => {
    const action = editingPaymentLink ? updatePaymentLink : createPaymentLink;
    const payload = {
      resource: "stripe_payment_links",
      ...(editingPaymentLink ? { id: editingPaymentLink.id } : {}),
      values: {
        ...values,
        id: editingPaymentLink?.id || `link_${Date.now()}`,
        created_at: editingPaymentLink?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    action(
      payload,
      {
        onSuccess: () => {
          message.success(
            editingPaymentLink 
              ? "Enlace de pago actualizado" 
              : "Enlace de pago creado exitosamente"
          );
          setIsModalVisible(false);
          form.resetFields();
          setEditingPaymentLink(null);
          refetchPaymentLinks();
        },
      }
    );
  };

  const handleDeletePaymentLink = (id: string) => {
    Modal.confirm({
      title: "¿Eliminar enlace de pago?",
      content: "Esta acción no se puede deshacer.",
      okText: "Eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: () => {
        deletePaymentLink(
          {
            resource: "stripe_payment_links",
            id,
          },
          {
            onSuccess: () => {
              message.success("Enlace de pago eliminado");
              refetchPaymentLinks();
            },
          }
        );
      },
    });
  };

  const handleSync = async () => {
    setIsSyncing(true);
    // Simular sincronización
    setTimeout(() => {
      setIsSyncing(false);
      message.success("Sincronización completada");
    }, 2000);
  };

  const paymentLinkColumns = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Plan",
      dataIndex: "plan_type",
      key: "plan_type",
      render: (plan: string) => {
        const colors = {
          starter: "blue",
          premium: "green",
          elite: "gold",
        };
        return <Tag color={colors[plan as keyof typeof colors]}>{plan.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Precio",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => <Text>${amount}/mes</Text>,
    },
    {
      title: "URL",
      dataIndex: "stripe_url",
      key: "stripe_url",
      render: (url: string) => (
        <Space>
          <LinkOutlined />
          <Text copyable={{ text: url }} ellipsis style={{ maxWidth: 200 }}>
            {url}
          </Text>
        </Space>
      ),
    },
    {
      title: "Estado",
      dataIndex: "is_active",
      key: "is_active",
      render: (active: boolean) => (
        <Badge status={active ? "success" : "default"} text={active ? "Activo" : "Inactivo"} />
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingPaymentLink(record);
              form.setFieldsValue(record);
              setIsModalVisible(true);
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDeletePaymentLink(record.id)}
          />
        </Space>
      ),
    },
  ];

  const webhookColumns = [
    {
      title: "Evento",
      dataIndex: "event_type",
      key: "event_type",
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const config = {
          success: { color: "success", icon: <CheckCircleOutlined /> },
          failed: { color: "error", icon: <CloseCircleOutlined /> },
          pending: { color: "processing", icon: <SyncOutlined spin /> },
        };
        const statusConfig = config[status as keyof typeof config];
        return (
          <Tag icon={statusConfig?.icon} color={statusConfig?.color}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "ID de Stripe",
      dataIndex: "stripe_event_id",
      key: "stripe_event_id",
      render: (id: string) => <Text code>{id.slice(-8)}</Text>,
    },
    {
      title: "Fecha",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
  ];

  const recentSubscriptions = subscriptionsData?.data?.slice(0, 5) || [];

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <div>
          <Title level={2}>
            <CreditCardOutlined /> Configuración de Stripe
          </Title>
          <Paragraph type="secondary">
            Gestiona la integración con Stripe para procesar pagos y suscripciones
          </Paragraph>
        </div>

        {/* Statistics */}
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Enlaces de Pago"
                value={paymentLinksData?.total || 0}
                prefix={<LinkOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Suscripciones Activas"
                value={subscriptionsData?.data?.filter((s: any) => s.status === "active").length || 0}
                prefix={<CrownOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Ingresos Mensuales"
                value={2450}
                prefix="$"
                precision={2}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Última Sincronización"
                value="Hace 2 horas"
                prefix={<SyncOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Tabs defaultActiveKey="config">
          <TabPane
            tab={
              <span>
                <SettingOutlined />
                Configuración API
              </span>
            }
            key="config"
          >
            <Card>
              <Form
                form={configForm}
                layout="vertical"
                initialValues={currentConfig}
                onFinish={handleSaveConfig}
              >
                <Alert
                  message="Credenciales de Stripe"
                  description="Asegúrate de usar las claves correctas según el entorno (test/producción)"
                  type="info"
                  showIcon
                  style={{ marginBottom: 24 }}
                />

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="publishable_key"
                      label="Clave Pública (Publishable Key)"
                      rules={[{ required: true, message: "Por favor ingresa la clave pública" }]}
                    >
                      <Input.Password
                        prefix={<KeyOutlined />}
                        placeholder="pk_live_..."
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="secret_key"
                      label="Clave Secreta (Secret Key)"
                      rules={[{ required: true, message: "Por favor ingresa la clave secreta" }]}
                    >
                      <Input.Password
                        prefix={<KeyOutlined />}
                        placeholder="sk_live_..."
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="webhook_secret"
                      label="Webhook Secret"
                      rules={[{ required: true, message: "Por favor ingresa el webhook secret" }]}
                    >
                      <Input.Password
                        prefix={<WebhookOutlined />}
                        placeholder="whsec_..."
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="environment"
                      label="Entorno"
                      rules={[{ required: true }]}
                    >
                      <Select>
                        <Option value="test">Test</Option>
                        <Option value="production">Producción</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="auto_sync"
                      label="Sincronización Automática"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="sync_interval"
                      label="Intervalo de Sincronización (horas)"
                    >
                      <InputNumber min={1} max={24} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item>
                      <Button
                        type="primary"
                        icon={<SyncOutlined spin={isSyncing} />}
                        onClick={handleSync}
                        loading={isSyncing}
                        block
                        style={{ marginTop: 30 }}
                      >
                        Sincronizar Ahora
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit">
                      Guardar Configuración
                    </Button>
                    <Button>Probar Conexión</Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </TabPane>

          <TabPane
            tab={
              <span>
                <LinkOutlined />
                Enlaces de Pago
              </span>
            }
            key="payment-links"
          >
            <Card
              title="Enlaces de Pago"
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingPaymentLink(null);
                    form.resetFields();
                    setIsModalVisible(true);
                  }}
                >
                  Crear Enlace
                </Button>
              }
            >
              <Table
                dataSource={paymentLinksData?.data || []}
                columns={paymentLinkColumns}
                rowKey="id"
                pagination={{
                  total: paymentLinksData?.total,
                  pageSize: 10,
                }}
              />
            </Card>
          </TabPane>

          <TabPane
            tab={
              <span>
                <WebhookOutlined />
                Webhooks
              </span>
            }
            key="webhooks"
          >
            <Card title="Registro de Webhooks">
              <Alert
                message="Endpoint de Webhook"
                description={
                  <Space direction="vertical">
                    <Text copyable>https://directus-admin-sleep.vercel.app/api/stripe/webhook</Text>
                    <Text type="secondary">
                      Configura este endpoint en tu dashboard de Stripe
                    </Text>
                  </Space>
                }
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Table
                dataSource={webhookLogsData?.data || []}
                columns={webhookColumns}
                rowKey="id"
                pagination={{
                  total: webhookLogsData?.total,
                  pageSize: 10,
                }}
              />
            </Card>
          </TabPane>

          <TabPane
            tab={
              <span>
                <DollarOutlined />
                Suscripciones
              </span>
            }
            key="subscriptions"
          >
            <Card title="Suscripciones Recientes">
              <List
                itemLayout="horizontal"
                dataSource={recentSubscriptions}
                renderItem={(item: any) => (
                  <List.Item
                    actions={[
                      <Tag color={item.status === "active" ? "success" : "default"}>
                        {item.status}
                      </Tag>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={
                        <Space>
                          <Text>{item.stripe_subscription_id}</Text>
                          <Tag color="blue">{item.plan_type}</Tag>
                        </Space>
                      }
                      description={
                        <Space>
                          <CalendarOutlined />
                          <Text type="secondary">
                            Creado: {dayjs(item.created_at).format("DD/MM/YYYY")}
                          </Text>
                          {item.current_period_end && (
                            <>
                              <Divider type="vertical" />
                              <Text type="secondary">
                                Próximo cobro: {dayjs(item.current_period_end).format("DD/MM/YYYY")}
                              </Text>
                            </>
                          )}
                        </Space>
                      }
                    />
                    <Text strong>${item.amount}/mes</Text>
                  </List.Item>
                )}
              />
            </Card>
          </TabPane>
        </Tabs>
      </Space>

      {/* Payment Link Modal */}
      <Modal
        title={editingPaymentLink ? "Editar Enlace de Pago" : "Crear Enlace de Pago"}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingPaymentLink(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreatePaymentLink}
        >
          <Form.Item
            name="name"
            label="Nombre del Enlace"
            rules={[{ required: true, message: "Por favor ingresa un nombre" }]}
          >
            <Input placeholder="Ej: Suscripción Elite Mensual" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="plan_type"
                label="Tipo de Plan"
                rules={[{ required: true, message: "Selecciona un plan" }]}
              >
                <Select>
                  <Option value="starter">Starter</Option>
                  <Option value="premium">Premium</Option>
                  <Option value="elite">Elite</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="Precio Mensual"
                rules={[{ required: true, message: "Ingresa el precio" }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="stripe_price_id"
            label="Price ID de Stripe"
            rules={[{ required: true, message: "Ingresa el Price ID" }]}
          >
            <Input placeholder="price_..." />
          </Form.Item>

          <Form.Item
            name="stripe_url"
            label="URL del Enlace de Pago"
            rules={[{ required: true, message: "Ingresa la URL" }]}
          >
            <Input placeholder="https://buy.stripe.com/..." />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Estado"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingPaymentLink ? "Actualizar" : "Crear"} Enlace
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
