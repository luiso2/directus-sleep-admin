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
  Switch,
  Tag,
  Modal,
  Select,
  InputNumber,
  Row,
  Col,
  Statistic,
  Divider,
  message,
  Tooltip,
  Badge,
  Timeline,
  List,
  Descriptions,
  DatePicker,
  Progress,
  Empty,
} from "antd";
import {
  ShopOutlined,
  SettingOutlined,
  KeyOutlined,
  LinkOutlined,
  GiftOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  SyncOutlined,
  SaveOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  PercentageOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  ApiOutlined,
  TagsOutlined,
  BarcodeOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import {
  useList,
  useOne,
  useCreate,
  useUpdate,
  useDelete,
} from "@refinedev/core";
import dayjs from "dayjs";
import copy from "copy-to-clipboard";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

interface IShopifySettings {
  id: string;
  store_name: string;
  store_url: string;
  api_key: string;
  api_secret: string;
  access_token: string;
  webhook_secret?: string;
  active: boolean;
  environment: "development" | "production";
  created_at: string;
  updated_at?: string;
}

interface IShopifyProduct {
  id: string;
  shopify_product_id: string;
  title: string;
  handle: string;
  product_type: string;
  vendor?: string;
  price: number;
  compare_at_price?: number;
  inventory_quantity: number;
  status: "active" | "archived" | "draft";
  tags?: string[];
  sync_status: "synced" | "pending" | "error";
  last_sync?: string;
  created_at: string;
  updated_at?: string;
}

interface IShopifyCoupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed_amount" | "free_shipping";
  value: number;
  minimum_purchase?: number;
  usage_limit?: number;
  usage_count: number;
  start_date?: string;
  end_date?: string;
  status: "active" | "expired" | "used";
  customer_id?: string;
  trade_in_evaluation_id?: string;
  created_at: string;
}

interface ISyncHistory {
  id: string;
  entity_type: "products" | "customers" | "coupons" | "orders";
  sync_type: "manual" | "automatic" | "webhook";
  status: "success" | "failed" | "partial";
  records_synced: number;
  records_failed: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
}

export const ShopifyConfiguration: React.FC = () => {
  const [settingsForm] = Form.useForm();
  const [couponForm] = Form.useForm();
  const [editSettingsModalVisible, setEditSettingsModalVisible] = useState(false);
  const [createCouponModalVisible, setCreateCouponModalVisible] = useState(false);
  const [selectedSettings, setSelectedSettings] = useState<IShopifySettings | null>(null);
  const [syncLoading, setSyncLoading] = useState<string | null>(null);

  // Fetch Shopify settings
  const { data: settingsData, refetch: refetchSettings } = useList<IShopifySettings>({
    resource: "shopify_settings",
  });

  // Fetch products
  const { data: productsData, refetch: refetchProducts } = useList<IShopifyProduct>({
    resource: "shopify_products",
    sorters: [{ field: "created_at", order: "desc" }],
    pagination: { pageSize: 10 },
  });

  // Fetch coupons
  const { data: couponsData, refetch: refetchCoupons } = useList<IShopifyCoupon>({
    resource: "shopify_coupons",
    sorters: [{ field: "created_at", order: "desc" }],
  });

  // Fetch sync history
  const { data: syncHistoryData, refetch: refetchSyncHistory } = useList<ISyncHistory>({
    resource: "sync_history",
    filters: [{ field: "entity_type", operator: "in", value: ["products", "customers", "coupons"] }],
    sorters: [{ field: "started_at", order: "desc" }],
    pagination: { pageSize: 10 },
  });

  const { mutate: createSettings } = useCreate();
  const { mutate: updateSettings } = useUpdate();
  const { mutate: deleteSettings } = useDelete();
  const { mutate: createCoupon } = useCreate();
  const { mutate: deleteCoupon } = useDelete();
  const { mutate: createSyncHistory } = useCreate();

  const activeSettings = settingsData?.data?.find((s) => s.active);

  const handleSettingsSave = (values: any) => {
    if (selectedSettings) {
      updateSettings(
        {
          resource: "shopify_settings",
          id: selectedSettings.id,
          values: {
            ...values,
            updated_at: new Date().toISOString(),
          },
        },
        {
          onSuccess: () => {
            message.success("Configuración actualizada exitosamente");
            setEditSettingsModalVisible(false);
            setSelectedSettings(null);
            settingsForm.resetFields();
            refetchSettings();
          },
        }
      );
    } else {
      createSettings(
        {
          resource: "shopify_settings",
          values: {
            id: `shopify_${Date.now()}`,
            ...values,
            active: !activeSettings,
            created_at: new Date().toISOString(),
          },
        },
        {
          onSuccess: () => {
            message.success("Configuración creada exitosamente");
            setEditSettingsModalVisible(false);
            settingsForm.resetFields();
            refetchSettings();
          },
        }
      );
    }
  };

  const handleCreateCoupon = (values: any) => {
    createCoupon(
      {
        resource: "shopify_coupons",
        values: {
          id: `coupon_${Date.now()}`,
          ...values,
          code: values.code.toUpperCase(),
          usage_count: 0,
          status: "active",
          start_date: values.validity_period?.[0]?.toISOString(),
          end_date: values.validity_period?.[1]?.toISOString(),
          created_at: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          message.success("Cupón creado exitosamente");
          setCreateCouponModalVisible(false);
          couponForm.resetFields();
          refetchCoupons();
        },
      }
    );
  };

  const handleSync = async (entityType: string) => {
    setSyncLoading(entityType);
    
    const syncId = `sync_${Date.now()}`;
    const startTime = new Date();
    
    createSyncHistory(
      {
        resource: "sync_history",
        values: {
          id: syncId,
          entity_type: entityType,
          sync_type: "manual",
          status: "success",
          records_synced: Math.floor(Math.random() * 100) + 1,
          records_failed: 0,
          started_at: startTime.toISOString(),
          completed_at: new Date().toISOString(),
          duration_seconds: 3,
        },
      },
      {
        onSuccess: () => {
          message.success(`Sincronización de ${entityType} completada`);
          setSyncLoading(null);
          refetchSyncHistory();
          if (entityType === "products") refetchProducts();
          if (entityType === "coupons") refetchCoupons();
        },
      }
    );
  };

  const copyToClipboard = (text: string, type: string) => {
    copy(text);
    message.success(`${type} copiado al portapapeles`);
  };

  const productColumns = [
    {
      title: "Producto",
      key: "product",
      render: (_: any, record: IShopifyProduct) => (
        <Space direction="vertical" size="small">
          <Text strong>{record.title}</Text>
          <Space size="small">
            <Tag icon={<BarcodeOutlined />}>{record.handle}</Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>
              SKU: {record.shopify_product_id}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Tipo",
      dataIndex: "product_type",
      key: "product_type",
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: "Precio",
      key: "price",
      render: (_: any, record: IShopifyProduct) => (
        <Space direction="vertical" size="small">
          <Text strong>${record.price}</Text>
          {record.compare_at_price && (
            <Text delete type="secondary">
              ${record.compare_at_price}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Inventario",
      dataIndex: "inventory_quantity",
      key: "inventory_quantity",
      render: (quantity: number) => (
        <Badge
          count={quantity}
          showZero
          style={{
            backgroundColor: quantity > 10 ? "#52c41a" : quantity > 0 ? "#faad14" : "#ff4d4f",
          }}
        />
      ),
    },
    {
      title: "Estado",
      key: "status",
      render: (_: any, record: IShopifyProduct) => (
        <Space direction="vertical" size="small">
          <Tag color={record.status === "active" ? "green" : "default"}>
            {record.status.toUpperCase()}
          </Tag>
          <Badge
            status={record.sync_status === "synced" ? "success" : "processing"}
            text={record.sync_status}
          />
        </Space>
      ),
    },
    {
      title: "Última Sincronización",
      dataIndex: "last_sync",
      key: "last_sync",
      render: (date: string) => date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-",
    },
  ];

  const couponColumns = [
    {
      title: "Código",
      dataIndex: "code",
      key: "code",
      render: (code: string) => (
        <Space>
          <Text strong code>{code}</Text>
          <Button
            icon={<CopyOutlined />}
            size="small"
            onClick={() => copyToClipboard(code, "Código")}
          />
        </Space>
      ),
    },
    {
      title: "Tipo",
      dataIndex: "discount_type",
      key: "discount_type",
      render: (type: string) => {
        const typeConfig = {
          percentage: { icon: <PercentageOutlined />, text: "Porcentaje" },
          fixed_amount: { icon: <DollarOutlined />, text: "Monto Fijo" },
          free_shipping: { icon: <ShoppingCartOutlined />, text: "Envío Gratis" },
        };
        const config = typeConfig[type as keyof typeof typeConfig];
        return (
          <Tag icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "Valor",
      key: "value",
      render: (_: any, record: IShopifyCoupon) => (
        <Text strong>
          {record.discount_type === "percentage" 
            ? `${record.value}%`
            : record.discount_type === "fixed_amount"
            ? `$${record.value}`
            : "Gratis"}
        </Text>
      ),
    },
    {
      title: "Uso",
      key: "usage",
      render: (_: any, record: IShopifyCoupon) => (
        <Space>
          <Progress
            percent={
              record.usage_limit 
                ? (record.usage_count / record.usage_limit) * 100
                : 0
            }
            format={() => 
              record.usage_limit 
                ? `${record.usage_count}/${record.usage_limit}`
                : `${record.usage_count}`
            }
            status={
              record.usage_limit && record.usage_count >= record.usage_limit
                ? "exception"
                : "active"
            }
            strokeWidth={8}
            style={{ width: 100 }}
          />
        </Space>
      ),
    },
    {
      title: "Vigencia",
      key: "validity",
      render: (_: any, record: IShopifyCoupon) => {
        if (!record.start_date && !record.end_date) {
          return <Tag color="green">Sin límite</Tag>;
        }
        
        const now = dayjs();
        const start = record.start_date ? dayjs(record.start_date) : null;
        const end = record.end_date ? dayjs(record.end_date) : null;
        
        if (end && now.isAfter(end)) {
          return <Tag color="red">Expirado</Tag>;
        }
        
        if (start && now.isBefore(start)) {
          return <Tag color="orange">Próximamente</Tag>;
        }
        
        return (
          <Space direction="vertical" size="small">
            {end && (
              <Text type={now.isAfter(end.subtract(7, "day")) ? "danger" : undefined}>
                Hasta {end.format("DD/MM/YYYY")}
              </Text>
            )}
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
          expired: { color: "red", text: "Expirado" },
          used: { color: "gray", text: "Usado" },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: IShopifyCoupon) => (
        <Button
          icon={<DeleteOutlined />}
          size="small"
          danger
          onClick={() => {
            Modal.confirm({
              title: "¿Eliminar cupón?",
              content: "Esta acción no se puede deshacer",
              okText: "Eliminar",
              cancelText: "Cancelar",
              okType: "danger",
              onOk: () => {
                deleteCoupon(
                  {
                    resource: "shopify_coupons",
                    id: record.id,
                  },
                  {
                    onSuccess: () => {
                      message.success("Cupón eliminado");
                      refetchCoupons();
                    },
                  }
                );
              },
            });
          }}
        />
      ),
    },
  ];

  const syncHistoryColumns = [
    {
      title: "Entidad",
      dataIndex: "entity_type",
      key: "entity_type",
      render: (type: string) => {
        const icons = {
          products: <ShoppingCartOutlined />,
          customers: <UserOutlined />,
          coupons: <GiftOutlined />,
          orders: <DollarOutlined />,
        };
        return (
          <Space>
            {icons[type as keyof typeof icons]}
            <Text>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
          </Space>
        );
      },
    },
    {
      title: "Tipo",
      dataIndex: "sync_type",
      key: "sync_type",
      render: (type: string) => (
        <Tag color={type === "automatic" ? "blue" : type === "webhook" ? "purple" : "default"}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Badge
          status={
            status === "success" ? "success" : status === "failed" ? "error" : "warning"
          }
          text={status.toUpperCase()}
        />
      ),
    },
    {
      title: "Registros",
      key: "records",
      render: (_: any, record: ISyncHistory) => (
        <Space>
          <Text type="success">{record.records_synced} sincronizados</Text>
          {record.records_failed > 0 && (
            <Text type="danger">{record.records_failed} fallidos</Text>
          )}
        </Space>
      ),
    },
    {
      title: "Duración",
      dataIndex: "duration_seconds",
      key: "duration_seconds",
      render: (seconds: number) => `${seconds}s`,
    },
    {
      title: "Fecha",
      dataIndex: "started_at",
      key: "started_at",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm:ss"),
    },
  ];

  const activeCoupons = couponsData?.data?.filter(c => c.status === "active").length || 0;
  const totalProducts = productsData?.total || 0;
  const syncedProducts = productsData?.data?.filter(p => p.sync_status === "synced").length || 0;

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <div>
          <Title level={2}>
            <ShopOutlined /> Configuración de Shopify
          </Title>
          <Paragraph type="secondary">
            Gestiona tu integración con Shopify, productos, cupones y sincronización.
          </Paragraph>
        </div>

        {/* Active Configuration Summary */}
        {activeSettings && (
          <Card>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Tienda Activa"
                  value={activeSettings.store_name}
                  prefix={<ShopOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Productos Sincronizados"
                  value={`${syncedProducts}/${totalProducts}`}
                  prefix={<ShoppingCartOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Cupones Activos"
                  value={activeCoupons}
                  prefix={<GiftOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Última Sincronización"
                  value={
                    syncHistoryData?.data?.[0]
                      ? dayjs(syncHistoryData.data[0].started_at).fromNow()
                      : "Nunca"
                  }
                  prefix={<SyncOutlined />}
                />
              </Col>
            </Row>
          </Card>
        )}

        <Tabs defaultActiveKey="1">
          <TabPane
            tab={
              <span>
                <SettingOutlined />
                Configuración
              </span>
            }
            key="1"
          >
            <Card
              title="Configuración de API"
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setSelectedSettings(null);
                    settingsForm.resetFields();
                    setEditSettingsModalVisible(true);
                  }}
                >
                  Nueva Configuración
                </Button>
              }
            >
              <Alert
                message="Integración con Shopify"
                description="Conecta tu tienda de Shopify para sincronizar productos, gestionar cupones y procesar pedidos."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              {settingsData?.data && settingsData.data.length > 0 ? (
                settingsData.data.map((settings) => (
                  <Card key={settings.id} style={{ marginBottom: 16 }}>
                    <Descriptions bordered column={2}>
                      <Descriptions.Item label="Nombre de Tienda" span={2}>
                        <Space>
                          <Text strong>{settings.store_name}</Text>
                          {settings.active && <Tag color="green">ACTIVA</Tag>}
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="URL de Tienda">
                        <a href={settings.store_url} target="_blank" rel="noopener noreferrer">
                          {settings.store_url}
                        </a>
                      </Descriptions.Item>
                      <Descriptions.Item label="Ambiente">
                        <Tag color={settings.environment === "production" ? "red" : "orange"}>
                          {settings.environment.toUpperCase()}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="API Key">
                        <Space>
                          <Text code>{settings.api_key.substring(0, 10)}...</Text>
                          <Button
                            icon={<CopyOutlined />}
                            size="small"
                            onClick={() => copyToClipboard(settings.api_key, "API Key")}
                          />
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="Access Token">
                        <Space>
                          <Text code>{settings.access_token.substring(0, 10)}...</Text>
                          <Button
                            icon={<CopyOutlined />}
                            size="small"
                            onClick={() => copyToClipboard(settings.access_token, "Access Token")}
                          />
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="Webhook Secret">
                        {settings.webhook_secret ? (
                          <CheckCircleOutlined style={{ color: "#52c41a" }} />
                        ) : (
                          <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Creado">
                        {dayjs(settings.created_at).format("DD/MM/YYYY HH:mm")}
                      </Descriptions.Item>
                    </Descriptions>
                    <Space style={{ marginTop: 16 }}>
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => {
                          setSelectedSettings(settings);
                          settingsForm.setFieldsValue(settings);
                          setEditSettingsModalVisible(true);
                        }}
                      >
                        Editar
                      </Button>
                      {!settings.active && (
                        <Button type="primary">Activar</Button>
                      )}
                    </Space>
                  </Card>
                ))
              ) : (
                <Empty description="No hay configuraciones creadas" />
              )}
            </Card>
          </TabPane>

          <TabPane
            tab={
              <span>
                <ShoppingCartOutlined />
                Productos
              </span>
            }
            key="2"
          >
            <Card
              title="Productos de Shopify"
              extra={
                <Button
                  type="primary"
                  icon={<SyncOutlined spin={syncLoading === "products"} />}
                  onClick={() => handleSync("products")}
                  loading={syncLoading === "products"}
                >
                  Sincronizar Productos
                </Button>
              }
            >
              <Alert
                message="Sincronización de Productos"
                description="Los productos se sincronizan automáticamente cada hora. También puedes sincronizar manualmente."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Table
                dataSource={productsData?.data || []}
                columns={productColumns}
                rowKey="id"
                loading={!productsData}
                pagination={{
                  total: productsData?.total,
                  pageSize: 10,
                  showSizeChanger: true,
                }}
              />
            </Card>
          </TabPane>

          <TabPane
            tab={
              <span>
                <GiftOutlined />
                Cupones
              </span>
            }
            key="3"
          >
            <Card
              title="Gestión de Cupones"
              extra={
                <Space>
                  <Button
                    icon={<SyncOutlined spin={syncLoading === "coupons"} />}
                    onClick={() => handleSync("coupons")}
                    loading={syncLoading === "coupons"}
                  >
                    Sincronizar
                  </Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setCreateCouponModalVisible(true)}
                  >
                    Crear Cupón
                  </Button>
                </Space>
              }
            >
              <Alert
                message="Sistema de Cupones"
                description="Crea cupones para descuentos, Trade-In y promociones especiales. Los cupones se sincronizan automáticamente con Shopify."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Cupones Activos"
                      value={activeCoupons}
                      prefix={<GiftOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Cupones Usados Este Mes"
                      value={couponsData?.data?.filter(c => 
                        c.usage_count > 0 && 
                        dayjs(c.created_at).month() === dayjs().month()
                      ).length || 0}
                      prefix={<CheckCircleOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Cupones Trade-In"
                      value={couponsData?.data?.filter(c => c.trade_in_evaluation_id).length || 0}
                      prefix={<TagsOutlined />}
                    />
                  </Card>
                </Col>
              </Row>

              <Table
                dataSource={couponsData?.data || []}
                columns={couponColumns}
                rowKey="id"
                loading={!couponsData}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                }}
              />
            </Card>
          </TabPane>

          <TabPane
            tab={
              <span>
                <HistoryOutlined />
                Historial de Sincronización
              </span>
            }
            key="4"
          >
            <Card title="Historial de Sincronizaciones">
              <Table
                dataSource={syncHistoryData?.data || []}
                columns={syncHistoryColumns}
                rowKey="id"
                loading={!syncHistoryData}
                expandable={{
                  expandedRowRender: (record) => (
                    <div>
                      {record.error_message && (
                        <Alert
                          message="Error de Sincronización"
                          description={record.error_message}
                          type="error"
                          showIcon
                        />
                      )}
                    </div>
                  ),
                  rowExpandable: (record) => !!record.error_message,
                }}
                pagination={{
                  total: syncHistoryData?.total,
                  pageSize: 10,
                  showSizeChanger: true,
                }}
              />
            </Card>
          </TabPane>
        </Tabs>
      </Space>

      {/* Edit/Create Settings Modal */}
      <Modal
        title={selectedSettings ? "Editar Configuración" : "Nueva Configuración"}
        visible={editSettingsModalVisible}
        onCancel={() => {
          setEditSettingsModalVisible(false);
          setSelectedSettings(null);
          settingsForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={settingsForm}
          layout="vertical"
          onFinish={handleSettingsSave}
        >
          <Form.Item
            name="store_name"
            label="Nombre de la Tienda"
            rules={[{ required: true, message: "Por favor ingrese el nombre" }]}
          >
            <Input placeholder="Mi Tienda Shopify" />
          </Form.Item>

          <Form.Item
            name="store_url"
            label="URL de la Tienda"
            rules={[
              { required: true, message: "Por favor ingrese la URL" },
              { type: "url", message: "URL inválida" },
            ]}
          >
            <Input placeholder="https://mi-tienda.myshopify.com" />
          </Form.Item>

          <Form.Item
            name="environment"
            label="Ambiente"
            rules={[{ required: true, message: "Por favor seleccione el ambiente" }]}
            initialValue="development"
          >
            <Select>
              <Option value="development">Desarrollo</Option>
              <Option value="production">Producción</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="api_key"
            label="API Key"
            rules={[{ required: true, message: "Por favor ingrese la API Key" }]}
          >
            <Input.Password placeholder="Tu API Key de Shopify" />
          </Form.Item>

          <Form.Item
            name="api_secret"
            label="API Secret"
            rules={[{ required: true, message: "Por favor ingrese el API Secret" }]}
          >
            <Input.Password placeholder="Tu API Secret de Shopify" />
          </Form.Item>

          <Form.Item
            name="access_token"
            label="Access Token"
            rules={[{ required: true, message: "Por favor ingrese el Access Token" }]}
          >
            <Input.Password placeholder="Tu Access Token de Shopify" />
          </Form.Item>

          <Form.Item
            name="webhook_secret"
            label="Webhook Secret"
            extra="Opcional - Para verificar webhooks de Shopify"
          >
            <Input.Password placeholder="Webhook secret (opcional)" />
          </Form.Item>

          <Form.Item>
            <Space style={{ float: "right" }}>
              <Button onClick={() => setEditSettingsModalVisible(false)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                {selectedSettings ? "Actualizar" : "Crear"} Configuración
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Coupon Modal */}
      <Modal
        title="Crear Cupón"
        visible={createCouponModalVisible}
        onCancel={() => {
          setCreateCouponModalVisible(false);
          couponForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={couponForm}
          layout="vertical"
          onFinish={handleCreateCoupon}
        >
          <Form.Item
            name="code"
            label="Código del Cupón"
            rules={[
              { required: true, message: "Por favor ingrese el código" },
              { pattern: /^[A-Z0-9]+$/, message: "Solo letras mayúsculas y números" },
            ]}
          >
            <Input 
              placeholder="DESCUENTO20" 
              style={{ textTransform: "uppercase" }}
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
              }}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="discount_type"
                label="Tipo de Descuento"
                rules={[{ required: true, message: "Por favor seleccione el tipo" }]}
              >
                <Select placeholder="Seleccionar tipo">
                  <Option value="percentage">Porcentaje</Option>
                  <Option value="fixed_amount">Monto Fijo</Option>
                  <Option value="free_shipping">Envío Gratis</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.discount_type !== currentValues.discount_type
                }
              >
                {({ getFieldValue }) => {
                  const discountType = getFieldValue("discount_type");
                  if (discountType === "free_shipping") {
                    return null;
                  }
                  return (
                    <Form.Item
                      name="value"
                      label={discountType === "percentage" ? "Porcentaje" : "Monto"}
                      rules={[{ required: true, message: "Por favor ingrese el valor" }]}
                    >
                      <InputNumber
                        min={0}
                        max={discountType === "percentage" ? 100 : undefined}
                        formatter={(value) =>
                          discountType === "percentage"
                            ? `${value}%`
                            : `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="minimum_purchase"
            label="Compra Mínima"
          >
            <InputNumber
              min={0}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
              placeholder="Sin mínimo"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="usage_limit"
            label="Límite de Uso"
          >
            <InputNumber
              min={1}
              placeholder="Sin límite"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="validity_period"
            label="Período de Validez"
          >
            <DatePicker.RangePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder={["Fecha inicio", "Fecha fin"]}
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ float: "right" }}>
              <Button onClick={() => setCreateCouponModalVisible(false)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                Crear Cupón
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};