import React, { useState, useEffect } from "react";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { 
  Form, 
  Input, 
  Select, 
  Card, 
  Row, 
  Col, 
  DatePicker,
  Space,
  Button,
  Alert,
  Tag,
  InputNumber,
  Switch
} from "antd";
import { 
  PhoneOutlined, 
  UserOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useGetIdentity } from "@refinedev/core";
import dayjs from "dayjs";
import type { CreateCallForm, Customer, DirectusUser } from "../../types/directus";

const { TextArea } = Input;

export const CallCreate: React.FC = () => {
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<DirectusUser>();
  const [callInProgress, setCallInProgress] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const { formProps, saveButtonProps, form } = useForm<CreateCallForm>({
    resource: "calls",
    redirect: "show",
    onMutationSuccess: () => {
      navigate("/calls");
    },
  });

  // Selector de clientes
  const { selectProps: customerSelectProps } = useSelect<Customer>({
    resource: "customers",
    optionLabel: (item) => `${item.first_name} ${item.last_name}`,
    optionValue: "id",
  });

  // Establecer el usuario actual por defecto
  useEffect(() => {
    if (identity) {
      form.setFieldsValue({ user_id: identity.id });
    }
  }, [identity, form]);

  // Manejar el cronómetro
  useEffect(() => {
    if (callInProgress && startTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setDuration(diff);
      }, 1000);
      setTimer(interval);
      return () => clearInterval(interval);
    } else {
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }
    }
  }, [callInProgress, startTime]);

  const handleStartCall = () => {
    const now = new Date();
    setStartTime(now);
    setCallInProgress(true);
    form.setFieldsValue({ 
      start_time: now.toISOString(),
      status: "in_progress"
    });
  };

  const handleEndCall = () => {
    const now = new Date();
    setCallInProgress(false);
    form.setFieldsValue({ 
      end_time: now.toISOString(),
      duration: duration,
      status: "completed"
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const commonObjections = [
    { value: "price", label: "Precio muy alto" },
    { value: "time", label: "No es buen momento" },
    { value: "partner", label: "Consultar con pareja" },
    { value: "think", label: "Necesita pensarlo" },
    { value: "comparison", label: "Comparando opciones" },
  ];

  const nextActionOptions = [
    { value: "call_back", label: "Volver a llamar" },
    { value: "send_info", label: "Enviar información" },
    { value: "schedule_visit", label: "Agendar visita" },
    { value: "close_sale", label: "Cerrar venta" },
    { value: "no_action", label: "Sin acción" },
  ];

  return (
    <Create 
      saveButtonProps={saveButtonProps} 
      title="Nueva Llamada/Tarea"
    >
      <Form {...formProps} layout="vertical">
        {/* Control de llamada en tiempo real */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Card bordered={false} style={{ background: "#f0f2f5" }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Space size="large">
                    <div>
                      <span style={{ fontSize: "12px", color: "#666" }}>Duración</span>
                      <div style={{ fontSize: "24px", fontWeight: "bold", fontFamily: "monospace" }}>
                        {formatDuration(duration)}
                      </div>
                    </div>
                    {callInProgress && (
                      <Tag color="processing" icon={<LoadingOutlined spin />}>
                        Llamada en curso
                      </Tag>
                    )}
                  </Space>
                </Col>
                <Col>
                  <Space>
                    {!callInProgress ? (
                      <Button 
                        type="primary" 
                        size="large"
                        icon={<PlayCircleOutlined />}
                        onClick={handleStartCall}
                      >
                        Iniciar Llamada
                      </Button>
                    ) : (
                      <Button 
                        danger 
                        size="large"
                        icon={<PauseCircleOutlined />}
                        onClick={handleEndCall}
                      >
                        Finalizar Llamada
                      </Button>
                    )}
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {/* Información de la Llamada */}
          <Col xs={24} lg={12}>
            <Card title="Información de la Llamada" bordered={false}>
              <Form.Item
                label="Tipo de Llamada"
                name="type"
                rules={[{ required: true, message: "Seleccione el tipo de llamada" }]}
                initialValue="outbound"
              >
                <Select>
                  <Select.Option value="inbound">
                    <Space>
                      <PhoneOutlined style={{ color: "#1890ff" }} />
                      Entrante
                    </Space>
                  </Select.Option>
                  <Select.Option value="outbound">
                    <Space>
                      <PhoneOutlined style={{ color: "#52c41a" }} />
                      Saliente
                    </Space>
                  </Select.Option>
                  <Select.Option value="callback">
                    <Space>
                      <PhoneOutlined style={{ color: "#faad14" }} />
                      Devolución de llamada
                    </Space>
                  </Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Cliente"
                name="customer_id"
                rules={[{ required: true, message: "Seleccione un cliente" }]}
              >
                <Select 
                  {...customerSelectProps} 
                  placeholder="Seleccione un cliente"
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>

              <Form.Item
                label="Agente"
                name="user_id"
                rules={[{ required: true, message: "El agente es requerido" }]}
              >
                <Input 
                  readOnly 
                  placeholder={identity ? `${identity.first_name} ${identity.last_name}` : "Agente actual"}
                  prefix={<UserOutlined />}
                />
              </Form.Item>

              <Form.Item
                label="Estado"
                name="status"
                initialValue="pending"
                rules={[{ required: true, message: "El estado es requerido" }]}
              >
                <Select>
                  <Select.Option value="pending">Pendiente</Select.Option>
                  <Select.Option value="in_progress">En Progreso</Select.Option>
                  <Select.Option value="completed">Completada</Select.Option>
                  <Select.Option value="failed">Fallida</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Resultado de la Llamada"
                name="disposition"
              >
                <Select placeholder="Seleccione el resultado">
                  <Select.Option value="sale">
                    <Tag color="success">Venta</Tag>
                  </Select.Option>
                  <Select.Option value="callback">
                    <Tag color="processing">Volver a llamar</Tag>
                  </Select.Option>
                  <Select.Option value="no_answer">
                    <Tag color="warning">No contesta</Tag>
                  </Select.Option>
                  <Select.Option value="not_interested">
                    <Tag color="error">No interesado</Tag>
                  </Select.Option>
                  <Select.Option value="busy">
                    <Tag color="default">Ocupado</Tag>
                  </Select.Option>
                </Select>
              </Form.Item>

              {/* Campos ocultos para tiempo */}
              <Form.Item name="start_time" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="end_time" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="duration" hidden>
                <InputNumber />
              </Form.Item>
            </Card>
          </Col>

          {/* Detalles y Script */}
          <Col xs={24} lg={12}>
            <Card title="Detalles de la Llamada" bordered={false}>
              <Form.Item
                label="Script Utilizado"
                name={["script", "used"]}
              >
                <Select placeholder="Seleccione un script">
                  <Select.Option value="script-001">Script Venta Colchón King</Select.Option>
                  <Select.Option value="script-002">Script Promoción Especial</Select.Option>
                  <Select.Option value="script-003">Script Seguimiento</Select.Option>
                  <Select.Option value="script-004">Script Reactivación</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Objeciones Encontradas"
                name={["objections"]}
              >
                <Select 
                  mode="multiple" 
                  placeholder="Seleccione las objeciones"
                  options={commonObjections}
                />
              </Form.Item>

              <Form.Item
                label="Próxima Acción"
                name={["next_action", "type"]}
              >
                <Select 
                  placeholder="Seleccione la próxima acción"
                  options={nextActionOptions}
                />
              </Form.Item>

              <Form.Item
                label="Fecha de Próxima Acción"
                name={["next_action", "date"]}
              >
                <DatePicker 
                  style={{ width: "100%" }} 
                  format="DD/MM/YYYY"
                  disabledDate={(current) => {
                    return current && current < dayjs().startOf('day');
                  }}
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        {/* Notas */}
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="Notas y Observaciones" bordered={false}>
              <Alert
                message="Registro importante"
                description="Documente todos los detalles relevantes de la conversación, acuerdos alcanzados y compromisos establecidos."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              <Form.Item
                name="notes"
                rules={[{ required: true, message: "Las notas son requeridas" }]}
              >
                <TextArea 
                  rows={6} 
                  placeholder="Resumen de la conversación, puntos clave discutidos, interés del cliente, próximos pasos..." 
                />
              </Form.Item>

              {/* Metadata adicional */}
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="Teléfono Contactado"
                    name={["metadata", "phone"]}
                  >
                    <Input placeholder="+52 555 123 4567" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Campaña"
                    name={["metadata", "campaign"]}
                  >
                    <Select placeholder="Seleccione campaña">
                      <Select.Option value="camp-001">Campaña Navideña 2024</Select.Option>
                      <Select.Option value="camp-002">Black Friday 2024</Select.Option>
                      <Select.Option value="camp-003">Promoción Verano</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Sentimiento del Cliente"
                    name={["metadata", "sentiment"]}
                  >
                    <Select placeholder="Seleccione sentimiento">
                      <Select.Option value="positive">
                        <Tag color="success">Positivo</Tag>
                      </Select.Option>
                      <Select.Option value="neutral">
                        <Tag color="default">Neutral</Tag>
                      </Select.Option>
                      <Select.Option value="negative">
                        <Tag color="error">Negativo</Tag>
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Form>
    </Create>
  );
};
