import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Space,
  message,
  Table,
  Tag,
  Modal,
  Alert,
  Row,
  Col,
  Statistic,
  Badge,
  Descriptions,
  Typography,
  Divider,
  Progress,
  List,
  Avatar,
  Tooltip,
  Select,
  Switch
} from 'antd';
import {
  ShopOutlined,
  SettingOutlined,
  ShoppingOutlined,
  TagsOutlined,
  SyncOutlined,
  SaveOutlined,
  ReloadOutlined,
  DollarOutlined,
  UserOutlined,
  BarcodeOutlined,
  PercentageOutlined,
  CalendarOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  GiftOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { ShopifyService, ShopifySettings, ShopifyProduct, ShopifyCoupon } from '../../services';

const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const ShopifyConfiguration: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [settings, setSettings] = useState<ShopifySettings | null>(null);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [coupons, setCoupons] = useState<ShopifyCoupon[]>([]);
  const [settingsForm] = Form.useForm();
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{
    status: 'idle' | 'syncing' | 'completed' | 'failed';
    message: string;
    progress: number;
  }>({ status: 'idle', message: '', progress: 0 });

  // Cargar datos
  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsData, productsData, couponsData] = await Promise.all([
        ShopifyService.getSettings(),
        ShopifyService.getProducts(),
        ShopifyService.getCoupons()
      ]);
      
      setSettings(settingsData);
      setProducts(productsData);
      setCoupons(couponsData);
      
      if (settingsData) {
        settingsForm.setFieldsValue({
          shop_domain: settingsData.shop_domain,
          api_key: settingsData.api_key,
          api_secret: settingsData.api_secret,
          access_token: settingsData.access_token,
          webhook_secret: settingsData.webhook_secret
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
  const handleSaveSettings = async () => {
    try {
      const values = await settingsForm.validateFields();
      setLoading(true);

      await ShopifyService.saveSettings({
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

  // Ejecutar sincronización completa
  const handleFullSync = async () => {
    Modal.confirm({
      title: 'Sincronización Completa',
      content: 'Esto sincronizará todos los productos y clientes de Shopify. El proceso puede tardar varios minutos.',
      onOk: async () => {
        setSyncLoading(true);
        setSyncProgress({ status: 'syncing', message: 'Iniciando sincronización...', progress: 0 });

        try {
          // Simular progreso (en producción, esto vendría del backend)
          setSyncProgress({ status: 'syncing', message: 'Sincronizando productos...', progress: 30 });
          
          const results = await ShopifyService.runFullSync();
          
          setSyncProgress({ status: 'syncing', message: 'Sincronizando clientes...', progress: 70 });
          
          // Simular finalización
          setSyncProgress({ status: 'completed', message: 'Sincronización completada', progress: 100 });
          
          message.success(`Sincronización completada: ${results.products} productos, ${results.customers} clientes`);
          fetchData();
        } catch (error: any) {
          setSyncProgress({ status: 'failed', message: 'Error en la sincronización', progress: 0 });
          message.error('Error durante la sincronización: ' + error.message);
        } finally {
          setSyncLoading(false);
          setTimeout(() => {
            setSyncProgress({ status: 'idle', message: '', progress: 0 });
          }, 3000);
        }
      }
    });
  };

  // Copiar código
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    message.success('Código copiado al portapapeles');
  };

  // Columnas de productos
  const productsColumns: ColumnsType<ShopifyProduct> = [
    {
      title: 'Producto',
      key: 'product',
      render: (_, record) => (
        <Space>
          {record.images?.[0] && (
            <Avatar src={record.images[0].src} size="large" shape="square" />
          )}
          <div>
            <div style={{ fontWeight: 500 }}>{record.title}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.handle}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Tipo',
      dataIndex: 'product_type',
      key: 'product_type',
      render: (type) => type || '-'
    },
    {
      title: 'Precio',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${price}`,
      sorter: (a, b) => a.price - b.price
    },
    {
      title: 'Inventario',
      dataIndex: 'inventory_quantity',
      key: 'inventory_quantity',
      render: (qty) => (
        <Badge
          count={qty || 0}
          showZero
          style={{ backgroundColor: qty > 0 ? '#52c41a' : '#ff4d4f' }}
        />
      )
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge status={status === 'active' ? 'success' : 'default'} text={status} />
      )
    }
  ];

  // Columnas de cupones
  const couponsColumns: ColumnsType<ShopifyCoupon> = [
    {
      title: 'Código',
      dataIndex: 'code',
      key: 'code',
      render: (code) => (
        <Space>
          <Tag icon={<BarcodeOutlined />} color="purple">{code}</Tag>
          <Button
            type="link"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => handleCopyCode(code)}
          />
        </Space>
      )
    },
    {
      title: 'Tipo',
      key: 'type',
      render: (_, record) => (
        <Tag color={record.value_type === 'fixed_amount' ? 'green' : 'blue'}>
          {record.value_type === 'fixed_amount' ? 
            <DollarOutlined /> : 
            <PercentageOutlined />
          }
          {' '}
          {record.value}
          {record.value_type === 'percentage' ? '%' : ''}
        </Tag>
      )
    },
    {
      title: 'Uso',
      key: 'usage',
      render: (_, record) => (
        <Space>
          <Text>{record.usage_count}</Text>
          {record.usage_limit && (
            <>
              <Text type="secondary">/</Text>
              <Text>{record.usage_limit}</Text>
            </>
          )}
        </Space>
      )
    },
    {
      title: 'Creado Para',
      dataIndex: 'created_for',
      key: 'created_for',
      render: (type) => {
        const typeConfig = {
          'trade_in': { color: 'purple', icon: <GiftOutlined />, text: 'Trade-In' },
          'promotion': { color: 'blue', icon: <TagsOutlined />, text: 'Promoción' },
          'customer_service': { color: 'orange', icon: <UserOutlined />, text: 'Servicio al Cliente' }
        };
        const config = typeConfig[type as keyof typeof typeConfig];
        return config ? (
          <Tag color={config.color} icon={config.icon}>{config.text}</Tag>
        ) : '-';
      }
    },
    {
      title: 'Válido Hasta',
      dataIndex: 'ends_at',
      key: 'ends_at',
      render: (date) => {
        if (!date) return 'Sin vencimiento';
        const isExpired = dayjs().isAfter(dayjs(date));
        return (
          <Tag color={isExpired ? 'red' : 'green'} icon={<CalendarOutlined />}>
            {dayjs(date).format('DD/MM/YYYY')}
          </Tag>
        );
      }
    },
    {
      title: 'Estado',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => (
        <Badge status={active ? 'success' : 'error'} text={active ? 'Activo' : 'Inactivo'} />
      )
    }
  ];

  // Estadísticas de cupones
  const couponStats = {
    total: coupons.length,
    active: coupons.filter(c => c.is_active).length,
    tradeIn: coupons.filter(c => c.created_for === 'trade_in').length,
    used: coupons.reduce((sum, c) => sum + (c.usage_count || 0), 0)
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Space>
            <ShopOutlined style={{ fontSize: '24px' }} />
            <Title level={4} style={{ margin: 0 }}>Configuración de Shopify</Title>
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
              description="Las credenciales de la API de Shopify son sensibles. Manténgalas seguras y nunca las comparta públicamente."
              type="warning"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form
              form={settingsForm}
              layout="vertical"
            >
              <Form.Item
                name="shop_domain"
                label="Dominio de la Tienda"
                rules={[
                  { required: true, message: 'Por favor ingrese el dominio' },
                  { pattern: /^[a-zA-Z0-9-]+\.myshopify\.com$/, message: 'Formato: tu-tienda.myshopify.com' }
                ]}
              >
                <Input
                  prefix={<ShopOutlined />}
                  placeholder="tu-tienda.myshopify.com"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="api_key"
                    label="API Key (opcional)"
                    rules={[{ required: false }]}
                  >
                    <Input.Password
                      placeholder="API Key de la aplicación (solo si usa OAuth)"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="api_secret"
                    label="API Secret (opcional)"
                    rules={[{ required: false }]}
                  >
                    <Input.Password
                      placeholder="API Secret de la aplicación (solo si usa OAuth)"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="access_token"
                label="Access Token"
                rules={[{ required: true, message: 'Por favor ingrese el Access Token' }]}
              >
                <Input.Password
                  placeholder="shpat_xxxxxxxxxxxxx"
                  visibilityToggle={{
                    visible: showAccessToken,
                    onVisibleChange: setShowAccessToken
                  }}
                />
              </Form.Item>

              <Form.Item
                name="webhook_secret"
                label="Webhook Secret (opcional)"
              >
                <Input.Password
                  placeholder="Secret para validar webhooks"
                />
              </Form.Item>

              <Space>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSaveSettings}
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

            {settings && (
              <Card style={{ marginTop: 24 }} size="small">
                <Descriptions title="Estado Actual" column={2}>
                  <Descriptions.Item label="Tienda">
                    {settings.shop_domain}
                  </Descriptions.Item>
                  <Descriptions.Item label="Estado">
                    <Badge status="success" text="Conectado" />
                  </Descriptions.Item>
                  <Descriptions.Item label="Última Sincronización">
                    {settings.last_sync ? dayjs(settings.last_sync).format('DD/MM/YYYY HH:mm') : 'Nunca'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Webhook">
                    {settings.webhook_secret ? 'Configurado' : 'No configurado'}
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <Alert
                  message="Endpoint de Webhook"
                  description={
                    <Space direction="vertical">
                      <Text>Configure este endpoint en su panel de Shopify:</Text>
                      <Text copyable strong>
                        https://directus-admin-sleep.vercel.app/api/shopify/webhook
                      </Text>
                    </Space>
                  }
                  type="info"
                  showIcon
                />
              </Card>
            )}
          </TabPane>

          {/* Productos */}
          <TabPane
            tab={
              <span>
                <ShoppingOutlined />
                Productos ({products.length})
              </span>
            }
            key="2"
          >
            <Card
              extra={
                <Button
                  icon={<SyncOutlined />}
                  onClick={handleFullSync}
                  loading={syncLoading}
                >
                  Sincronizar con Shopify
                </Button>
              }
            >
              {syncProgress.status !== 'idle' && (
                <Alert
                  message={syncProgress.message}
                  type={
                    syncProgress.status === 'completed' ? 'success' :
                    syncProgress.status === 'failed' ? 'error' :
                    'info'
                  }
                  showIcon
                  style={{ marginBottom: 16 }}
                  description={
                    syncProgress.status === 'syncing' && (
                      <Progress percent={syncProgress.progress} />
                    )
                  }
                />
              )}

              <Table
                columns={productsColumns}
                dataSource={products}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} productos`
                }}
              />
            </Card>
          </TabPane>

          {/* Cupones */}
          <TabPane
            tab={
              <span>
                <TagsOutlined />
                Cupones ({coupons.length})
              </span>
            }
            key="3"
          >
            {/* Estadísticas de cupones */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Total Cupones"
                    value={couponStats.total}
                    prefix={<TagsOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Cupones Activos"
                    value={couponStats.active}
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Cupones Trade-In"
                    value={couponStats.tradeIn}
                    valueStyle={{ color: '#722ed1' }}
                    prefix={<GiftOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Usos Totales"
                    value={couponStats.used}
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<DollarOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Card>
              <Table
                columns={couponsColumns}
                dataSource={coupons}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} cupones`
                }}
              />
            </Card>

            <Alert
              message="Gestión de Cupones"
              description="Los cupones de Trade-In se generan automáticamente cuando se aprueba una evaluación. Los cupones promocionales deben crearse directamente en Shopify."
              type="info"
              showIcon
              style={{ marginTop: 24 }}
            />
          </TabPane>

          {/* Webhooks */}
          <TabPane
            tab={
              <span>
                <SyncOutlined />
                Webhooks
              </span>
            }
            key="4"
          >
            <Card title="Eventos de Webhook Soportados">
              <List
                dataSource={[
                  {
                    event: 'products/create',
                    description: 'Cuando se crea un nuevo producto',
                    icon: <ShoppingOutlined style={{ color: '#52c41a' }} />
                  },
                  {
                    event: 'products/update',
                    description: 'Cuando se actualiza un producto existente',
                    icon: <ShoppingOutlined style={{ color: '#1890ff' }} />
                  },
                  {
                    event: 'customers/create',
                    description: 'Cuando se registra un nuevo cliente',
                    icon: <UserOutlined style={{ color: '#52c41a' }} />
                  },
                  {
                    event: 'customers/update',
                    description: 'Cuando se actualiza información del cliente',
                    icon: <UserOutlined style={{ color: '#1890ff' }} />
                  },
                  {
                    event: 'orders/create',
                    description: 'Cuando se crea una nueva orden',
                    icon: <DollarOutlined style={{ color: '#52c41a' }} />
                  },
                  {
                    event: 'orders/updated',
                    description: 'Cuando se actualiza una orden (incluyendo uso de cupones)',
                    icon: <DollarOutlined style={{ color: '#1890ff' }} />
                  }
                ]}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={item.icon}
                      title={<Text code>{item.event}</Text>}
                      description={item.description}
                    />
                  </List.Item>
                )}
              />
            </Card>

            <Card title="Configuración de Webhooks en Shopify" style={{ marginTop: 24 }}>
              <Alert
                message="Pasos para configurar webhooks"
                description={
                  <ol>
                    <li>Accede a tu panel de administración de Shopify</li>
                    <li>Ve a Configuración → Notificaciones</li>
                    <li>Desplázate hasta "Webhooks"</li>
                    <li>Haz clic en "Crear webhook"</li>
                    <li>Selecciona el evento deseado</li>
                    <li>Ingresa la URL del endpoint proporcionada arriba</li>
                    <li>Guarda el webhook</li>
                  </ol>
                }
                type="info"
              />
            </Card>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ShopifyConfiguration;
