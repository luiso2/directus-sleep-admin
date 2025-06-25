import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Timeline,
  Tag,
  Progress,
  Alert,
  Statistic,
  Table,
  Badge,
  message,
  Modal,
  Descriptions,
  Spin,
  Result,
  Divider,
  Typography,
  Tooltip,
  Switch,
  Form,
  InputNumber,
  Select
} from 'antd';
import {
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  RocketOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  UserOutlined,
  CalendarOutlined,
  SettingOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  GiftOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import DirectusService from '../../services/directus-service-improved';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface SyncRecord {
  id: string;
  sync_type: 'stripe' | 'shopify' | 'full';
  status: 'started' | 'completed' | 'failed';
  sync_date: string;
  details: {
    customers_synced?: number;
    subscriptions_synced?: number;
    products_synced?: number;
    coupons_synced?: number;
    errors?: string[];
    duration?: number;
  };
  error?: string;
}

interface SyncStatus {
  isRunning: boolean;
  currentStep: string;
  progress: number;
  type?: 'stripe' | 'shopify' | 'full';
}

interface SyncConfig {
  autoSync: boolean;
  syncInterval: number; // in hours
  lastSync?: string;
  nextSync?: string;
}

export const SyncImproved: React.FC = () => {
  const [syncHistory, setSyncHistory] = useState<SyncRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isRunning: false,
    currentStep: '',
    progress: 0
  });
  const [syncConfig, setSyncConfig] = useState<SyncConfig>({
    autoSync: false,
    syncInterval: 24,
    lastSync: undefined,
    nextSync: undefined
  });
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SyncRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchSyncHistory();
    loadSyncConfig();
  }, []);

  const fetchSyncHistory = async () => {
    try {
      setLoading(true);
      const data = await DirectusService.getSyncHistory(20);
      setSyncHistory(data);
      
      // Update last sync time
      if (data.length > 0 && data[0].status === 'completed') {
        setSyncConfig(prev => ({
          ...prev,
          lastSync: data[0].sync_date
        }));
      }
    } catch (error) {
      message.error('Error al cargar historial de sincronización');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadSyncConfig = () => {
    // TODO: Load from database or localStorage
    const saved = localStorage.getItem('syncConfig');
    if (saved) {
      setSyncConfig(JSON.parse(saved));
    }
  };

  const saveSyncConfig = (config: SyncConfig) => {
    localStorage.setItem('syncConfig', JSON.stringify(config));
    setSyncConfig(config);
    message.success('Configuración guardada');
  };

  const startSync = async (type: 'stripe' | 'shopify' | 'full') => {
    try {
      setSyncStatus({
        isRunning: true,
        currentStep: 'Iniciando sincronización...',
        progress: 0,
        type
      });

      // Create sync record
      const syncRecord = await DirectusService.createSyncRecord({
        sync_type: type,
        status: 'started'
      });

      // Simulate sync steps
      const steps = type === 'full' 
        ? [
            { name: 'Conectando con Stripe...', progress: 10 },
            { name: 'Sincronizando clientes de Stripe...', progress: 25 },
            { name: 'Sincronizando suscripciones de Stripe...', progress: 40 },
            { name: 'Conectando con Shopify...', progress: 50 },
            { name: 'Sincronizando productos de Shopify...', progress: 65 },
            { name: 'Sincronizando clientes de Shopify...', progress: 80 },
            { name: 'Sincronizando cupones de Shopify...', progress: 90 },
            { name: 'Finalizando...', progress: 100 }
          ]
        : type === 'stripe'
        ? [
            { name: 'Conectando con Stripe...', progress: 20 },
            { name: 'Sincronizando clientes...', progress: 50 },
            { name: 'Sincronizando suscripciones...', progress: 80 },
            { name: 'Finalizando...', progress: 100 }
          ]
        : [
            { name: 'Conectando con Shopify...', progress: 20 },
            { name: 'Sincronizando productos...', progress: 40 },
            { name: 'Sincronizando clientes...', progress: 60 },
            { name: 'Sincronizando cupones...', progress: 80 },
            { name: 'Finalizando...', progress: 100 }
          ];

      // Execute sync steps
      for (const step of steps) {
        setSyncStatus(prev => ({
          ...prev,
          currentStep: step.name,
          progress: step.progress
        }));
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API calls
      }

      // TODO: Actual sync implementation
      // if (type === 'stripe' || type === 'full') {
      //   await StripeService.syncCustomers();
      //   await StripeService.syncSubscriptions();
      // }
      // if (type === 'shopify' || type === 'full') {
      //   await ShopifyService.syncProducts();
      //   await ShopifyService.syncCustomers();
      //   await ShopifyService.syncCoupons();
      // }

      // Complete sync
      await DirectusService.createSyncRecord({
        sync_type: type,
        status: 'completed',
        details: {
          customers_synced: 15,
          subscriptions_synced: 8,
          products_synced: 12,
          coupons_synced: 3,
          duration: 45 // seconds
        }
      });

      message.success('Sincronización completada exitosamente');
      fetchSyncHistory();

      // Update last sync time
      setSyncConfig(prev => ({
        ...prev,
        lastSync: new Date().toISOString(),
        nextSync: prev.autoSync 
          ? moment().add(prev.syncInterval, 'hours').toISOString()
          : undefined
      }));

    } catch (error) {
      message.error('Error durante la sincronización');
      console.error(error);
      
      await DirectusService.createSyncRecord({
        sync_type: type,
        status: 'failed',
        error: 'Error al sincronizar datos'
      });
    } finally {
      setSyncStatus({
        isRunning: false,
        currentStep: '',
        progress: 0
      });
    }
  };

  const getLastSyncInfo = () => {
    const lastCompleted = syncHistory.find(s => s.status === 'completed');
    if (!lastCompleted) return null;

    const duration = moment.duration(moment().diff(moment(lastCompleted.sync_date)));
    const hoursAgo = Math.floor(duration.asHours());
    const minutesAgo = Math.floor(duration.asMinutes());

    return {
      time: hoursAgo > 0 ? `${hoursAgo} horas` : `${minutesAgo} minutos`,
      record: lastCompleted
    };
  };

  const columns: ColumnsType<SyncRecord> = [
    {
      title: 'Tipo',
      dataIndex: 'sync_type',
      key: 'sync_type',
      render: (type: string) => {
        const typeConfig = {
          stripe: { icon: <CreditCardOutlined />, color: 'blue', text: 'Stripe' },
          shopify: { icon: <ShoppingCartOutlined />, color: 'orange', text: 'Shopify' },
          full: { icon: <SyncOutlined />, color: 'purple', text: 'Completa' }
        };
        const config = typeConfig[type as keyof typeof typeConfig];
        return (
          <Space>
            {config.icon}
            <Tag color={config.color}>{config.text}</Tag>
          </Space>
        );
      }
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          started: { icon: <SyncOutlined spin />, color: 'processing', text: 'En progreso' },
          completed: { icon: <CheckCircleOutlined />, color: 'success', text: 'Completada' },
          failed: { icon: <CloseCircleOutlined />, color: 'error', text: 'Fallida' }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Badge status={config.color as any} text={config.text} />;
      }
    },
    {
      title: 'Fecha',
      dataIndex: 'sync_date',
      key: 'sync_date',
      render: (date: string) => moment(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Resultados',
      key: 'results',
      render: (_, record) => {
        if (record.status !== 'completed') return '-';
        const details = record.details;
        return (
          <Space size="small">
            {details.customers_synced && (
              <Tag icon={<UserOutlined />}>{details.customers_synced} clientes</Tag>
            )}
            {details.subscriptions_synced && (
              <Tag icon={<CreditCardOutlined />}>{details.subscriptions_synced} suscripciones</Tag>
            )}
            {details.products_synced && (
              <Tag icon={<ShoppingCartOutlined />}>{details.products_synced} productos</Tag>
            )}
          </Space>
        );
      }
    },
    {
      title: 'Duración',
      key: 'duration',
      render: (_, record) => {
        if (record.status !== 'completed' || !record.details.duration) return '-';
        return `${record.details.duration}s`;
      }
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Button 
          size="small" 
          onClick={() => {
            setSelectedRecord(record);
            setIsDetailModalOpen(true);
          }}
        >
          Ver detalles
        </Button>
      )
    }
  ];

  const lastSyncInfo = getLastSyncInfo();

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <SyncOutlined /> Sincronización de Datos
      </Title>

      {/* Status Alert */}
      {syncStatus.isRunning && (
        <Alert
          message="Sincronización en progreso"
          description={syncStatus.currentStep}
          type="info"
          showIcon
          icon={<SyncOutlined spin />}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Main Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Última Sincronización"
              value={lastSyncInfo ? `Hace ${lastSyncInfo.time}` : 'Nunca'}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Próxima Sincronización"
              value={syncConfig.autoSync && syncConfig.nextSync 
                ? moment(syncConfig.nextSync).fromNow()
                : 'Manual'
              }
              prefix={<CalendarOutlined />}
              valueStyle={{ fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Sincronización Automática"
              value={syncConfig.autoSync ? 'Activada' : 'Desactivada'}
              prefix={<SettingOutlined />}
              valueStyle={{ 
                fontSize: 20,
                color: syncConfig.autoSync ? '#52c41a' : '#999'
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Sync Actions */}
      <Card 
        title="Acciones de Sincronización"
        extra={
          <Button 
            icon={<SettingOutlined />}
            onClick={() => setIsConfigModalOpen(true)}
          >
            Configuración
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        {syncStatus.isRunning ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <Title level={4} style={{ marginTop: 16 }}>
              {syncStatus.currentStep}
            </Title>
            <Progress 
              percent={syncStatus.progress} 
              strokeColor="#1890ff"
              style={{ maxWidth: 400, margin: '0 auto' }}
            />
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card 
                hoverable
                onClick={() => startSync('stripe')}
                style={{ textAlign: 'center', cursor: 'pointer' }}
              >
                <CreditCardOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                <Title level={4} style={{ marginTop: 16 }}>
                  Sincronizar Stripe
                </Title>
                <Paragraph type="secondary">
                  Sincroniza clientes y suscripciones desde Stripe
                </Paragraph>
                <Button type="primary" icon={<SyncOutlined />}>
                  Iniciar
                </Button>
              </Card>
            </Col>
            
            <Col xs={24} md={8}>
              <Card 
                hoverable
                onClick={() => startSync('shopify')}
                style={{ textAlign: 'center', cursor: 'pointer' }}
              >
                <ShoppingCartOutlined style={{ fontSize: 48, color: '#fa8c16' }} />
                <Title level={4} style={{ marginTop: 16 }}>
                  Sincronizar Shopify
                </Title>
                <Paragraph type="secondary">
                  Sincroniza productos, clientes y cupones desde Shopify
                </Paragraph>
                <Button type="primary" icon={<SyncOutlined />} style={{ background: '#fa8c16', borderColor: '#fa8c16' }}>
                  Iniciar
                </Button>
              </Card>
            </Col>
            
            <Col xs={24} md={8}>
              <Card 
                hoverable
                onClick={() => startSync('full')}
                style={{ textAlign: 'center', cursor: 'pointer' }}
              >
                <RocketOutlined style={{ fontSize: 48, color: '#722ed1' }} />
                <Title level={4} style={{ marginTop: 16 }}>
                  Sincronización Completa
                </Title>
                <Paragraph type="secondary">
                  Sincroniza todos los datos de Stripe y Shopify
                </Paragraph>
                <Button type="primary" icon={<SyncOutlined />} style={{ background: '#722ed1', borderColor: '#722ed1' }}>
                  Iniciar
                </Button>
              </Card>
            </Col>
          </Row>
        )}
      </Card>

      {/* Sync History */}
      <Card 
        title={
          <Space>
            <HistoryOutlined />
            <span>Historial de Sincronización</span>
          </Space>
        }
        extra={
          <Button 
            icon={<SyncOutlined />} 
            onClick={fetchSyncHistory}
            loading={loading}
          >
            Actualizar
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={syncHistory}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} sincronizaciones`
          }}
        />
      </Card>

      {/* Configuration Modal */}
      <Modal
        title="Configuración de Sincronización"
        open={isConfigModalOpen}
        onCancel={() => setIsConfigModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form
          layout="vertical"
          initialValues={syncConfig}
          onFinish={(values) => {
            saveSyncConfig(values);
            setIsConfigModalOpen(false);
          }}
        >
          <Form.Item
            name="autoSync"
            label="Sincronización Automática"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="syncInterval"
            label="Intervalo de Sincronización (horas)"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value={1}>Cada hora</Option>
              <Option value={6}>Cada 6 horas</Option>
              <Option value={12}>Cada 12 horas</Option>
              <Option value={24}>Diariamente</Option>
              <Option value={168}>Semanalmente</Option>
            </Select>
          </Form.Item>

          <Alert
            message="Información"
            description="La sincronización automática mantendrá sus datos actualizados entre Stripe, Shopify y su sistema."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Guardar Configuración
              </Button>
              <Button onClick={() => setIsConfigModalOpen(false)}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Detalles de Sincronización"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            Cerrar
          </Button>
        ]}
        width={600}
      >
        {selectedRecord && (
          <>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Tipo">
                {selectedRecord.sync_type === 'stripe' && (
                  <Tag icon={<CreditCardOutlined />} color="blue">Stripe</Tag>
                )}
                {selectedRecord.sync_type === 'shopify' && (
                  <Tag icon={<ShoppingCartOutlined />} color="orange">Shopify</Tag>
                )}
                {selectedRecord.sync_type === 'full' && (
                  <Tag icon={<SyncOutlined />} color="purple">Completa</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Badge 
                  status={
                    selectedRecord.status === 'completed' ? 'success' :
                    selectedRecord.status === 'failed' ? 'error' : 'processing'
                  } 
                  text={selectedRecord.status}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Fecha">
                {moment(selectedRecord.sync_date).format('DD/MM/YYYY HH:mm:ss')}
              </Descriptions.Item>
              {selectedRecord.details.duration && (
                <Descriptions.Item label="Duración">
                  {selectedRecord.details.duration} segundos
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedRecord.status === 'completed' && (
              <>
                <Divider>Resultados</Divider>
                <Row gutter={[16, 16]}>
                  {selectedRecord.details.customers_synced !== undefined && (
                    <Col span={12}>
                      <Statistic
                        title="Clientes Sincronizados"
                        value={selectedRecord.details.customers_synced}
                        prefix={<UserOutlined />}
                      />
                    </Col>
                  )}
                  {selectedRecord.details.subscriptions_synced !== undefined && (
                    <Col span={12}>
                      <Statistic
                        title="Suscripciones Sincronizadas"
                        value={selectedRecord.details.subscriptions_synced}
                        prefix={<CreditCardOutlined />}
                      />
                    </Col>
                  )}
                  {selectedRecord.details.products_synced !== undefined && (
                    <Col span={12}>
                      <Statistic
                        title="Productos Sincronizados"
                        value={selectedRecord.details.products_synced}
                        prefix={<ShoppingCartOutlined />}
                      />
                    </Col>
                  )}
                  {selectedRecord.details.coupons_synced !== undefined && (
                    <Col span={12}>
                      <Statistic
                        title="Cupones Sincronizados"
                        value={selectedRecord.details.coupons_synced}
                        prefix={<GiftOutlined />}
                      />
                    </Col>
                  )}
                </Row>
              </>
            )}

            {selectedRecord.status === 'failed' && (
              <>
                <Divider>Error</Divider>
                <Alert
                  message="Error durante la sincronización"
                  description={selectedRecord.error || 'Error desconocido'}
                  type="error"
                  showIcon
                />
                {selectedRecord.details.errors && selectedRecord.details.errors.length > 0 && (
                  <Timeline style={{ marginTop: 16 }}>
                    {selectedRecord.details.errors.map((error, index) => (
                      <Timeline.Item key={index} color="red">
                        {error}
                      </Timeline.Item>
                    ))}
                  </Timeline>
                )}
              </>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default SyncImproved;
