import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  message,
  Table,
  Tag,
  Modal,
  Alert,
  Progress,
  Timeline,
  Statistic,
  Badge,
  Descriptions,
  Typography,
  Switch,
  List,
  Avatar,
  Tooltip,
  Tabs,
  Result,
  Divider,
  Select
} from 'antd';
import {
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  SettingOutlined,
  CloudSyncOutlined,
  DatabaseOutlined,
  ShopOutlined,
  CreditCardOutlined,
  UserOutlined,
  BugOutlined,
  ThunderboltOutlined,
  HistoryOutlined,
  RobotOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { SyncService, SyncHistory } from '../../services';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface Conflict {
  type: 'duplicate' | 'missing' | 'stale';
  entity: string;
  details: any;
}

const SyncManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [syncHistory, setSyncHistory] = useState<SyncHistory[]>([]);
  const [conflicts, setConflicts] = useState<{
    duplicateEmails: any[];
    missingMappings: any[];
    staleData: any[];
  }>({ duplicateEmails: [], missingMappings: [], staleData: [] });
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [syncInterval, setSyncInterval] = useState(60);
  const [activeSyncs, setActiveSyncs] = useState<Map<string, any>>(new Map());
  const [selectedHistory, setSelectedHistory] = useState<SyncHistory | null>(null);

  // Cargar datos
  const fetchData = async () => {
    setLoading(true);
    try {
      const [history, conflictsData] = await Promise.all([
        SyncService.getSyncHistory(50),
        SyncService.checkForConflicts()
      ]);
      
      setSyncHistory(history);
      setConflicts(conflictsData);
    } catch (error: any) {
      message.error('Error al cargar datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Ejecutar sincronización completa
  const handleFullSync = async () => {
    Modal.confirm({
      title: 'Sincronización Completa',
      content: 'Esto sincronizará todos los datos entre Stripe, Shopify y el sistema local. ¿Desea continuar?',
      onOk: async () => {
        setLoading(true);
        const syncId = 'full-sync-' + Date.now();
        
        try {
          // Actualizar estado de sincronización activa
          setActiveSyncs(prev => new Map(prev).set(syncId, {
            type: 'full',
            status: 'running',
            progress: 0,
            startTime: new Date()
          }));

          const results = await SyncService.runFullSync();
          
          // Actualizar estado como completado
          setActiveSyncs(prev => {
            const map = new Map(prev);
            map.set(syncId, {
              ...map.get(syncId),
              status: 'completed',
              progress: 100,
              results
            });
            return map;
          });

          message.success('Sincronización completa exitosa');
          fetchData();
          
          // Limpiar después de 5 segundos
          setTimeout(() => {
            setActiveSyncs(prev => {
              const map = new Map(prev);
              map.delete(syncId);
              return map;
            });
          }, 5000);
        } catch (error: any) {
          setActiveSyncs(prev => {
            const map = new Map(prev);
            map.set(syncId, {
              ...map.get(syncId),
              status: 'failed',
              error: error.message
            });
            return map;
          });
          
          message.error('Error en la sincronización: ' + error.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Sincronizar solo clientes
  const handleSyncCustomers = async () => {
    setLoading(true);
    try {
      const results = await SyncService.syncCustomers();
      message.success(`Clientes sincronizados: ${results.synced} exitosos`);
      if (results.errors.length > 0) {
        message.warning(`Errores encontrados: ${results.errors.length}`);
      }
      fetchData();
    } catch (error: any) {
      message.error('Error al sincronizar clientes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Resolver conflictos
  const handleResolveConflicts = async () => {
    Modal.confirm({
      title: 'Resolver Conflictos Automáticamente',
      content: 'El sistema intentará resolver los conflictos detectados. Esto puede fusionar clientes duplicados y actualizar datos desactualizados.',
      onOk: async () => {
        setLoading(true);
        try {
          const results = await SyncService.resolveConflicts();
          message.success(
            `Conflictos resueltos: ${results.mergedDuplicates} duplicados fusionados, ` +
            `${results.createdMappings} mapeos creados, ${results.refreshedStale} actualizados`
          );
          if (results.errors.length > 0) {
            message.warning(`Errores encontrados: ${results.errors.length}`);
          }
          fetchData();
        } catch (error: any) {
          message.error('Error al resolver conflictos: ' + error.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Habilitar/deshabilitar sincronización automática
  const handleAutoSyncToggle = (enabled: boolean) => {
    setAutoSyncEnabled(enabled);
    if (enabled) {
      SyncService.scheduleAutoSync(syncInterval);
      message.success(`Sincronización automática activada (cada ${syncInterval} minutos)`);
    } else {
      message.info('Sincronización automática desactivada');
      // En producción, aquí desactivarías el scheduler
    }
  };

  // Obtener icono según el servicio
  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'stripe': return <CreditCardOutlined style={{ color: '#6772e5' }} />;
      case 'shopify': return <ShopOutlined style={{ color: '#96bf48' }} />;
      case 'all': return <CloudSyncOutlined style={{ color: '#1890ff' }} />;
      default: return <DatabaseOutlined />;
    }
  };

  // Obtener color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'started': return 'processing';
      default: return 'default';
    }
  };

  // Columnas del historial
  const historyColumns: ColumnsType<SyncHistory> = [
    {
      title: 'Servicio',
      dataIndex: 'service',
      key: 'service',
      render: (service) => (
        <Space>
          {getServiceIcon(service)}
          <Text style={{ textTransform: 'capitalize' }}>{service}</Text>
        </Space>
      ),
      filters: [
        { text: 'Todos', value: 'all' },
        { text: 'Stripe', value: 'stripe' },
        { text: 'Shopify', value: 'shopify' }
      ],
      onFilter: (value, record) => record.service === value
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'full_sync' ? 'blue' : type === 'webhook' ? 'purple' : 'default'}>
          {type === 'full_sync' ? 'Sincronización Completa' :
           type === 'partial_sync' ? 'Sincronización Parcial' :
           'Webhook'}
        </Tag>
      )
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge status={getStatusColor(status) as any} text={
          status === 'completed' ? 'Completado' :
          status === 'failed' ? 'Fallido' :
          'En Progreso'
        } />
      ),
      filters: [
        { text: 'Completado', value: 'completed' },
        { text: 'Fallido', value: 'failed' },
        { text: 'En Progreso', value: 'started' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Inicio',
      dataIndex: 'started_at',
      key: 'started_at',
      render: (date) => (
        <Tooltip title={dayjs(date).format('DD/MM/YYYY HH:mm:ss')}>
          {dayjs(date).fromNow()}
        </Tooltip>
      ),
      sorter: (a, b) => dayjs(a.started_at).unix() - dayjs(b.started_at).unix(),
      defaultSortOrder: 'descend'
    },
    {
      title: 'Duración',
      key: 'duration',
      render: (_, record) => {
        if (!record.completed_at) return '-';
        const duration = dayjs(record.completed_at).diff(dayjs(record.started_at), 'second');
        return `${duration}s`;
      }
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => setSelectedHistory(record)}
        >
          Ver detalles
        </Button>
      )
    }
  ];

  // Calcular estadísticas
  const stats = {
    totalSyncs: syncHistory.length,
    successfulSyncs: syncHistory.filter(h => h.status === 'completed').length,
    failedSyncs: syncHistory.filter(h => h.status === 'failed').length,
    lastSync: syncHistory.length > 0 ? syncHistory[0] : null,
    totalConflicts: conflicts.duplicateEmails.length + conflicts.missingMappings.length + conflicts.staleData.length
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Estadísticas principales */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Sincronizaciones"
              value={stats.totalSyncs}
              prefix={<SyncOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Exitosas"
              value={stats.successfulSyncs}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
              suffix={`/ ${stats.totalSyncs}`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Conflictos Detectados"
              value={stats.totalConflicts}
              valueStyle={{ color: stats.totalConflicts > 0 ? '#cf1322' : '#3f8600' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Última Sincronización"
              value={stats.lastSync ? dayjs(stats.lastSync.started_at).fromNow() : 'Nunca'}
              valueStyle={{ fontSize: '16px' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Panel principal */}
      <Card
        title={
          <Space>
            <CloudSyncOutlined style={{ fontSize: '24px' }} />
            <Title level={4} style={{ margin: 0 }}>Centro de Sincronización</Title>
          </Space>
        }
      >
        <Tabs defaultActiveKey="1">
          {/* Estado General */}
          <TabPane
            tab={
              <span>
                <DatabaseOutlined />
                Estado General
              </span>
            }
            key="1"
          >
            {/* Sincronizaciones activas */}
            {activeSyncs.size > 0 && (
              <Alert
                message="Sincronizaciones en Progreso"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
                description={
                  <List
                    dataSource={Array.from(activeSyncs.entries())}
                    renderItem={([id, sync]) => (
                      <List.Item key={id}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Space>
                            {sync.status === 'running' && <SyncOutlined spin />}
                            {sync.status === 'completed' && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
                            {sync.status === 'failed' && <CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                            <Text>Sincronización {sync.type}</Text>
                          </Space>
                          {sync.status === 'running' && (
                            <Progress percent={sync.progress} size="small" />
                          )}
                        </Space>
                      </List.Item>
                    )}
                  />
                }
              />
            )}

            {/* Controles de sincronización */}
            <Card title="Controles de Sincronización" style={{ marginBottom: 24 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Title level={5}>Sincronización Manual</Title>
                      <Space wrap>
                        <Button
                          type="primary"
                          icon={<CloudSyncOutlined />}
                          onClick={handleFullSync}
                          loading={loading}
                          size="large"
                        >
                          Sincronización Completa
                        </Button>
                        <Button
                          icon={<UserOutlined />}
                          onClick={handleSyncCustomers}
                          loading={loading}
                        >
                          Sincronizar Clientes
                        </Button>
                      </Space>
                    </Space>
                  </Col>
                  <Col span={12}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Title level={5}>Sincronización Automática</Title>
                      <Space align="center">
                        <Switch
                          checked={autoSyncEnabled}
                          onChange={handleAutoSyncToggle}
                          checkedChildren={<CheckCircleOutlined />}
                          unCheckedChildren={<CloseCircleOutlined />}
                        />
                        <Text>Sincronizar cada</Text>
                        <Select
                          value={syncInterval}
                          onChange={setSyncInterval}
                          style={{ width: 100 }}
                          disabled={!autoSyncEnabled}
                        >
                          <Option value={15}>15 min</Option>
                          <Option value={30}>30 min</Option>
                          <Option value={60}>1 hora</Option>
                          <Option value={120}>2 horas</Option>
                        </Select>
                      </Space>
                    </Space>
                  </Col>
                </Row>
              </Space>
            </Card>

            {/* Estado de servicios */}
            <Row gutter={16}>
              <Col span={8}>
                <Card
                  title={
                    <Space>
                      <CreditCardOutlined style={{ color: '#6772e5' }} />
                      <Text>Stripe</Text>
                    </Space>
                  }
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Badge status="success" text="Conectado" />
                    <Text type="secondary">Webhook activo</Text>
                    <Button type="link" size="small" href="/stripe">
                      Configurar →
                    </Button>
                  </Space>
                </Card>
              </Col>
              <Col span={8}>
                <Card
                  title={
                    <Space>
                      <ShopOutlined style={{ color: '#96bf48' }} />
                      <Text>Shopify</Text>
                    </Space>
                  }
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Badge status="success" text="Conectado" />
                    <Text type="secondary">API configurada</Text>
                    <Button type="link" size="small" href="/shopify">
                      Configurar →
                    </Button>
                  </Space>
                </Card>
              </Col>
              <Col span={8}>
                <Card
                  title={
                    <Space>
                      <DatabaseOutlined style={{ color: '#1890ff' }} />
                      <Text>Base de Datos</Text>
                    </Space>
                  }
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Badge status="success" text="Operativa" />
                    <Text type="secondary">PostgreSQL</Text>
                    <Button type="link" size="small" disabled>
                      Estado OK
                    </Button>
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Conflictos */}
          <TabPane
            tab={
              <span>
                <ExclamationCircleOutlined />
                Conflictos ({stats.totalConflicts})
              </span>
            }
            key="2"
          >
            {stats.totalConflicts === 0 ? (
              <Result
                status="success"
                title="No se detectaron conflictos"
                subTitle="Todos los datos están sincronizados correctamente"
                extra={
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchData}
                  >
                    Verificar Nuevamente
                  </Button>
                }
              />
            ) : (
              <>
                <Alert
                  message="Conflictos Detectados"
                  description={`Se encontraron ${stats.totalConflicts} conflictos que requieren atención`}
                  type="warning"
                  showIcon
                  action={
                    <Button
                      size="small"
                      type="primary"
                      danger
                      onClick={handleResolveConflicts}
                      loading={loading}
                    >
                      Resolver Automáticamente
                    </Button>
                  }
                  style={{ marginBottom: 24 }}
                />

                <Tabs defaultActiveKey="duplicates">
                  <TabPane
                    tab={`Emails Duplicados (${conflicts.duplicateEmails.length})`}
                    key="duplicates"
                  >
                    <List
                      dataSource={conflicts.duplicateEmails}
                      renderItem={item => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#ff4d4f' }} />}
                            title={item.email}
                            description={`IDs de clientes: ${item.customerIds.join(', ')}`}
                          />
                          <Button size="small">Resolver</Button>
                        </List.Item>
                      )}
                    />
                  </TabPane>

                  <TabPane
                    tab={`Mapeos Faltantes (${conflicts.missingMappings.length})`}
                    key="missing"
                  >
                    <List
                      dataSource={conflicts.missingMappings}
                      renderItem={item => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar icon={<WarningOutlined />} style={{ backgroundColor: '#faad14' }} />}
                            title={`Cliente ID: ${item.customerId}`}
                            description={
                              <Space direction="vertical" size="small">
                                <Text>Email: {item.email}</Text>
                                {item.stripeId && <Text type="secondary">Stripe: {item.stripeId}</Text>}
                                {item.shopifyId && <Text type="secondary">Shopify: {item.shopifyId}</Text>}
                              </Space>
                            }
                          />
                          <Button size="small">Crear Mapeo</Button>
                        </List.Item>
                      )}
                    />
                  </TabPane>

                  <TabPane
                    tab={`Datos Desactualizados (${conflicts.staleData.length})`}
                    key="stale"
                  >
                    <List
                      dataSource={conflicts.staleData}
                      renderItem={item => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar icon={<ClockCircleOutlined />} style={{ backgroundColor: '#d9d9d9' }} />}
                            title={`${item.entity_type} - ID: ${item.local_id}`}
                            description={`Última sincronización: ${dayjs(item.last_synced).fromNow()}`}
                          />
                          <Button size="small">Actualizar</Button>
                        </List.Item>
                      )}
                    />
                  </TabPane>
                </Tabs>
              </>
            )}
          </TabPane>

          {/* Historial */}
          <TabPane
            tab={
              <span>
                <HistoryOutlined />
                Historial
              </span>
            }
            key="3"
          >
            <Table
              columns={historyColumns}
              dataSource={syncHistory}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} sincronizaciones`
              }}
            />
          </TabPane>

          {/* Configuración */}
          <TabPane
            tab={
              <span>
                <SettingOutlined />
                Configuración
              </span>
            }
            key="4"
          >
            <Card title="Configuración de Sincronización">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Alert
                  message="Sincronización Automática"
                  description="Configure la frecuencia y los parámetros de sincronización automática"
                  type="info"
                  showIcon
                />

                <Descriptions column={1} bordered>
                  <Descriptions.Item label="Estado">
                    <Switch
                      checked={autoSyncEnabled}
                      onChange={handleAutoSyncToggle}
                      checkedChildren="Activa"
                      unCheckedChildren="Inactiva"
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="Intervalo">
                    <Select
                      value={syncInterval}
                      onChange={setSyncInterval}
                      style={{ width: 200 }}
                    >
                      <Option value={15}>Cada 15 minutos</Option>
                      <Option value={30}>Cada 30 minutos</Option>
                      <Option value={60}>Cada hora</Option>
                      <Option value={120}>Cada 2 horas</Option>
                      <Option value={360}>Cada 6 horas</Option>
                      <Option value={720}>Cada 12 horas</Option>
                      <Option value={1440}>Una vez al día</Option>
                    </Select>
                  </Descriptions.Item>
                  <Descriptions.Item label="Próxima Ejecución">
                    {autoSyncEnabled ? (
                      <Text>En {syncInterval} minutos</Text>
                    ) : (
                      <Text type="secondary">No programada</Text>
                    )}
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <Title level={5}>Opciones Avanzadas</Title>
                <Space direction="vertical">
                  <Switch
                    checkedChildren="Resolver conflictos automáticamente"
                    unCheckedChildren="Notificar conflictos solamente"
                    defaultChecked
                  />
                  <Switch
                    checkedChildren="Sincronizar webhooks en tiempo real"
                    unCheckedChildren="Procesar webhooks en lote"
                    defaultChecked
                  />
                  <Switch
                    checkedChildren="Registrar todos los eventos"
                    unCheckedChildren="Solo registrar errores"
                  />
                </Space>
              </Space>
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal de detalles del historial */}
      <Modal
        title="Detalles de Sincronización"
        open={!!selectedHistory}
        onCancel={() => setSelectedHistory(null)}
        footer={null}
        width={700}
      >
        {selectedHistory && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Servicio" span={2}>
                <Space>
                  {getServiceIcon(selectedHistory.service)}
                  <Text style={{ textTransform: 'capitalize' }}>{selectedHistory.service}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Tipo">
                {selectedHistory.type === 'full_sync' ? 'Sincronización Completa' :
                 selectedHistory.type === 'partial_sync' ? 'Sincronización Parcial' :
                 'Webhook'}
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Badge status={getStatusColor(selectedHistory.status) as any} text={
                  selectedHistory.status === 'completed' ? 'Completado' :
                  selectedHistory.status === 'failed' ? 'Fallido' :
                  'En Progreso'
                } />
              </Descriptions.Item>
              <Descriptions.Item label="Inicio">
                {dayjs(selectedHistory.started_at).format('DD/MM/YYYY HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Fin">
                {selectedHistory.completed_at ? 
                  dayjs(selectedHistory.completed_at).format('DD/MM/YYYY HH:mm:ss') : 
                  '-'
                }
              </Descriptions.Item>
              {selectedHistory.error && (
                <Descriptions.Item label="Error" span={2}>
                  <Text type="danger">{selectedHistory.error}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedHistory.details && (
              <>
                <Divider>Detalles</Divider>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: '12px', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '300px'
                }}>
                  {JSON.stringify(selectedHistory.details, null, 2)}
                </pre>
              </>
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default SyncManagement;
