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
  Select,
  DatePicker,
  Row,
  Col,
  Statistic,
  Descriptions,
  Timeline,
  Alert,
  message,
  Tooltip,
  Badge,
  Progress,
  Tabs,
  List,
  Avatar,
  Input,
  Switch,
} from "antd";
import {
  CreditCardOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PauseCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  EditOutlined,
  HistoryOutlined,
  FilterOutlined,
  RiseOutlined,
  FallOutlined,
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
import { Line } from "@ant-design/charts";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface ISubscription {
  id: string;
  customer_id: string;
  stripe_subscription_id?: string;
  plan: "basic" | "premium" | "elite";
  status: "active" | "cancelled" | "paused" | "expired" | "trial";
  start_date: string;
  end_date?: string;
  trial_end_date?: string;
  next_payment_date?: string;
  amount: number;
  currency: string;
  billing_cycle: "monthly" | "yearly";
  payment_method?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at?: string;
  metadata?: {
    services_used?: number;
    last_service_date?: string;
    trade_in_eligible?: boolean;
  };
}

interface ICustomer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

interface IServiceHistory {
  id: string;
  subscription_id: string;
  service_type: "cleaning" | "inspection" | "trade_in";
  date: string;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
}

export const SubscriptionList: React.FC = () => {
  const [selectedSubscription, setSelectedSubscription] = useState<ISubscription | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [planFilter, setPlanFilter] = useState<string | undefined>();
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  // Fetch subscriptions
  const { data: subscriptionsData, refetch: refetchSubscriptions } = useList<ISubscription>({
    resource: "subscriptions",
    sorters: [{ field: "created_at", order: "desc" }],
    filters: [
      ...(statusFilter ? [{ field: "status", operator: "eq", value: statusFilter }] : []),
      ...(planFilter ? [{ field: "plan", operator: "eq", value: planFilter }] : []),
    ],
  });

  // Fetch customers
  const { data: customersData } = useList<ICustomer>({
    resource: "new_customers",
  });

  const { mutate: updateSubscription } = useUpdate();

  const getCustomerInfo = (customerId: string): ICustomer | undefined => {
    return customersData?.data?.find((c) => c.id === customerId);
  };

  const handleStatusChange = (subscription: ISubscription, newStatus: string) => {
    Modal.confirm({
      title: "Cambiar Estado de Suscripción",
      content: `¿Está seguro de cambiar el estado a ${newStatus}?`,
      okText: "Confirmar",
      cancelText: "Cancelar",
      onOk: () => {
        updateSubscription(
          {
            resource: "subscriptions",
            id: subscription.id,
            values: {
              status: newStatus,
              updated_at: new Date().toISOString(),
              ...(newStatus === "cancelled" && {
                end_date: new Date().toISOString(),
              }),
            },
          },
          {
            onSuccess: () => {
              message.success("Estado actualizado exitosamente");
              refetchSubscriptions();
            },
          }
        );
      },
    });
  };

  const handleUpdateSubscription = (values: any) => {
    updateSubscription(
      {
        resource: "subscriptions",
        id: selectedSubscription!.id,
        values: {
          ...values,
          next_payment_date: values.next_payment_date?.toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          message.success("Suscripción actualizada");
          setIsEditModalVisible(false);
          form.resetFields();
          refetchSubscriptions();
        },
      }
    );
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: "success",
      cancelled: "error",
      paused: "warning",
      expired: "default",
      trial: "processing",
    };
    return colors[status as keyof typeof colors] || "default";
  };

  const getPlanIcon = (plan: string) => {
    const icons = {
      basic: { color: "#1890ff", label: "Basic" },
      premium: { color: "#722ed1", label: "Premium" },
      elite: { color: "#faad14", label: "Elite" },
    };
    return icons[plan as keyof typeof icons];
  };

  const columns = [
    {
      title: "Cliente",
      key: "customer",
      render: (_: any, record: ISubscription) => {
        const customer = getCustomerInfo(record.customer_id);
        return customer ? (
          <Space>
            <Avatar icon={<UserOutlined />}>
              {customer.first_name?.[0]}{customer.last_name?.[0]}
            </Avatar>
            <Space direction="vertical" size="small">
              <Text strong>
                {customer.first_name} {customer.last_name}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {customer.email}
              </Text>
            </Space>
          </Space>
        ) : (
          <Text type="secondary">Cliente no encontrado</Text>
        );
      },
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: any, record: ISubscription) => {
        const customer = getCustomerInfo(record.customer_id);
        if (!customer) return false;
        const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase();
        const email = customer.email.toLowerCase();
        return fullName.includes(value.toLowerCase()) || email.includes(value.toLowerCase());
      },
    },
    {
      title: "Plan",
      dataIndex: "plan",
      key: "plan",
      render: (plan: string) => {
        const planInfo = getPlanIcon(plan);
        return (
          <Tag color={planInfo.color} icon={<CreditCardOutlined />}>
            {planInfo.label}
          </Tag>
        );
      },
      filters: [
        { text: "Basic", value: "basic" },
        { text: "Premium", value: "premium" },
        { text: "Elite", value: "elite" },
      ],
      filteredValue: planFilter ? [planFilter] : null,
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Badge status={getStatusColor(status)} text={status.toUpperCase()} />,
      filters: [
        { text: "Activa", value: "active" },
        { text: "Cancelada", value: "cancelled" },
        { text: "Pausada", value: "paused" },
        { text: "Expirada", value: "expired" },
        { text: "Prueba", value: "trial" },
      ],
      filteredValue: statusFilter ? [statusFilter] : null,
    },
    {
      title: "Precio",
      key: "price",
      render: (_: any, record: ISubscription) => (
        <Space direction="vertical" size="small">
          <Text strong>
            ${record.amount} {record.currency?.toUpperCase() || "USD"}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.billing_cycle === "monthly" ? "Mensual" : "Anual"}
          </Text>
        </Space>
      ),
      sorter: (a: ISubscription, b: ISubscription) => a.amount - b.amount,
    },
    {
      title: "Próximo Pago",
      dataIndex: "next_payment_date",
      key: "next_payment_date",
      render: (date: string, record: ISubscription) => {
        if (record.status !== "active" || !date) {
          return <Text type="secondary">-</Text>;
        }
        const daysUntil = dayjs(date).diff(dayjs(), "day");
        return (
          <Space direction="vertical" size="small">
            <Text>{dayjs(date).format("DD/MM/YYYY")}</Text>
            {daysUntil <= 7 && (
              <Text type="warning" style={{ fontSize: 12 }}>
                <WarningOutlined /> En {daysUntil} días
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: "Inicio",
      dataIndex: "start_date",
      key: "start_date",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a: ISubscription, b: ISubscription) => 
        dayjs(a.start_date).unix() - dayjs(b.start_date).unix(),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: ISubscription) => (
        <Space>
          <Tooltip title="Ver detalles">
            <Button
              icon={<SearchOutlined />}
              onClick={() => {
                setSelectedSubscription(record);
                setIsDetailModalVisible(true);
              }}
            />
          </Tooltip>
          {record.status === "active" && (
            <>
              <Tooltip title="Pausar">
                <Button
                  icon={<PauseCircleOutlined />}
                  onClick={() => handleStatusChange(record, "paused")}
                />
              </Tooltip>
              <Tooltip title="Editar">
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    setSelectedSubscription(record);
                    form.setFieldsValue({
                      ...record,
                      next_payment_date: record.next_payment_date
                        ? dayjs(record.next_payment_date)
                        : undefined,
                    });
                    setIsEditModalVisible(true);
                  }}
                />
              </Tooltip>
            </>
          )}
          {record.status === "paused" && (
            <Tooltip title="Reactivar">
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleStatusChange(record, "active")}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // Calculate statistics
  const activeSubscriptions = subscriptionsData?.data?.filter(s => s.status === "active").length || 0;
  const totalRevenue = subscriptionsData?.data
    ?.filter(s => s.status === "active")
    ?.reduce((sum, s) => sum + s.amount, 0) || 0;
  const churnRate = subscriptionsData?.data
    ? ((subscriptionsData.data.filter(s => s.status === "cancelled").length / subscriptionsData.data.length) * 100).toFixed(1)
    : 0;

  const planDistribution = {
    basic: subscriptionsData?.data?.filter(s => s.plan === "basic" && s.status === "active").length || 0,
    premium: subscriptionsData?.data?.filter(s => s.plan === "premium" && s.status === "active").length || 0,
    elite: subscriptionsData?.data?.filter(s => s.plan === "elite" && s.status === "active").length || 0,
  };

  const renderSubscriptionDetails = () => {
    if (!selectedSubscription) return null;

    const customer = getCustomerInfo(selectedSubscription.customer_id);
    const planInfo = getPlanIcon(selectedSubscription.plan);

    return (
      <Tabs defaultActiveKey="1">
        <TabPane tab="Información General" key="1">
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Cliente" span={2}>
              {customer ? (
                <Space>
                  <Avatar icon={<UserOutlined />}>
                    {customer.first_name?.[0]}{customer.last_name?.[0]}
                  </Avatar>
                  <Space direction="vertical" size="small">
                    <Text strong>
                      {customer.first_name} {customer.last_name}
                    </Text>
                    <Text type="secondary">{customer.email}</Text>
                  </Space>
                </Space>
              ) : (
                <Text type="secondary">Cliente no encontrado</Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Plan">
              <Tag color={planInfo.color} icon={<CreditCardOutlined />}>
                {planInfo.label}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Estado">
              <Badge 
                status={getStatusColor(selectedSubscription.status)} 
                text={selectedSubscription.status.toUpperCase()} 
              />
            </Descriptions.Item>

            <Descriptions.Item label="Precio">
              ${selectedSubscription.amount} {selectedSubscription.currency?.toUpperCase() || "USD"}
            </Descriptions.Item>

            <Descriptions.Item label="Ciclo de Facturación">
              {selectedSubscription.billing_cycle === "monthly" ? "Mensual" : "Anual"}
            </Descriptions.Item>

            <Descriptions.Item label="Fecha de Inicio">
              {dayjs(selectedSubscription.start_date).format("DD/MM/YYYY")}
            </Descriptions.Item>

            <Descriptions.Item label="Próximo Pago">
              {selectedSubscription.next_payment_date
                ? dayjs(selectedSubscription.next_payment_date).format("DD/MM/YYYY")
                : "-"}
            </Descriptions.Item>

            {selectedSubscription.end_date && (
              <Descriptions.Item label="Fecha de Fin">
                {dayjs(selectedSubscription.end_date).format("DD/MM/YYYY")}
              </Descriptions.Item>
            )}

            {selectedSubscription.stripe_subscription_id && (
              <Descriptions.Item label="ID de Stripe" span={2}>
                <Text code>{selectedSubscription.stripe_subscription_id}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        </TabPane>

        <TabPane tab="Servicios Incluidos" key="2">
          <Card>
            {selectedSubscription.plan === "elite" && (
              <Space direction="vertical" style={{ width: "100%" }} size="large">
                <Alert
                  message="Plan Elite - Todos los Servicios Premium"
                  type="success"
                  showIcon
                />
                <List
                  dataSource={[
                    { icon: <CheckCircleOutlined />, text: "12 limpiezas profesionales al año" },
                    { icon: <CheckCircleOutlined />, text: "2 inspecciones completas anuales" },
                    { icon: <CheckCircleOutlined />, text: "Protección Elite contra daños accidentales" },
                    { icon: <CheckCircleOutlined />, text: "Programa Trade-In disponible" },
                    { icon: <CheckCircleOutlined />, text: "Soporte prioritario 24/7" },
                    { icon: <CheckCircleOutlined />, text: "Garantía extendida incluida" },
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <Space>
                        {item.icon}
                        <Text>{item.text}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
                {selectedSubscription.metadata?.services_used !== undefined && (
                  <div>
                    <Text strong>Servicios utilizados este año: </Text>
                    <Progress
                      percent={(selectedSubscription.metadata.services_used / 14) * 100}
                      format={() => `${selectedSubscription.metadata.services_used}/14`}
                    />
                  </div>
                )}
              </Space>
            )}

            {selectedSubscription.plan === "premium" && (
              <Space direction="vertical" style={{ width: "100%" }} size="large">
                <Alert
                  message="Plan Premium - Servicios Mejorados"
                  type="info"
                  showIcon
                />
                <List
                  dataSource={[
                    { icon: <CheckCircleOutlined />, text: "6 limpiezas profesionales al año" },
                    { icon: <CheckCircleOutlined />, text: "1 inspección completa anual" },
                    { icon: <CheckCircleOutlined />, text: "Protección Premium" },
                    { icon: <CheckCircleOutlined />, text: "Soporte extendido" },
                    { icon: <CheckCircleOutlined />, text: "Descuentos en productos" },
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <Space>
                        {item.icon}
                        <Text>{item.text}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Space>
            )}

            {selectedSubscription.plan === "basic" && (
              <Space direction="vertical" style={{ width: "100%" }} size="large">
                <Alert
                  message="Plan Basic - Servicios Esenciales"
                  type="info"
                  showIcon
                />
                <List
                  dataSource={[
                    { icon: <CheckCircleOutlined />, text: "3 limpiezas profesionales al año" },
                    { icon: <CheckCircleOutlined />, text: "Protección básica" },
                    { icon: <CheckCircleOutlined />, text: "Soporte estándar" },
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <Space>
                        {item.icon}
                        <Text>{item.text}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Space>
            )}
          </Card>
        </TabPane>

        <TabPane tab="Historial" key="3">
          <Timeline>
            <Timeline.Item color="green">
              <p>Suscripción creada</p>
              <Text type="secondary">
                {dayjs(selectedSubscription.created_at).format("DD/MM/YYYY HH:mm")}
              </Text>
            </Timeline.Item>

            {selectedSubscription.trial_end_date && (
              <Timeline.Item color="blue">
                <p>Período de prueba finalizado</p>
                <Text type="secondary">
                  {dayjs(selectedSubscription.trial_end_date).format("DD/MM/YYYY")}
                </Text>
              </Timeline.Item>
            )}

            {selectedSubscription.metadata?.last_service_date && (
              <Timeline.Item>
                <p>Último servicio utilizado</p>
                <Text type="secondary">
                  {dayjs(selectedSubscription.metadata.last_service_date).format("DD/MM/YYYY")}
                </Text>
              </Timeline.Item>
            )}

            {selectedSubscription.updated_at && (
              <Timeline.Item>
                <p>Última actualización</p>
                <Text type="secondary">
                  {dayjs(selectedSubscription.updated_at).format("DD/MM/YYYY HH:mm")}
                </Text>
              </Timeline.Item>
            )}

            {selectedSubscription.status === "cancelled" && selectedSubscription.end_date && (
              <Timeline.Item color="red">
                <p>Suscripción cancelada</p>
                <Text type="secondary">
                  {dayjs(selectedSubscription.end_date).format("DD/MM/YYYY")}
                </Text>
                {selectedSubscription.cancellation_reason && (
                  <div>
                    <Text type="secondary">Razón: {selectedSubscription.cancellation_reason}</Text>
                  </div>
                )}
              </Timeline.Item>
            )}
          </Timeline>
        </TabPane>
      </Tabs>
    );
  };

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <div>
          <Title level={2}>
            <CreditCardOutlined /> Gestión de Suscripciones
          </Title>
          <Paragraph type="secondary">
            Administra y monitorea todas las suscripciones de tus clientes
          </Paragraph>
        </div>

        {/* Statistics */}
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Suscripciones Activas"
                value={activeSubscriptions}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Ingresos Mensuales"
                value={totalRevenue}
                prefix="$"
                precision={2}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tasa de Cancelación"
                value={churnRate}
                suffix="%"
                prefix={<FallOutlined />}
                valueStyle={{ color: parseFloat(churnRate.toString()) > 10 ? "#cf1322" : "#3f8600" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text type="secondary">Distribución de Planes</Text>
                <Space>
                  <Tag color="blue">Basic: {planDistribution.basic}</Tag>
                  <Tag color="purple">Premium: {planDistribution.premium}</Tag>
                  <Tag color="gold">Elite: {planDistribution.elite}</Tag>
                </Space>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Filters and Search */}
        <Card>
          <Space size="large" style={{ marginBottom: 16 }}>
            <Input.Search
              placeholder="Buscar por cliente"
              onSearch={setSearchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
            <Select
              placeholder="Filtrar por estado"
              style={{ width: 150 }}
              allowClear
              onChange={setStatusFilter}
              value={statusFilter}
            >
              <Option value="active">Activa</Option>
              <Option value="cancelled">Cancelada</Option>
              <Option value="paused">Pausada</Option>
              <Option value="expired">Expirada</Option>
              <Option value="trial">Prueba</Option>
            </Select>
            <Select
              placeholder="Filtrar por plan"
              style={{ width: 150 }}
              allowClear
              onChange={setPlanFilter}
              value={planFilter}
            >
              <Option value="basic">Basic</Option>
              <Option value="premium">Premium</Option>
              <Option value="elite">Elite</Option>
            </Select>
          </Space>
        </Card>

        {/* Subscriptions Table */}
        <Card title="Lista de Suscripciones">
          <Table
            dataSource={subscriptionsData?.data || []}
            columns={columns}
            rowKey="id"
            loading={!subscriptionsData}
            pagination={{
              total: subscriptionsData?.total,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total: ${total} suscripciones`,
            }}
          />
        </Card>
      </Space>

      {/* Detail Modal */}
      <Modal
        title="Detalles de la Suscripción"
        visible={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Cerrar
          </Button>,
        ]}
        width={800}
      >
        {renderSubscriptionDetails()}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Editar Suscripción"
        visible={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateSubscription}
        >
          <Form.Item
            name="plan"
            label="Plan"
            rules={[{ required: true, message: "Por favor seleccione un plan" }]}
          >
            <Select>
              <Option value="basic">Basic - $29.99/mes</Option>
              <Option value="premium">Premium - $49.99/mes</Option>
              <Option value="elite">Elite - $79.99/mes</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="billing_cycle"
            label="Ciclo de Facturación"
            rules={[{ required: true, message: "Por favor seleccione el ciclo" }]}
          >
            <Select>
              <Option value="monthly">Mensual</Option>
              <Option value="yearly">Anual</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="next_payment_date"
            label="Próximo Pago"
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Estado"
            rules={[{ required: true, message: "Por favor seleccione el estado" }]}
          >
            <Select>
              <Option value="active">Activa</Option>
              <Option value="paused">Pausada</Option>
              <Option value="cancelled">Cancelada</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space style={{ float: "right" }}>
              <Button onClick={() => setIsEditModalVisible(false)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                Actualizar Suscripción
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};