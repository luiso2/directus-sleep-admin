import React, { useState, useEffect } from "react";
import { Row, Col, Card, Typography, Progress, Button, List, Tag, Space, Modal, Form, Input, Select, InputNumber, message, Badge, Statistic, Timeline } from "antd";
import {
  PhoneOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  DollarOutlined,
  FireOutlined,
  RocketOutlined,
  TrophyOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useCreate, useList, useUpdate, useGetIdentity } from "@refinedev/core";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface Task {
  id: string;
  customer_id: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    last_contact?: string;
    notes?: string;
  };
  status: "pending" | "completed" | "no_answer" | "callback" | "sold";
  scheduled_date: string;
  callback_date?: string;
  notes?: string;
}

interface Sale {
  id: string;
  total_amount: number;
  commission_amount: number;
  products: any[];
}

export const AgentDashboard: React.FC = () => {
  const { data: identity } = useGetIdentity<{ id: string; name: string; email: string; }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [form] = Form.useForm();
  const [dailyStats, setDailyStats] = useState({
    calls: 15,
    sales: 1,
    callbacks: 3,
    commission: 125,
  });

  // Metas diarias
  const dailyGoals = {
    calls: 25,
    sales: 3,
  };

  // Cargar tareas del día
  const { data: tasksData, isLoading: loadingTasks, refetch: refetchTasks } = useList<Task>({
    resource: "calls",
    filters: [
      {
        field: "assigned_to",
        operator: "eq",
        value: identity?.id,
      },
      {
        field: "scheduled_date",
        operator: "eq",
        value: new Date().toISOString().split('T')[0],
      },
    ],
    sorters: [
      {
        field: "status",
        order: "asc",
      },
    ],
  });

  // Hooks para crear y actualizar
  const { mutate: createSale } = useCreate();
  const { mutate: updateTask } = useUpdate();

  // Manejar resultado de llamada
  const handleCallResult = async (values: any) => {
    try {
      if (!selectedTask) return;

      // Actualizar tarea
      await updateTask({
        resource: "calls",
        id: selectedTask.id,
        values: {
          status: values.status,
          notes: values.notes,
          callback_date: values.callback_date,
        },
      });

      // Si es una venta, crear registro de venta
      if (values.status === "sold") {
        await createSale({
          resource: "sales",
          values: {
            task_id: selectedTask.id,
            customer_id: selectedTask.customer_id,
            agent_id: identity?.id,
            products: values.products,
            total_amount: values.total_amount,
            commission_amount: values.total_amount * 0.10, // 10% comisión
            payment_method: values.payment_method,
          },
        });

        message.success("¡Venta registrada exitosamente! 🎉");
        
        // Actualizar estadísticas
        setDailyStats(prev => ({
          ...prev,
          sales: prev.sales + 1,
          commission: prev.commission + (values.total_amount * 0.10),
        }));
      } else {
        message.success("Resultado registrado correctamente");
      }

      // Actualizar estadísticas de llamadas
      if (values.status !== "pending") {
        setDailyStats(prev => ({
          ...prev,
          calls: prev.calls + 1,
          callbacks: values.status === "callback" ? prev.callbacks + 1 : prev.callbacks,
        }));
      }

      setIsModalOpen(false);
      form.resetFields();
      refetchTasks();
    } catch (error) {
      message.error("Error al registrar el resultado");
    }
  };

  // Estado del día
  const getDayStatus = () => {
    const callsProgress = (dailyStats.calls / dailyGoals.calls) * 100;
    const salesProgress = (dailyStats.sales / dailyGoals.sales) * 100;
    
    if (salesProgress >= 100) return { text: "¡Objetivo Cumplido! 🎉", color: "#52c41a" };
    if (callsProgress >= 80) return { text: "¡Casi lo logras! 💪", color: "#fa8c16" };
    if (callsProgress >= 50) return { text: "Buen progreso 👍", color: "#1890ff" };
    return { text: "¡A por todas! 🚀", color: "#722ed1" };
  };

  const dayStatus = getDayStatus();

  // Filtrar tareas por estado
  const pendingTasks = tasksData?.data?.filter(t => t.status === "pending") || [];
  const completedTasks = tasksData?.data?.filter(t => t.status !== "pending") || [];

  return (
    <div style={{ padding: "24px" }}>
      {/* Header con saludo */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3}>¡Hola, {identity?.name}! 👋</Title>
          <Text type="secondary">{new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        </Col>
        <Col>
          <Tag color={dayStatus.color} style={{ fontSize: 16, padding: "4px 12px" }}>
            {dayStatus.text}
          </Tag>
        </Col>
      </Row>

      {/* Progreso del día */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>Mi Progreso de Hoy</Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Space>
                  <PhoneOutlined style={{ fontSize: 20, color: "#1890ff" }} />
                  <Text>Llamadas Realizadas</Text>
                </Space>
                <Text strong>{dailyStats.calls} / {dailyGoals.calls}</Text>
              </div>
              <Progress
                percent={(dailyStats.calls / dailyGoals.calls) * 100}
                strokeColor="#1890ff"
                format={() => `${dailyStats.calls}/${dailyGoals.calls}`}
              />
            </Space>
          </Col>
          <Col xs={24} md={12}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Space>
                  <TrophyOutlined style={{ fontSize: 20, color: "#52c41a" }} />
                  <Text>Ventas Cerradas</Text>
                </Space>
                <Text strong>{dailyStats.sales} / {dailyGoals.sales}</Text>
              </div>
              <Progress
                percent={(dailyStats.sales / dailyGoals.sales) * 100}
                strokeColor="#52c41a"
                format={() => `${dailyStats.sales}/${dailyGoals.sales}`}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Estadísticas rápidas */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Callbacks"
              value={dailyStats.callbacks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Comisión Hoy"
              value={dailyStats.commission}
              prefix="$"
              precision={2}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Tasa Conversión"
              value={dailyStats.calls > 0 ? (dailyStats.sales / dailyStats.calls) * 100 : 0}
              suffix="%"
              precision={1}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Pendientes"
              value={pendingTasks.length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Lista de tareas */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <FireOutlined />
                <Text>Mi Lista de Hoy ({pendingTasks.length} pendientes)</Text>
              </Space>
            }
            loading={loadingTasks}
          >
            <List
              dataSource={pendingTasks}
              renderItem={(task) => (
                <List.Item
                  actions={[
                    <Button
                      type="primary"
                      onClick={() => {
                        setSelectedTask(task);
                        setIsModalOpen(true);
                      }}
                    >
                      Registrar Llamada
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Badge status="processing" />}
                    title={
                      <Space>
                        <Text strong>{task.customer.name}</Text>
                        <Tag icon={<PhoneOutlined />}>{task.customer.phone}</Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        {task.customer.email && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            📧 {task.customer.email}
                          </Text>
                        )}
                        {task.customer.notes && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            📝 {task.customer.notes}
                          </Text>
                        )}
                        {task.customer.last_contact && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Último contacto: {new Date(task.customer.last_contact).toLocaleDateString()}
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: "¡Felicidades! Has completado todas tus llamadas 🎉" }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="📅 Callbacks Programados">
            <Timeline>
              {tasksData?.data
                ?.filter(t => t.status === "callback" && t.callback_date)
                .map(task => (
                  <Timeline.Item
                    key={task.id}
                    color="orange"
                    dot={<ClockCircleOutlined />}
                  >
                    <Space direction="vertical" size={0}>
                      <Text strong>{task.customer.name}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {new Date(task.callback_date!).toLocaleString()}
                      </Text>
                      {task.notes && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {task.notes}
                        </Text>
                      )}
                    </Space>
                  </Timeline.Item>
                ))}
            </Timeline>
          </Card>

          <Card title="🏆 Mis Logros de Hoy" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              {dailyStats.sales >= 1 && (
                <Tag color="green" style={{ width: "100%", padding: 8 }}>
                  🎯 Primera Venta del Día
                </Tag>
              )}
              {dailyStats.calls >= 10 && (
                <Tag color="blue" style={{ width: "100%", padding: 8 }}>
                  📞 10 Llamadas Completadas
                </Tag>
              )}
              {dailyStats.sales >= dailyGoals.sales && (
                <Tag color="gold" style={{ width: "100%", padding: 8 }}>
                  🌟 Meta de Ventas Cumplida
                </Tag>
              )}
              {(dailyStats.sales / dailyStats.calls) * 100 >= 20 && (
                <Tag color="purple" style={{ width: "100%", padding: 8 }}>
                  🔥 Conversión Superior al 20%
                </Tag>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Modal de registro de llamada */}
      <Modal
        title="Registrar Resultado de Llamada"
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
          onFinish={handleCallResult}
        >
          <Form.Item
            name="status"
            label="Resultado"
            rules={[{ required: true, message: "Selecciona un resultado" }]}
          >
            <Select size="large">
              <Select.Option value="no_answer">
                <Space>
                  <PhoneOutlined />
                  No Contestó
                </Space>
              </Select.Option>
              <Select.Option value="callback">
                <Space>
                  <ClockCircleOutlined />
                  Agendar Callback
                </Space>
              </Select.Option>
              <Select.Option value="not_interested">
                <Space>
                  <CloseCircleOutlined />
                  No Interesado
                </Space>
              </Select.Option>
              <Select.Option value="sold">
                <Space>
                  <CheckCircleOutlined />
                  ¡Venta Realizada!
                </Space>
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.status !== currentValues.status}
          >
            {({ getFieldValue }) => {
              const status = getFieldValue("status");
              
              if (status === "callback") {
                return (
                  <Form.Item
                    name="callback_date"
                    label="Fecha y Hora del Callback"
                    rules={[{ required: true, message: "Selecciona fecha y hora" }]}
                  >
                    <Input type="datetime-local" />
                  </Form.Item>
                );
              }

              if (status === "sold") {
                return (
                  <>
                    <Form.Item
                      name="products"
                      label="Productos Vendidos"
                      rules={[{ required: true, message: "Selecciona los productos" }]}
                    >
                      <Select mode="multiple" placeholder="Selecciona productos">
                        <Select.Option value="mattress_premium">Colchón Premium</Select.Option>
                        <Select.Option value="pillow_ortho">Almohada Ortopédica</Select.Option>
                        <Select.Option value="sleep_kit">Kit del Sueño</Select.Option>
                        <Select.Option value="supplement">Suplemento Natural</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name="total_amount"
                      label="Monto Total ($)"
                      rules={[{ required: true, message: "Ingresa el monto" }]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        min={0}
                        step={0.01}
                        prefix="$"
                      />
                    </Form.Item>
                    <Form.Item
                      name="payment_method"
                      label="Método de Pago"
                      rules={[{ required: true, message: "Selecciona método de pago" }]}
                    >
                      <Select>
                        <Select.Option value="credit_card">Tarjeta de Crédito</Select.Option>
                        <Select.Option value="debit_card">Tarjeta de Débito</Select.Option>
                        <Select.Option value="transfer">Transferencia</Select.Option>
                        <Select.Option value="cash">Efectivo</Select.Option>
                      </Select>
                    </Form.Item>
                  </>
                );
              }

              return null;
            }}
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notas de la Conversación"
          >
            <TextArea rows={4} placeholder="Agrega cualquier detalle importante..." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Guardar Resultado
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
