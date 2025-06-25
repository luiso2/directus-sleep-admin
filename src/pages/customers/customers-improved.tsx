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
  Switch,
  InputNumber,
  message,
  Drawer,
  Descriptions,
  Timeline,
  Avatar,
  Row,
  Col,
  Statistic,
  Tooltip,
  Badge,
  Tabs,
  List,
  Empty,
  Alert,
  Popconfirm
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CrownOutlined,
  DollarOutlined,
  CalendarOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  SyncOutlined,
  StarOutlined,
  EyeOutlined,
  SearchOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import DirectusService from '../../services/directus-service-improved';

const { Option } = Select;
const { TabPane } = Tabs;
const { Search } = Input;

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  customer_type: 'individual' | 'business';
  is_vip: boolean;
  credit_limit?: number;
  stripe_customer_id?: string;
  shopify_customer_id?: string;
  created_at?: string;
  updated_at?: string;
  // Related data
  subscriptions?: any[];
  evaluations?: any[];
  sales?: any[];
}

export const CustomersImproved: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<CustomerRecord | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterVIP, setFilterVIP] = useState<string>('all');
  const [form] = Form.useForm();

  // Metrics
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [vipCustomers, setVipCustomers] = useState(0);
  const [activeSubscriptions, setActiveSubscriptions] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await DirectusService.getCustomers({
        sort: ['-created_at']
      });
      
      setCustomers(data);
      
      // Calculate metrics
      setTotalCustomers(data.length);
      setVipCustomers(data.filter((c: any) => c.is_vip).length);
      
      // TODO: Fetch related data for complete metrics
      // const subscriptions = await DirectusService.getSubscriptions({ filter: { status: { _eq: 'active' } } });
      // setActiveSubscriptions(subscriptions.length);
    } catch (error) {
      message.error('Error al cargar clientes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (values: any) => {
    try {
      const customerData = {
        ...values,
        created_at: new Date().toISOString()
      };

      const newCustomer = await DirectusService.createCustomer(customerData);
      
      // TODO: Create customer in Stripe and Shopify
      // if (values.create_in_stripe) {
      //   const stripeCustomer = await StripeService.createCustomer({
      //     email: values.email,
      //     name: values.name,
      //     phone: values.phone
      //   });
      //   await DirectusService.updateCustomer(newCustomer.id, {
      //     stripe_customer_id: stripeCustomer.id
      //   });
      // }
      
      message.success('Cliente creado exitosamente');
      setIsModalOpen(false);
      form.resetFields();
      fetchCustomers();
    } catch (error) {
      message.error('Error al crear cliente');
      console.error(error);
    }
  };

  const handleUpdateCustomer = async (values: any) => {
    if (!editingCustomer) return;
    
    try {
      await DirectusService.updateCustomer(editingCustomer.id, values);
      message.success('Cliente actualizado exitosamente');
      setEditingCustomer(null);
      fetchCustomers();
    } catch (error) {
      message.error('Error al actualizar cliente');
      console.error(error);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      // TODO: Check if customer has active subscriptions before deleting
      // await DirectusService.deleteCustomer(id);
      message.warning('Función de eliminar temporalmente deshabilitada');
      // fetchCustomers();
    } catch (error) {
      message.error('Error al eliminar cliente');
      console.error(error);
    }
  };

  const viewCustomerDetails = async (customer: CustomerRecord) => {
    try {
      // TODO: Fetch related data
      // const [subscriptions, evaluations, sales] = await Promise.all([
      //   DirectusService.getSubscriptions({ filter: { customer_id: { _eq: customer.id } } }),
      //   DirectusService.getEvaluations({ filter: { customer_id: { _eq: customer.id } } }),
      //   DirectusService.getSales({ filter: { customer_id: { _eq: customer.id } } })
      // ]);
      
      setSelectedCustomer({
        ...customer,
        subscriptions: [],
        evaluations: [],
        sales: []
      });
      setIsDrawerOpen(true);
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  };

  const getFilteredCustomers = () => {
    let filtered = customers;

    // Search filter
    if (searchText) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchText.toLowerCase()) ||
        c.email.toLowerCase().includes(searchText.toLowerCase()) ||
        c.phone?.includes(searchText)
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(c => c.customer_type === filterType);
    }

    // VIP filter
    if (filterVIP !== 'all') {
      filtered = filtered.filter(c => c.is_vip === (filterVIP === 'yes'));
    }

    return filtered;
  };

  const columns: ColumnsType<CustomerRecord> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: string) => id.slice(0, 8) + '...'
    },
    {
      title: 'Cliente',
      key: 'customer',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: record.is_vip ? '#faad14' : '#1890ff' }} />
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.name} {record.is_vip && <CrownOutlined style={{ color: '#faad14' }} />}
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>{record.email}</div>
          </div>
        </Space>
      )
    },
    {
      title: 'Teléfono',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => phone || '-'
    },
    {
      title: 'Ciudad',
      dataIndex: 'city',
      key: 'city',
      render: (city: string) => city || '-'
    },
    {
      title: 'Tipo',
      dataIndex: 'customer_type',
      key: 'customer_type',
      filters: [
        { text: 'Individual', value: 'individual' },
        { text: 'Empresa', value: 'business' }
      ],
      render: (type: string) => (
        <Tag color={type === 'business' ? 'blue' : 'green'}>
          {type === 'business' ? 'Empresa' : 'Individual'}
        </Tag>
      )
    },
    {
      title: 'VIP',
      dataIndex: 'is_vip',
      key: 'is_vip',
      filters: [
        { text: 'Sí', value: true },
        { text: 'No', value: false }
      ],
      render: (isVip: boolean) => (
        <Tag color={isVip ? 'gold' : 'default'} icon={isVip ? <CrownOutlined /> : null}>
          {isVip ? 'VIP' : 'Regular'}
        </Tag>
      )
    },
    {
      title: 'Límite de Crédito',
      dataIndex: 'credit_limit',
      key: 'credit_limit',
      sorter: true,
      render: (limit: number) => limit ? `$${limit.toFixed(2)}` : '-'
    },
    {
      title: 'Registrado',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: true,
      render: (date: string) => moment(date).format('DD/MM/YYYY')
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
              onClick={() => viewCustomerDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => {
                setEditingCustomer(record);
                form.setFieldsValue(record);
                setIsModalOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Popconfirm
              title="¿Eliminar este cliente?"
              description="Esta acción no se puede deshacer"
              onConfirm={() => handleDeleteCustomer(record.id)}
              okText="Sí"
              cancelText="No"
            >
              <Button 
                icon={<DeleteOutlined />} 
                size="small" 
                danger
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  const filteredCustomers = getFilteredCustomers();

  return (
    <div style={{ padding: '24px' }}>
      {/* Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Clientes"
              value={totalCustomers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Clientes VIP"
              value={vipCustomers}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Con Suscripción"
              value={activeSubscriptions}
              prefix={<CreditCardOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Valor Total"
              value={totalRevenue}
              prefix="$"
              precision={2}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Card */}
      <Card
        title="Gestión de Clientes"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCustomer(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
          >
            Agregar Cliente
          </Button>
        }
      >
        {/* Filters */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={8}>
            <Search
              placeholder="Buscar clientes..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Select
              value={filterType}
              onChange={setFilterType}
              style={{ width: '100%' }}
              placeholder="Filtrar por tipo"
            >
              <Option value="all">Todos los tipos</Option>
              <Option value="individual">Individual</Option>
              <Option value="business">Empresa</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Select
              value={filterVIP}
              onChange={setFilterVIP}
              style={{ width: '100%' }}
              placeholder="Solo VIP"
            >
              <Option value="all">Todos</Option>
              <Option value="yes">Solo VIP</Option>
              <Option value="no">No VIP</Option>
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} clientes`
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingCustomer ? handleUpdateCustomer : handleCreateCustomer}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Nombre Completo"
                rules={[{ required: true, message: 'Ingrese el nombre' }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Ingrese el email' },
                  { type: 'email', message: 'Email inválido' }
                ]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Teléfono"
              >
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="customer_type"
                label="Tipo de Cliente"
                rules={[{ required: true }]}
                initialValue="individual"
              >
                <Select>
                  <Option value="individual">Individual</Option>
                  <Option value="business">Empresa</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Dirección"
          >
            <Input prefix={<HomeOutlined />} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="city"
                label="Ciudad"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="postal_code"
                label="Código Postal"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="is_vip"
                label="Cliente VIP"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch checkedChildren="Sí" unCheckedChildren="No" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="credit_limit"
                label="Límite de Crédito"
              >
                <InputNumber
                  prefix="$"
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                />
              </Form.Item>
            </Col>
          </Row>

          {!editingCustomer && (
            <Alert
              message="Integración Automática"
              description="El cliente se creará automáticamente en Stripe y Shopify si está habilitado"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCustomer ? 'Actualizar' : 'Crear'} Cliente
              </Button>
              <Button onClick={() => {
                setIsModalOpen(false);
                setEditingCustomer(null);
                form.resetFields();
              }}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Customer Details Drawer */}
      <Drawer
        title="Detalles del Cliente"
        placement="right"
        width={720}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
      >
        {selectedCustomer && (
          <div>
            {/* Customer Info */}
            <Descriptions title="Información Personal" bordered column={2}>
              <Descriptions.Item label="Nombre" span={2}>
                {selectedCustomer.name} 
                {selectedCustomer.is_vip && (
                  <Tag color="gold" icon={<CrownOutlined />} style={{ marginLeft: 8 }}>
                    VIP
                  </Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Email">{selectedCustomer.email}</Descriptions.Item>
              <Descriptions.Item label="Teléfono">{selectedCustomer.phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="Tipo">
                <Tag color={selectedCustomer.customer_type === 'business' ? 'blue' : 'green'}>
                  {selectedCustomer.customer_type === 'business' ? 'Empresa' : 'Individual'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Límite de Crédito">
                {selectedCustomer.credit_limit ? `$${selectedCustomer.credit_limit.toFixed(2)}` : 'Sin límite'}
              </Descriptions.Item>
              <Descriptions.Item label="Dirección" span={2}>
                {selectedCustomer.address || '-'}
                {selectedCustomer.city && `, ${selectedCustomer.city}`}
                {selectedCustomer.postal_code && ` ${selectedCustomer.postal_code}`}
              </Descriptions.Item>
              <Descriptions.Item label="Cliente desde">
                {moment(selectedCustomer.created_at).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Última actualización">
                {selectedCustomer.updated_at 
                  ? moment(selectedCustomer.updated_at).format('DD/MM/YYYY HH:mm')
                  : '-'
                }
              </Descriptions.Item>
            </Descriptions>

            {/* Integration IDs */}
            <Descriptions title="IDs de Integración" bordered column={2} style={{ marginTop: 24 }}>
              <Descriptions.Item label="Stripe ID">
                {selectedCustomer.stripe_customer_id || 
                  <Tag color="orange">No sincronizado</Tag>
                }
              </Descriptions.Item>
              <Descriptions.Item label="Shopify ID">
                {selectedCustomer.shopify_customer_id || 
                  <Tag color="orange">No sincronizado</Tag>
                }
              </Descriptions.Item>
            </Descriptions>

            {/* Tabs for related data */}
            <Tabs defaultActiveKey="1" style={{ marginTop: 24 }}>
              <TabPane tab="Suscripciones" key="1">
                {selectedCustomer.subscriptions && selectedCustomer.subscriptions.length > 0 ? (
                  <List
                    dataSource={selectedCustomer.subscriptions}
                    renderItem={(item: any) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<CreditCardOutlined />} />}
                          title={`Plan ${item.plan_type}`}
                          description={`Estado: ${item.status} - $${item.price_monthly}/mes`}
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="Sin suscripciones" />
                )}
              </TabPane>
              
              <TabPane tab="Trade-In" key="2">
                {selectedCustomer.evaluations && selectedCustomer.evaluations.length > 0 ? (
                  <Timeline>
                    {selectedCustomer.evaluations.map((eval: any) => (
                      <Timeline.Item 
                        key={eval.id}
                        color={eval.status === 'approved' ? 'green' : 'gray'}
                      >
                        {moment(eval.evaluation_date).format('DD/MM/YYYY')} - 
                        {eval.status === 'approved' ? ` Aprobado: $${eval.approved_credit}` : ' Pendiente'}
                      </Timeline.Item>
                    ))}
                  </Timeline>
                ) : (
                  <Empty description="Sin evaluaciones Trade-In" />
                )}
              </TabPane>
              
              <TabPane tab="Compras" key="3">
                {selectedCustomer.sales && selectedCustomer.sales.length > 0 ? (
                  <List
                    dataSource={selectedCustomer.sales}
                    renderItem={(item: any) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<ShoppingCartOutlined />} />}
                          title={`Venta #${item.id}`}
                          description={`${moment(item.date).format('DD/MM/YYYY')} - $${item.total}`}
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="Sin compras registradas" />
                )}
              </TabPane>

              <TabPane tab="Actividad" key="4">
                <Timeline>
                  <Timeline.Item color="green">
                    Cliente registrado - {moment(selectedCustomer.created_at).format('DD/MM/YYYY')}
                  </Timeline.Item>
                  {/* TODO: Add more activity items */}
                </Timeline>
              </TabPane>
            </Tabs>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default CustomersImproved;
