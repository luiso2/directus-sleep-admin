import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Space,
  message,
  Switch,
  Table,
  Tag,
  Modal,
  Alert,
  Row,
  Col,
  Statistic,
  Timeline,
  Tooltip,
  Badge,
  Descriptions,
  Typography,
  Divider,
  InputNumber,
  Select
} from 'antd';
import {
  SettingOutlined,
  KeyOutlined,
  LinkOutlined,
  ApiOutlined,
  SaveOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  CreditCardOutlined,
  InfoCircleOutlined,
  CopyOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { StripeService, StripeConfig, StripePaymentLink, StripeWebhook, PLAN_PRICES } from '../../services';

const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const StripeConfiguration: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<StripeConfig | null>(null);
  const [paymentLinks, setPaymentLinks] = useState<StripePaymentLink[]>([]);
  const [webhooks, setWebhooks] = useState<StripeWebhook[]>([]);
  const [configForm] = Form.useForm();
  const [paymentLinkForm] = Form.useForm();
  const [showApiKey, setShowApiKey] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLink, setEditingLink] = useState<StripePaymentLink | null>(null);
  const [webhookDetailModal, setWebhookDetailModal] = useState<StripeWebhook | null>(null);

  // Cargar datos
  const fetchData = async () => {
    setLoading(true);
    try {
      const [configData, linksData, webhooksData] = await Promise.all([
        StripeService.getConfig(),
        StripeService.getPaymentLinks(),
        StripeService.getWebhookHistory(20)
      ]);
      
      setConfig(configData);
      setPaymentLinks(linksData);
      setWebhooks(webhooksData);
      
      if (configData) {
        configForm.setFieldsValue({
          api_key_test: configData.api_key_test,
          api_key_live: configData.api_key_live,
          webhook_secret_test: configData.webhook_secret_test,
          webhook_secret_live: configData.webhook_secret_live,
          mode: configData.mode
        });
      }
    } catch (error: any) {
      message.error('Error al cargar configuración: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Guardar configuración
  const handleSaveConfig = async () => {
    try {
      const values = await configForm.validateFields();
      setLoading(true);

      await StripeService.saveConfig({
        ...values,
        is_active: true
      });

      message.success('Configuración guardada exitosamente');
      fetchData();
    } catch (error: any) {
      message.error('Error al guardar configuración: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Manejar payment links
  const handlePaymentLinkSubmit = async () => {
    try {
      const values = await paymentLinkForm.validateFields();
      setLoading(true);

      const linkData: Partial<StripePaymentLink> = {
        ...values,
        amount: PLAN_PRICES[values.plan_type as keyof typeof PLAN_PRICES].monthly * 100, // Convertir a centavos
        currency: 'usd',
        metadata: {
          plan_type: values.plan_type,
          description: `Suscripción ${values.plan_type.toUpperCase()}`
        }
      };

      if (editingLink?.id) {
        await StripeService.updatePaymentLink(editingLink.id, linkData);
        message.success('Payment Link actualizado exitosamente');
      } else {
        await StripeService.createPaymentLink(linkData);
        message.success('Payment Link creado exitosamente');
      }

      setModalVisible(false);
      paymentLinkForm.resetFields();
      setEditingLink(null);
      fetchData();
    } catch (error: any) {
      message.error('Error al guardar Payment Link: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Editar payment link
  const handleEditLink = (link: StripePaymentLink) => {
    setEditingLink(link);
    paymentLinkForm.setFieldsValue({
      stripe_payment_link_id: link.stripe_payment_link_id,
      plan_type: link.plan_type,
      url: link.url,
      name: link.name,
      description: link.description
    });
    setModalVisible(true);
  };

  // Eliminar payment link
  const handleDeleteLink = async (id: number) => {
    Modal.confirm({
      title: 'Eliminar Payment Link',
      content: '¿Está seguro de desactivar este Payment Link?',
      onOk: async () => {
        try {
          setLoading(true);
          await StripeService.deletePaymentLink(id);
          message.success('Payment Link desactivado');
          fetchData();
        } catch (error: any) {
          message.error('Error al eliminar: ' + error.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Copiar URL
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    message.success('URL copiada al portapapeles');
  };

  // Columnas de payment links
  const paymentLinksColumns: ColumnsType<StripePaymentLink> = [
    {
      title: 'Plan',
      dataIndex: 'plan_type',
      key: 'plan_type',
      render: (plan) => (
        <Tag color={
          plan === 'basic' ? 'blue' :
          plan === 'premium' ? 'gold' :
          'purple'
        } style={{ textTransform: 'uppercase' }}>
          {plan}
        </Tag>
      )
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Precio',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${amount / 100}/mes`
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      render: (url) => (
        <Space>
          <Text copyable={{ text: url }}>
            {url.substring(0, 40)}...
          </Text>
          <Button
            type="link"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => handleCopyUrl(url)}
          />
        </Space>
      )
    },
    {
      title: 'Estado',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => (
        <Badge status={active ? 'success' : 'error'} text={active ? 'Activo' : 'Inactivo'} />
      )
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Editar">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEditLink(record)}
            />
          </Tooltip>
          <Tooltip title="Desactivar">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteLink(record.id!)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // Columnas de webhooks
  const webhooksColumns: ColumnsType<StripeWebhook> = [
    {
      title: 'Evento',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color="blue">{type}</Tag>
      )
    },
    {
      title: 'ID',
      dataIndex: 'stripe_event_id',
      key: 'stripe_event_id',
      render: (id) => (
        <Text copyable={{ text: id }}>{id.substring(0, 20)}...</Text>
      )
    },
    {
      title: 'Estado',
      dataIndex: 'processed',
      key: 'processed',
      render: (processed, record) => (
        <Badge
          status={processed ? 'success' : record.error ? 'error' : 'processing'}
          text={processed ? 'Procesado' : record.error ? 'Error' : 'Pendiente'}
        />
      )
    },
    {
      title: 'Fecha',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm:ss')
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => setWebhookDetailModal(record)}
        >
          Ver detalles
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Space>
            <CreditCardOutlined style={{ fontSize: '24px' }} />
            <Title level={4} style={{ margin: 0 }}>Configuración de Stripe</Title>
          </Space>
        }
      >
        <Tabs defaultActiveKey="1">
          {/* Configuración API */}
          <TabPane
            tab={
              <span>
                <SettingOutlined />
                Configuración API
              </span>
            }
            key="1"
          >
            <Alert
              message="Información Importante"
              description="Las claves API de Stripe son sensibles. Asegúrese de mantenerlas seguras y nunca compartirlas públicamente."
              type="warning"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form
              form={configForm}
              layout="vertical"
              initialValues={{ mode: 'test' }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="api_key_test"
                    label="API Key (Test)"
                    rules={[{ required: true, message: 'Por favor ingrese la API Key de prueba' }]}
                  >
                    <Input.Password
                      prefix={<KeyOutlined />}
                      placeholder="sk_test_..."
                      visibilityToggle={{
                        visible: showApiKey,
                        onVisibleChange: setShowApiKey
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="webhook_secret_test"
                    label="Webhook Secret (Test)"
                  >
                    <Input.Password
                      prefix={<ApiOutlined />}
                      placeholder="whsec_..."
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="api_key_live"
                    label="API Key (Live)"
                  >
                    <Input.Password
                      prefix={<KeyOutlined />}
                      placeholder="sk_live_..."
                      visibilityToggle={{
                        visible: showApiKey,
                        onVisibleChange: setShowApiKey
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="webhook_secret_live"
                    label="Webhook Secret (Live)"
                  >
                    <Input.Password
                      prefix={<ApiOutlined />}
                      placeholder="whsec_..."
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="mode"
                label="Modo de Operación"
              >
                <Select>
                  <Option value="test">
                    <Badge status="warning" text="Modo de Prueba" />
                  </Option>
                  <Option value="live">
                    <Badge status="success" text="Modo Producción" />
                  </Option>
                </Select>
              </Form.Item>

              <Space>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSaveConfig}
                  loading={loading}
                >
                  Guardar Configuración
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchData}
                  loading={loading}
                >
                  Recargar
                </Button>
              </Space>
            </Form>

            {config && (
              <Card style={{ marginTop: 24 }} size="small">
                <Descriptions title="Estado Actual" column={2}>
                  <Descriptions.Item label="Modo">
                    <Badge
                      status={config.mode === 'live' ? 'success' : 'warning'}
                      text={config.mode === 'live' ? 'Producción' : 'Prueba'}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="Estado">
                    <Badge status="success" text="Activo" />
                  </Descriptions.Item>
                  <Descriptions.Item label="API Key">
                    {config.mode === 'test' ? 'sk_test_...***' : 'sk_live_...***'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Webhook">
                    {config.mode === 'test' ? 
                      (config.webhook_secret_test ? 'Configurado' : 'No configurado') :
                      (config.webhook_secret_live ? 'Configurado' : 'No configurado')
                    }
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}
          </TabPane>

          {/* Payment Links */}
          <TabPane
            tab={
              <span>
                <LinkOutlined />
                Payment Links
              </span>
            }
            key="2"
          >
            <Alert
              message="Payment Links de Stripe"
              description="Configure los enlaces de pago para cada plan de suscripción. Los clientes podrán usar estos enlaces para suscribirse directamente."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Card
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingLink(null);
                    paymentLinkForm.resetFields();
                    setModalVisible(true);
                  }}
                >
                  Nuevo Payment Link
                </Button>
              }
            >
              <Table
                columns={paymentLinksColumns}
                dataSource={paymentLinks}
                rowKey="id"
                loading={loading}
                pagination={false}
              />
            </Card>

            {/* Información de planes */}
            <Row gutter={16} style={{ marginTop: 24 }}>
              <Col span={8}>
                <Card title="Plan Basic" extra={<Tag color="blue">$25/mes</Tag>}>
                  <ul>
                    <li>3 limpiezas anuales</li>
                    <li>1 inspección anual</li>
                    <li>Sin protección</li>
                    <li>Sin Trade-In</li>
                  </ul>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Plan Premium" extra={<Tag color="gold">$50/mes</Tag>}>
                  <ul>
                    <li>6 limpiezas anuales</li>
                    <li>2 inspecciones anuales</li>
                    <li>✓ Protección incluida</li>
                    <li>Sin Trade-In</li>
                  </ul>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Plan Elite" extra={<Tag color="purple">$75/mes</Tag>}>
                  <ul>
                    <li>12 limpiezas anuales</li>
                    <li>2 inspecciones anuales</li>
                    <li>✓ Protección incluida</li>
                    <li>✓ Trade-In disponible</li>
                  </ul>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Webhooks */}
          <TabPane
            tab={
              <span>
                <ApiOutlined />
                Webhooks
              </span>
            }
            key="3"
          >
            <Alert
              message="Endpoint de Webhook"
              description={
                <Space direction="vertical">
                  <Text>Configure este endpoint en su panel de Stripe:</Text>
                  <Text copyable strong>
                    https://directus-admin-sleep.vercel.app/api/stripe/webhook
                  </Text>
                </Space>
              }
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Card title="Historial de Webhooks">
              <Table
                columns={webhooksColumns}
                dataSource={webhooks}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: false
                }}
              />
            </Card>

            <Card title="Eventos Soportados" style={{ marginTop: 24 }}>
              <Timeline>
                <Timeline.Item color="green">
                  <strong>checkout.session.completed</strong> - Cuando un cliente completa el pago
                </Timeline.Item>
                <Timeline.Item color="blue">
                  <strong>customer.subscription.created</strong> - Nueva suscripción creada
                </Timeline.Item>
                <Timeline.Item color="blue">
                  <strong>customer.subscription.updated</strong> - Suscripción actualizada
                </Timeline.Item>
                <Timeline.Item color="red">
                  <strong>customer.subscription.deleted</strong> - Suscripción cancelada
                </Timeline.Item>
                <Timeline.Item color="green">
                  <strong>invoice.payment_succeeded</strong> - Pago exitoso
                </Timeline.Item>
                <Timeline.Item color="red">
                  <strong>invoice.payment_failed</strong> - Pago fallido
                </Timeline.Item>
              </Timeline>
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal de Payment Link */}
      <Modal
        title={editingLink ? 'Editar Payment Link' : 'Nuevo Payment Link'}
        open={modalVisible}
        onOk={handlePaymentLinkSubmit}
        onCancel={() => {
          setModalVisible(false);
          paymentLinkForm.resetFields();
          setEditingLink(null);
        }}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={paymentLinkForm}
          layout="vertical"
        >
          <Form.Item
            name="stripe_payment_link_id"
            label="ID de Payment Link (Stripe)"
            rules={[{ required: true, message: 'Por favor ingrese el ID' }]}
          >
            <Input placeholder="price_xxxxxxxxxxxxx" />
          </Form.Item>

          <Form.Item
            name="plan_type"
            label="Tipo de Plan"
            rules={[{ required: true, message: 'Por favor seleccione un plan' }]}
          >
            <Select>
              <Option value="basic">Basic - $25/mes</Option>
              <Option value="premium">Premium - $50/mes</Option>
              <Option value="elite">Elite - $75/mes</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="url"
            label="URL del Payment Link"
            rules={[
              { required: true, message: 'Por favor ingrese la URL' },
              { type: 'url', message: 'Por favor ingrese una URL válida' }
            ]}
          >
            <Input placeholder="https://buy.stripe.com/..." />
          </Form.Item>

          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingrese un nombre' }]}
          >
            <Input placeholder="Suscripción Basic Sleep+" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Descripción (opcional)"
          >
            <Input.TextArea rows={3} placeholder="Descripción del plan..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de detalles de webhook */}
      <Modal
        title="Detalles del Webhook"
        open={!!webhookDetailModal}
        onCancel={() => setWebhookDetailModal(null)}
        footer={null}
        width={800}
      >
        {webhookDetailModal && (
          <div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="ID del Evento">
                {webhookDetailModal.stripe_event_id}
              </Descriptions.Item>
              <Descriptions.Item label="Tipo">
                <Tag color="blue">{webhookDetailModal.type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Badge
                  status={webhookDetailModal.processed ? 'success' : webhookDetailModal.error ? 'error' : 'processing'}
                  text={webhookDetailModal.processed ? 'Procesado' : webhookDetailModal.error ? 'Error' : 'Pendiente'}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Fecha">
                {dayjs(webhookDetailModal.created_at).format('DD/MM/YYYY HH:mm:ss')}
              </Descriptions.Item>
              {webhookDetailModal.error && (
                <Descriptions.Item label="Error">
                  <Text type="danger">{webhookDetailModal.error}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider>Datos del Evento</Divider>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '400px'
            }}>
              {JSON.stringify(webhookDetailModal.data, null, 2)}
            </pre>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StripeConfiguration;
