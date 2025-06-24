import React, { useState } from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { 
  Form, 
  Input, 
  Select, 
  Card, 
  Row, 
  Col, 
  DatePicker,
  Space,
  Tag,
  InputNumber,
  Descriptions,
  Alert
} from "antd";
import { 
  PhoneOutlined, 
  UserOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  FileTextOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import type { Call, Customer } from "../../types/directus";

const { TextArea } = Input;

export const CallEdit: React.FC = () => {
  const navigate = useNavigate();
  
  const { formProps, saveButtonProps, query } = useForm<Call>({
    resource: "calls",
    redirect: "show",
    onMutationSuccess: () => {
      navigate("/calls");
    },
  });

  const call = query?.data?.data;

  // Selector de clientes
  const { selectProps: customerSelectProps } = useSelect<Customer>({
    resource: "customers",
    optionLabel: (item) => `${item.first_name} ${item.last_name}`,
    optionValue: "id",
    defaultValue: call?.customer_id,
  });

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return "00:00";
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "in_progress":
        return "processing";
      case "completed":
        return "success";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "in_progress":
        return "En Progreso";
      case "completed":
        return "Completada";
      case "failed":
        return "Fallida";
      default:
        return status || "Sin estado";
    }
  };

  return (
    <Edit 
      saveButtonProps={saveButtonProps} 
      title={`Editar Llamada/Tarea`}
    >
      <Form {...formProps} layout="vertical">
        {/* Resumen de la llamada */}
        {call && (
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col span={24}>
              <Card bordered={false} style={{ background: "#f0f2f5" }}>
                <Descriptions column={4} size="small">
                  <Descriptions.Item label="ID">
                    {call.id}
                  </Descriptions.Item>
                  <Descriptions.Item label="Duración">
                    <Space>
                      <ClockCircleOutlined />
                      {formatDuration(call.duration)}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Inicio">
                    {call.start_time ? new Date(call.start_time).toLocaleString("es-MX") : "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Estado Actual">
                    <Tag color={getStatusColor(call.status)}>
                      {getStatusLabel(call.status)}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>
        )}

        <Row gutter={[16, 16]}>
          {/* Información de la Llamada */}
          <Col xs={24} lg={12}>
            <Card title="Información de la Llamada" bordered={false}>
              <Form.Item
                label="Tipo de Llamada"
                name="type"
                rules={[{ required: true, message: "Seleccione el tipo de llamada" }]}
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
                label="ID del Agente"
                name="user_id"
                rules={[{ required: true, message: "El agente es requerido" }]}
              >
                <Input 
                  readOnly 
                  prefix={<UserOutlined />}
                />
              </Form.Item>

              <Form.Item
                label="Estado"
                name="status"
                rules={[{ required: true, message: "El estado es requerido" }]}
              >
                <Select>
                  <Select.Option value="pending">
                    <Tag color="warning">Pendiente</Tag>
                  </Select.Option>
                  <Select.Option value="in_progress">
                    <Tag color="processing">En Progreso</Tag>
                  </Select.Option>
                  <Select.Option value="completed">
                    <Tag color="success">Completada</Tag>
                  </Select.Option>
                  <Select.Option value="failed">
                    <Tag color="error">Fallida</Tag>
                  </Select.Option>
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

              <Form.Item
                label="Duración (segundos)"
                name="duration"
              >
                <InputNumber 
                  min={0} 
                  style={{ width: "100%" }}
                  addonAfter={call?.duration ? formatDuration(call.duration) : undefined}
                />
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
                getValueProps={(value) => ({
                  value: value ? dayjs(value) : undefined,
                })}
              >
                <DatePicker 
                  style={{ width: "100%" }} 
                  format="DD/MM/YYYY"
                  disabledDate={(current) => {
                    return current && current < dayjs().startOf('day');
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Hora de Inicio"
                name="start_time"
                getValueProps={(value) => ({
                  value: value ? dayjs(value) : undefined,
                })}
              >
                <DatePicker 
                  showTime 
                  style={{ width: "100%" }} 
                  format="DD/MM/YYYY HH:mm:ss"
                />
              </Form.Item>

              <Form.Item
                label="Hora de Finalización"
                name="end_time"
                getValueProps={(value) => ({
                  value: value ? dayjs(value) : undefined,
                })}
              >
                <DatePicker 
                  showTime 
                  style={{ width: "100%" }} 
                  format="DD/MM/YYYY HH:mm:ss"
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        {/* Notas */}
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="Notas y Observaciones" bordered={false}>
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

        {/* Información del Sistema */}
        {call && (
          <Row style={{ marginTop: 16 }}>
            <Col span={24}>
              <Card title="Información del Sistema" bordered={false} size="small">
                <Alert
                  message="Información de registro"
                  description="Esta llamada fue registrada en el sistema. Los cambios quedarán guardados en el historial."
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Creado">
                    {call.created_at ? new Date(call.created_at).toLocaleString("es-MX") : "No disponible"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Última actualización">
                    {new Date().toLocaleString("es-MX")}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>
        )}
      </Form>
    </Edit>
  );
};
