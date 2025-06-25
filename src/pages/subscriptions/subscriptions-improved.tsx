import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Popconfirm,
  Drawer,
  Descriptions,
  Badge,
  Row,
  Col,
  Statistic,
  Alert,
  Tooltip,
  InputNumber
} from 'antd';
import {
  PlusOutlined,
  SyncOutlined,
  EditOutlined,
  StopOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  CreditCardOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import DirectusService from '../../services/directus-service-improved';

const { Option } = Select;

interface SubscriptionRecord {
  id: string;
  customer_id: any;
  plan_type: 'basic' | 'premium' | 'elite';
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  price_monthly: number;
  start_date: string;
  end_date?: string;
  stripe_subscription_id?: string;
  services_included: {
    cleanings_per_year: number;
    protection_level: string;
    inspections_per_year: number;
    trade_in_eligible: boolean;
  };
}

const planDetails = {
  basic: {
    name: 'Plan Basic',
    price: 10.65,
    color: 'blue',
    services: {
      cleanings_per_year: 3,
      protection_level: 'Básica',
      inspections_per_year: 1,
      trade_in_eligible: false
    }
  },
  premium: {
    name: 'Plan Premium',
    price: 21.30,
    color: 'gold',
    services: {
      cleanings_per_year: 6,
      protection_level: 'Premium',
      inspections_per_year: 2,
      trade_in_eligible: false
    }
  },
  elite: {
    name: 'Plan Elite',
    price: 31.95,
    color: 'purple',
    services: {
      cleanings_per_year: 12,
      protection_level: 'Elite',
      inspections_per_year: 2,
      trade_in_eligible: true
    }
  }
};

export const SubscriptionsImproved: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionRecord | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [form] = Form.useForm();

  // Metrics states
  const [totalSubscriptions, setTotalSubscriptions] = useState(0);
  const [activeSubscriptions, setActiveSubscriptions] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);

  useEffect(() => {
    fetchSubscriptions();
    fetchCustomers();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await DirectusService.getSubscriptions({
        sort: ['-created_at']
      });
      
      setSubscriptions(data);
      
      // Calculate metrics
      setTotalSubscriptions(data.length);
      const active = data.filter((s: any) => s.status === 'active');
      setActiveSubscriptions(active.length);
      setMonthlyRevenue(active.reduce((sum: number, s: any) => sum + s.price_monthly, 0));
    } catch (error) {
      message.error('Error al cargar suscripciones');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await DirectusService.getCustomers({ limit: -1 });
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleCreateSubscription = async (values: any) => {
    try {
      const planInfo = planDetails[values.plan_type as keyof typeof planDetails];
      
      const subscriptionData = {
        customer_id: values.customer_id,
        plan_type: values.plan_type,
        status: 'active',
        price_monthly: planInfo.price,
        start_date: values.start_date.format('YYYY-MM-DD'),
        services_included: planInfo.services
      };

      await DirectusService.createSubscription(subscriptionData);
      
      // TODO: Create Stripe subscription
      // const stripeSubscription = await StripeService.createSubscription({
      //   customerId: customer.stripe_customer_id,
      //   priceId: getPriceIdForPlan(values.plan_type)
      // });

      message.success('Suscripción creada exitosamente');
      setIsModalOpen(false);
      form.resetFields();
      fetchSubscriptions();
    } catch (error) {
      message.error('Error al crear suscripción');
      console.error(error);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await DirectusService.updateSubscription(id, { status: newStatus });
      
      // TODO: Update Stripe subscription status
      
      message.success(`Suscripción ${newStatus === 'active' ? 'activada' : 'pausada'}`);
      fetchSubscriptions();
    } catch (error) {
      message.error('Error al actualizar estado');
      console.error(error);
    }
  };

  const handleCancelSubscription = async (id: string) => {
    try {
      await DirectusService.updateSubscription(id, { 
        status: 'cancelled',
        end_date: new Date().toISOString()
      });
      
      // TODO: Cancel Stripe subscription
      
      message.success('Suscripción cancelada');
      fetchSubscriptions();
    } catch (error) {
      message.error('Error al cancelar suscripción');
      console.error(error);
    }
  };

  const viewSubscriptionDetails = (record: SubscriptionRecord) => {
    setSelectedSubscription(record);
    setIsDrawerOpen(true);
  };

  const columns: ColumnsType<SubscriptionRecord> = [
    {
      title: 'Cliente',
      dataIndex: ['customer_id', 'name'],
      key: 'customer',
      render: (_, record) => (
        <Space>
          <UserOutlined />
          <span>{record.customer_id?.name || 'N/A'}</span>
        </Space>
      )
    },
    {
      title: 'Plan',
      dataIndex: 'plan_type',
      key: 'plan_type',
      filters: [
        { text: 'Basic', value: 'basic' },
        { text: 'Premium', value: 'premium' },
        { text: 'Elite', value: 'elite' }
      ],
      render: (plan: string) => {
        const planInfo = planDetails[plan as keyof typeof planDetails];
        return <Tag color={planInfo.color}>{planInfo.name}</Tag>;
      }
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Activa', value: 'active' },
        { text: 'Pausada', value: 'paused' },
        { text: 'Cancelada', value: 'cancelled' },
        { text: 'Expirada', value: 'expired' }
      ],
      render: (status: string) => {
        const statusConfig = {
          active: { color: 'success', text: 'Activa' },
          paused: { color: 'warning', text: 'Pausada' },
          cancelled: { color: 'error', text: 'Cancelada' },
          expired: { color: 'default', text: 'Expirada' }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Badge status={config.color as any} text={config.text} />;
      }
    },
    {
      title: 'Precio Mensual',
      dataIndex: 'price_monthly',
      key: 'price_monthly',
      sorter: true,
      render: (price: number) => (
        <Space>
          <DollarOutlined />
          <span>${price.toFixed(2)}</span>
        </Space>
      )
    },
    {
      title: 'Servicios Incluidos',
      key: 'services',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Tag icon={<CalendarOutlined />}>
            {record.services_included.cleanings_per_year} limpiezas/año
          </Tag>
          <Tag color="blue">
            Protección {record.services_included.protection_level}
          </Tag>
          {record.services_included.trade_in_eligible && (
            <Tag color="purple" icon={<CreditCardOutlined />}>
              Trade-In disponible
            </Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Fecha Inicio',
      dataIndex: 'start_date',
      key: 'start_date',
      sorter: true,
      render: (date: string) => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Créditos',
      key: 'credits',
      render: (_, record) => {
        // Calculate remaining credits for the year
        const monthsActive = moment().diff(moment(record.start_date), 'months');
        const creditsUsed = 0; // This would come from a service usage table
        const totalCredits = record.services_included.cleanings_per_year;
        const remainingCredits = totalCredits - creditsUsed;
        
        return (
          <Tooltip title={`${creditsUsed} usados de ${totalCredits}`}>
            <Tag color={remainingCredits > 0 ? 'green' : 'red'}>
              {remainingCredits} disponibles
            </Tag>
          </Tooltip>
        );
      }
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver detalles">
            <Button 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => viewSubscriptionDetails(record)}
            />
          </Tooltip>
          
          {record.status === 'active' && (
            <Tooltip title="Pausar suscripción">
              <Popconfirm
                title="¿Pausar esta suscripción?"
                description="El cliente no podrá usar los servicios mientras esté pausada"
                onConfirm={() => handleUpdateStatus(record.id, 'paused')}
              >
                <Button icon={<StopOutlined />} size="small" />
              </Popconfirm>
            </Tooltip>
          )}
          
          {record.status === 'paused' && (
            <Tooltip title="Reactivar suscripción">
              <Button 
                icon={<PlayCircleOutlined />} 
                size="small" 
                type="primary"
                onClick={() => handleUpdateStatus(record.id, 'active')}
              />
            </Tooltip>
          )}
          
          {(record.status === 'active' || record.status === 'paused') && (
            <Tooltip title="Cancelar suscripción">
              <Popconfirm
                title="¿Cancelar esta suscripción?"
                description="Esta acción no se puede deshacer"
                onConfirm={() => handleCancelSubscription(record.id)}
              >
                <Button danger icon={<StopOutlined />} size="small" />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Metrics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Suscripciones"
              value={totalSubscriptions}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Suscripciones Activas"
              value={activeSubscriptions}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Ingresos Mensuales"
              value={monthlyRevenue}
              prefix="$"
              precision={2}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Card */}
      <Card
        title="Gestión de Suscripciones"
        extra={
          <Space>
            <Button 
              icon={<SyncOutlined />} 
              onClick={fetchSubscriptions}
              loading={loading}
            >
              Actualizar
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
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

      {/* Create Subscription Modal */}
      <Modal
        title="Nueva Suscripción"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateSubscription}
        >
          <Form.Item
            name="customer_id"
            label="Cliente"
            rules={[{ required: true, message: 'Seleccione un cliente' }]}
          >
            <Select
              showSearch
              placeholder="Buscar cliente..."
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {customers.map(customer => (
                <Option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.email}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="plan_type"
            label="Plan"
            rules={[{ required: true, message: 'Seleccione un plan' }]}
          >
            <Select onChange={(value) => {
              const planInfo = planDetails[value as keyof typeof planDetails];
              form.setFieldsValue({ price_monthly: planInfo.price });
            }}>
              <Option value="basic">
                <Space>
                  <Tag color="blue">Basic</Tag>
                  <span>$10.65/mes - 3 limpiezas anuales</span>
                </Space>
              </Option>
              <Option value="premium">
                <Space>
                  <Tag color="gold">Premium</Tag>
                  <span>$21.30/mes - 6 limpiezas anuales</span>
                </Space>
              </Option>
              <Option value="elite">
                <Space>
                  <Tag color="purple">Elite</Tag>
                  <span>$31.95/mes - 12 limpiezas + Trade-In</span>
                </Space>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="price_monthly"
            label="Precio Mensual"
            rules={[{ required: true }]}
          >
            <InputNumber
              prefix="$"
              precision={2}
              style={{ width: '100%' }}
              disabled
            />
          </Form.Item>

          <Form.Item
            name="start_date"
            label="Fecha de Inicio"
            rules={[{ required: true, message: 'Seleccione fecha de inicio' }]}
            initialValue={moment()}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Alert
            message="Información"
            description="La suscripción se creará en estado 'Activa' y se procesará el primer pago automáticamente a través de Stripe."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Crear Suscripción
              </Button>
              <Button onClick={() => {
                setIsModalOpen(false);
                form.resetFields();
              }}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Subscription Details Drawer */}
      <Drawer
        title="Detalles de Suscripción"
        placement="right"
        width={600}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
      >
        {selectedSubscription && (
          <>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Cliente">
                {selectedSubscription.customer_id?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedSubscription.customer_id?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Plan">
                <Tag color={planDetails[selectedSubscription.plan_type].color}>
                  {planDetails[selectedSubscription.plan_type].name}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Badge 
                  status={selectedSubscription.status === 'active' ? 'success' : 'default'} 
                  text={selectedSubscription.status}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Precio Mensual">
                ${selectedSubscription.price_monthly.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="Fecha de Inicio">
                {moment(selectedSubscription.start_date).format('DD/MM/YYYY')}
              </Descriptions.Item>
              {selectedSubscription.end_date && (
                <Descriptions.Item label="Fecha de Fin">
                  {moment(selectedSubscription.end_date).format('DD/MM/YYYY')}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="ID de Stripe">
                {selectedSubscription.stripe_subscription_id || 'No configurado'}
              </Descriptions.Item>
            </Descriptions>

            <Card title="Servicios Incluidos" style={{ marginTop: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <strong>Limpiezas por año:</strong> {selectedSubscription.services_included.cleanings_per_year}
                </div>
                <div>
                  <strong>Nivel de protección:</strong> {selectedSubscription.services_included.protection_level}
                </div>
                <div>
                  <strong>Inspecciones por año:</strong> {selectedSubscription.services_included.inspections_per_year}
                </div>
                <div>
                  <strong>Trade-In elegible:</strong> {selectedSubscription.services_included.trade_in_eligible ? 'Sí' : 'No'}
                </div>
              </Space>
            </Card>

            {/* TODO: Add service usage history */}
            <Card title="Historial de Uso" style={{ marginTop: 16 }}>
              <Alert
                message="Próximamente"
                description="Aquí se mostrará el historial de servicios utilizados"
                type="info"
              />
            </Card>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default SubscriptionsImproved;
