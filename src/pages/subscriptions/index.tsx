import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  message,
  Tooltip,
  Modal,
  Form,
  Select,
  DatePicker,
  InputNumber,
  Spin,
  Row,
  Col,
  Statistic,
  Badge,
  Input,
  Descriptions,
  Typography
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SyncOutlined,
  EyeOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { DirectusService, StripeService, Subscription, NewCustomer, PLAN_PRICES } from '../../services';

const { Option } = Select;
const { Text } = Typography;

const SubscriptionList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customers, setCustomers] = useState<NewCustomer[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    revenue: 0
  });

  // Cargar datos
  const fetchData = async () => {
    setLoading(true);
    try {
      const [subsData, custData] = await Promise.all([
        DirectusService.getSubscriptions(),
        DirectusService.getCustomers()
      ]);
      
      setSubscriptions(subsData);
      setCustomers(custData);
      
      // Calcular estadísticas
      const activeSubscriptions = subsData.filter(s => s.status === 'active');
      const totalRevenue = activeSubscriptions.reduce((sum, s) => sum + (s.pricing?.amount || 0), 0);
      
      setStats({
        total: subsData.length,
        active: activeSubscriptions.length,
        revenue: totalRevenue
      });
    } catch (error: any) {
      message.error('Error al cargar suscripciones: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Obtener color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'paused': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  // Obtener color del plan
  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'blue';
      case 'premium': return 'gold';
      case 'elite': return 'purple';
      default: return 'default';
    }
  };

  // Obtener información del cliente
  const getCustomerInfo = (customerId: string) => {
    const customer = customers.find(c => c.id?.toString() === customerId);
    return customer || null;
  };

  // Manejar formulario
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const planType = values.plan as keyof typeof PLAN_PRICES;
      const subscriptionData: Partial<Subscription> = {
        customer_id: values.customer_id,
        plan: values.plan,
        status: values.status,
        start_date: values.start_date.toISOString(),
        pricing: {
          amount: PLAN_PRICES[planType].monthly,
          currency: 'USD',
          interval: 'monthly'
        },
        billing: {
          method: 'manual',
          last_payment: new Date().toISOString()
        },
        services: {
          cleanings: PLAN_PRICES[planType].cleanings,
          inspections: PLAN_PRICES[planType].inspections,
          protection: PLAN_PRICES[planType].protection,
          trade_in: PLAN_PRICES[planType].tradeIn
        },
        credits: {
          cleanings_used: 0,
          inspections_used: 0
        }
      };

      if (editingSubscription?.id) {
        await DirectusService.updateSubscription(editingSubscription.id, subscriptionData);
        message.success('Suscripción actualizada exitosamente');
      } else {
        await DirectusService.createSubscription(subscriptionData);
        message.success('Suscripción creada exitosamente');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingSubscription(null);
      fetchData();
    } catch (error: any) {
      message.error('Error al guardar suscripción: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Editar suscripción
  const handleEdit = (record: Subscription) => {
    setEditingSubscription(record);
    form.setFieldsValue({
      customer_id: record.customer_id,
      plan: record.plan,
      status: record.status,
      start_date: dayjs(record.start_date)
    });
    setModalVisible(true);
  };

  // Cambiar estado
  const handleStatusChange = async (subscription: Subscription, newStatus: string) => {
    Modal.confirm({
      title: 'Cambiar Estado de Suscripción',
      content: `¿Está seguro de cambiar el estado a "${newStatus}"?`,
      onOk: async () => {
        try {
          setLoading(true);
          const updateData: Partial<Subscription> = {
            status: newStatus
          };
          
          if (newStatus === 'cancelled') {
            updateData.cancelled_at = new Date().toISOString();
          } else if (newStatus === 'paused') {
            updateData.paused_at = new Date().toISOString();
          }
          
          await DirectusService.updateSubscription(subscription.id!, updateData);
          
          message.success('Estado actualizado exitosamente');
          fetchData();
        } catch (error: any) {
          message.error('Error al actualizar estado: ' + error.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Columnas de la tabla
  const columns: ColumnsType<Subscription> = [
    {
      title: 'Cliente',
      key: 'customer',
      render: (_, record) => {
        const customer = getCustomerInfo(record.customer_id || '');
        return customer ? (
          <div>
            <div style={{ fontWeight: 500 }}>
              {customer.first_name} {customer.last_name}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>{customer.email}</div>
          </div>
        ) : (
          <span style={{ color: '#999' }}>Cliente #{record.customer_id}</span>
        );
      }
    },
    {
      title: 'Plan',
      dataIndex: 'plan',
      key: 'plan',
      render: (plan) => (
        <Tag color={getPlanColor(plan)} style={{ textTransform: 'uppercase' }}>
          {plan}
        </Tag>
      ),
      filters: [
        { text: 'Basic', value: 'basic' },
        { text: 'Premium', value: 'premium' },
        { text: 'Elite', value: 'elite' }
      ],
      onFilter: (value, record) => record.plan === value
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge status={getStatusColor(status) as any} text={
          <span style={{ textTransform: 'capitalize' }}>{status}</span>
        } />
      ),
      filters: [
        { text: 'Activa', value: 'active' },
        { text: 'Inactiva', value: 'inactive' },
        { text: 'Pausada', value: 'paused' },
        { text: 'Cancelada', value: 'cancelled' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Precio Mensual',
      key: 'price',
      render: (_, record) => `$${record.pricing?.amount || 0}`,
      sorter: (a, b) => (a.pricing?.amount || 0) - (b.pricing?.amount || 0)
    },
    {
      title: 'Servicios Incluidos',
      key: 'services',
      render: (_, record) => (
        <Space size="small" wrap>
          {record.services?.cleanings && (
            <Tooltip title={`${record.services.cleanings} limpiezas anuales`}>
              <Tag icon={<ClockCircleOutlined />} color="blue">
                {record.services.cleanings} Limpiezas
              </Tag>
            </Tooltip>
          )}
          {record.services?.inspections && (
            <Tooltip title={`${record.services.inspections} inspecciones anuales`}>
              <Tag icon={<EyeOutlined />} color="green">
                {record.services.inspections} Inspecciones
              </Tag>
            </Tooltip>
          )}
          {record.services?.protection && (
            <Tag icon={<CheckCircleOutlined />} color="orange">
              Protección
            </Tag>
          )}
          {record.services?.trade_in && (
            <Tag icon={<DollarOutlined />} color="purple">
              Trade-In
            </Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Fecha Inicio',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      sorter: (a, b) => dayjs(a.start_date).unix() - dayjs(b.start_date).unix()
    },
    {
      title: 'Créditos',
      key: 'credits',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.services?.cleanings && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Limpiezas: {record.credits?.cleanings_used || 0}/{record.services.cleanings}
            </Text>
          )}
          {record.services?.inspections && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Inspecciones: {record.credits?.inspections_used || 0}/{record.services.inspections}
            </Text>
          )}
        </Space>
      )
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Editar">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          
          {record.status === 'active' && (
            <Tooltip title="Pausar">
              <Button
                type="link"
                icon={<StopOutlined />}
                onClick={() => handleStatusChange(record, 'paused')}
                style={{ color: '#faad14' }}
              />
            </Tooltip>
          )}
          
          {record.status === 'paused' && (
            <Tooltip title="Reactivar">
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
                onClick={() => handleStatusChange(record, 'active')}
                style={{ color: '#52c41a' }}
              />
            </Tooltip>
          )}
          
          {record.status !== 'cancelled' && (
            <Tooltip title="Cancelar">
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleStatusChange(record, 'cancelled')}
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Estadísticas */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Suscripciones"
              value={stats.total}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Suscripciones Activas"
              value={stats.active}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Ingresos Mensuales"
              value={stats.revenue}
              precision={2}
              valueStyle={{ color: '#1890ff' }}
              prefix="$"
            />
          </Card>
        </Col>
      </Row>

      {/* Tabla */}
      <Card
        title="Gestión de Suscripciones"
        extra={
          <Space>
            <Button
              icon={<SyncOutlined />}
              onClick={fetchData}
              loading={loading}
            >
              Actualizar
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingSubscription(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              Nueva Suscripción
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={subscriptions}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} suscripciones`
          }}
        />
      </Card>

      {/* Modal de formulario */}
      <Modal
        title={editingSubscription ? 'Editar Suscripción' : 'Nueva Suscripción'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingSubscription(null);
        }}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'active',
            plan: 'basic'
          }}
        >
          <Form.Item
            name="customer_id"
            label="Cliente"
            rules={[{ required: true, message: 'Por favor seleccione un cliente' }]}
          >
            <Select
              showSearch
              placeholder="Seleccionar cliente"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {customers.map(customer => (
                <Option
                  key={customer.id}
                  value={customer.id?.toString()}
                  label={`${customer.first_name} ${customer.last_name} - ${customer.email}`}
                >
                  <div>
                    <div>{customer.first_name} {customer.last_name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{customer.email}</div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="plan"
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
            name="status"
            label="Estado"
            rules={[{ required: true, message: 'Por favor seleccione un estado' }]}
          >
            <Select>
              <Option value="active">Activa</Option>
              <Option value="inactive">Inactiva</Option>
              <Option value="paused">Pausada</Option>
              <Option value="cancelled">Cancelada</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="start_date"
            label="Fecha de Inicio"
            rules={[{ required: true, message: 'Por favor seleccione la fecha de inicio' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SubscriptionList;
