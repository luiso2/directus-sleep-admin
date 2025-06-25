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
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Statistic,
  Steps,
  Upload,
  Rate,
  Slider,
  Alert,
  message,
  Tooltip,
  Badge,
  Timeline,
  Descriptions,
  Image,
  List,
  Progress,
  InputNumber,
  Divider,
  Radio,
} from "antd";
import {
  SwapOutlined,
  CameraOutlined,
  DollarOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FileImageOutlined,
  FormOutlined,
  GiftOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  DownloadOutlined,
  PrinterOutlined,
  MailOutlined,
  PlusOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import {
  useList,
  useCreate,
  useUpdate,
  useDelete,
  useOne,
} from "@refinedev/core";
import dayjs from "dayjs";
import type { UploadFile } from "antd/es/upload/interface";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

interface IEvaluation {
  id: string;
  customer_id: string;
  mattress_brand: string;
  mattress_model?: string;
  years_of_use: number;
  condition_rating: number;
  has_stains: boolean;
  has_odors: boolean;
  has_bedbugs: boolean;
  has_structural_damage: boolean;
  photos?: string[];
  evaluation_status: "pending" | "in_review" | "approved" | "rejected";
  trade_in_value: number;
  discount_percentage: number;
  coupon_code?: string;
  coupon_generated_at?: string;
  evaluator_notes?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at?: string;
  expires_at?: string;
}

interface ICustomer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

export const TradeInEvaluations: React.FC = () => {
  const [selectedEvaluation, setSelectedEvaluation] = useState<IEvaluation | null>(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isEvaluateModalVisible, setIsEvaluateModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [currentStep, setCurrentStep] = useState(0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const [evaluationForm] = Form.useForm();

  // Fetch evaluations
  const { data: evaluationsData, refetch: refetchEvaluations } = useList<IEvaluation>({
    resource: "evaluations",
    sorters: [{ field: "created_at", order: "desc" }],
    filters: statusFilter
      ? [{ field: "evaluation_status", operator: "eq", value: statusFilter }]
      : [],
  });

  // Fetch customers
  const { data: customersData } = useList<ICustomer>({
    resource: "new_customers",
  });

  const { mutate: createEvaluation } = useCreate();
  const { mutate: updateEvaluation } = useUpdate();
  const { mutate: createCoupon } = useCreate();

  const getCustomerInfo = (customerId: string): ICustomer | undefined => {
    return customersData?.data?.find((c) => c.id === customerId);
  };

  const calculateTradeInValue = (values: any) => {
    let baseValue = 200; // Base value for any mattress
    
    // Adjust based on years of use
    const yearsFactor = Math.max(0, 1 - (values.years_of_use * 0.1));
    baseValue *= yearsFactor;
    
    // Adjust based on condition
    const conditionFactor = values.condition_rating / 5;
    baseValue *= conditionFactor;
    
    // Deduct for issues
    if (values.has_stains) baseValue *= 0.8;
    if (values.has_odors) baseValue *= 0.7;
    if (values.has_structural_damage) baseValue *= 0.5;
    if (values.has_bedbugs) baseValue = 0; // No trade-in for bedbugs
    
    // Round to nearest $10
    return Math.round(baseValue / 10) * 10;
  };

  const handleCreateEvaluation = (values: any) => {
    const tradeInValue = calculateTradeInValue(values);
    const discountPercentage = Math.min(20, Math.round((tradeInValue / 1000) * 100));
    
    createEvaluation(
      {
        resource: "evaluations",
        values: {
          id: `eval_${Date.now()}`,
          ...values,
          trade_in_value: tradeInValue,
          discount_percentage: discountPercentage,
          evaluation_status: "pending",
          photos: fileList.map(file => file.url || file.thumbUrl),
          created_at: new Date().toISOString(),
          expires_at: dayjs().add(90, "days").toISOString(),
        },
      },
      {
        onSuccess: () => {
          message.success("Evaluación creada exitosamente");
          setIsCreateModalVisible(false);
          form.resetFields();
          setFileList([]);
          setCurrentStep(0);
          refetchEvaluations();
        },
      }
    );
  };

  const handleEvaluate = (values: any) => {
    const evaluation = selectedEvaluation!;
    
    if (values.evaluation_status === "approved") {
      // Generate coupon code
      const couponCode = `TRADEIN${evaluation.discount_percentage}${Date.now().toString().slice(-6)}`;
      
      // Update evaluation
      updateEvaluation(
        {
          resource: "evaluations",
          id: evaluation.id,
          values: {
            evaluation_status: "approved",
            evaluator_notes: values.evaluator_notes,
            trade_in_value: values.trade_in_value,
            discount_percentage: values.discount_percentage,
            coupon_code: couponCode,
            coupon_generated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
        {
          onSuccess: () => {
            // Create coupon in Shopify
            createCoupon(
              {
                resource: "shopify_coupons",
                values: {
                  id: `coupon_${Date.now()}`,
                  code: couponCode,
                  discount_type: "percentage",
                  value: values.discount_percentage,
                  usage_limit: 1,
                  status: "active",
                  trade_in_evaluation_id: evaluation.id,
                  customer_id: evaluation.customer_id,
                  start_date: new Date().toISOString(),
                  end_date: dayjs().add(90, "days").toISOString(),
                  created_at: new Date().toISOString(),
                },
              },
              {
                onSuccess: () => {
                  message.success("Evaluación aprobada y cupón generado");
                  setIsEvaluateModalVisible(false);
                  evaluationForm.resetFields();
                  refetchEvaluations();
                },
              }
            );
          },
        }
      );
    } else {
      // Reject evaluation
      updateEvaluation(
        {
          resource: "evaluations",
          id: evaluation.id,
          values: {
            evaluation_status: "rejected",
            rejection_reason: values.rejection_reason,
            evaluator_notes: values.evaluator_notes,
            updated_at: new Date().toISOString(),
          },
        },
        {
          onSuccess: () => {
            message.error("Evaluación rechazada");
            setIsEvaluateModalVisible(false);
            evaluationForm.resetFields();
            refetchEvaluations();
          },
        }
      );
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "processing",
      in_review: "warning",
      approved: "success",
      rejected: "error",
    };
    return colors[status as keyof typeof colors] || "default";
  };

  const columns = [
    {
      title: "Cliente",
      key: "customer",
      render: (_: any, record: IEvaluation) => {
        const customer = getCustomerInfo(record.customer_id);
        return customer ? (
          <Space>
            <UserOutlined />
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
    },
    {
      title: "Colchón",
      key: "mattress",
      render: (_: any, record: IEvaluation) => (
        <Space direction="vertical" size="small">
          <Text strong>{record.mattress_brand}</Text>
          {record.mattress_model && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.mattress_model}
            </Text>
          )}
          <Tag>{record.years_of_use} años de uso</Tag>
        </Space>
      ),
    },
    {
      title: "Condición",
      key: "condition",
      render: (_: any, record: IEvaluation) => (
        <Space direction="vertical" size="small">
          <Rate disabled value={record.condition_rating} />
          <Space size="small" wrap>
            {record.has_stains && <Tag color="orange">Manchas</Tag>}
            {record.has_odors && <Tag color="volcano">Olores</Tag>}
            {record.has_bedbugs && <Tag color="red">Chinches</Tag>}
            {record.has_structural_damage && <Tag color="red">Daño estructural</Tag>}
          </Space>
        </Space>
      ),
    },
    {
      title: "Valor Trade-In",
      key: "value",
      render: (_: any, record: IEvaluation) => (
        <Space direction="vertical" size="small">
          <Text strong style={{ fontSize: 16 }}>
            ${record.trade_in_value}
          </Text>
          <Tag color="green">{record.discount_percentage}% descuento</Tag>
        </Space>
      ),
      sorter: (a: IEvaluation, b: IEvaluation) => a.trade_in_value - b.trade_in_value,
    },
    {
      title: "Estado",
      dataIndex: "evaluation_status",
      key: "evaluation_status",
      render: (status: string) => (
        <Badge status={getStatusColor(status)} text={status.toUpperCase().replace("_", " ")} />
      ),
      filters: [
        { text: "Pendiente", value: "pending" },
        { text: "En Revisión", value: "in_review" },
        { text: "Aprobado", value: "approved" },
        { text: "Rechazado", value: "rejected" },
      ],
      filteredValue: statusFilter ? [statusFilter] : null,
    },
    {
      title: "Cupón",
      key: "coupon",
      render: (_: any, record: IEvaluation) => {
        if (record.evaluation_status !== "approved" || !record.coupon_code) {
          return <Text type="secondary">-</Text>;
        }
        return (
          <Space direction="vertical" size="small">
            <Text code copyable>{record.coupon_code}</Text>
            {record.expires_at && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Expira: {dayjs(record.expires_at).format("DD/MM/YYYY")}
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: "Fecha",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a: IEvaluation, b: IEvaluation) =>
        dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: IEvaluation) => (
        <Space>
          <Tooltip title="Ver detalles">
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedEvaluation(record);
                setIsDetailModalVisible(true);
              }}
            />
          </Tooltip>
          {record.evaluation_status === "pending" && (
            <Tooltip title="Evaluar">
              <Button
                type="primary"
                icon={<FormOutlined />}
                onClick={() => {
                  setSelectedEvaluation(record);
                  evaluationForm.setFieldsValue({
                    trade_in_value: record.trade_in_value,
                    discount_percentage: record.discount_percentage,
                  });
                  setIsEvaluateModalVisible(true);
                }}
              >
                Evaluar
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const renderEvaluationDetails = () => {
    if (!selectedEvaluation) return null;

    const customer = getCustomerInfo(selectedEvaluation.customer_id);

    return (
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Cliente" span={2}>
          {customer ? (
            <Space>
              <UserOutlined />
              <Text>
                {customer.first_name} {customer.last_name} ({customer.email})
              </Text>
            </Space>
          ) : (
            <Text type="secondary">Cliente no encontrado</Text>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Marca del Colchón">
          {selectedEvaluation.mattress_brand}
        </Descriptions.Item>

        <Descriptions.Item label="Modelo">
          {selectedEvaluation.mattress_model || "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Años de Uso">
          {selectedEvaluation.years_of_use} años
        </Descriptions.Item>

        <Descriptions.Item label="Condición General">
          <Rate disabled value={selectedEvaluation.condition_rating} />
        </Descriptions.Item>

        <Descriptions.Item label="Problemas Detectados" span={2}>
          <Space size="small" wrap>
            {!selectedEvaluation.has_stains && 
             !selectedEvaluation.has_odors && 
             !selectedEvaluation.has_bedbugs && 
             !selectedEvaluation.has_structural_damage ? (
              <Tag color="green">Sin problemas</Tag>
            ) : (
              <>
                {selectedEvaluation.has_stains && <Tag color="orange">Manchas</Tag>}
                {selectedEvaluation.has_odors && <Tag color="volcano">Olores</Tag>}
                {selectedEvaluation.has_bedbugs && <Tag color="red">Chinches</Tag>}
                {selectedEvaluation.has_structural_damage && <Tag color="red">Daño estructural</Tag>}
              </>
            )}
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="Valor Trade-In">
          <Text strong style={{ fontSize: 18 }}>${selectedEvaluation.trade_in_value}</Text>
        </Descriptions.Item>

        <Descriptions.Item label="Descuento Aplicable">
          <Tag color="green" style={{ fontSize: 16 }}>
            {selectedEvaluation.discount_percentage}%
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Estado" span={2}>
          <Badge 
            status={getStatusColor(selectedEvaluation.evaluation_status)} 
            text={selectedEvaluation.evaluation_status.toUpperCase().replace("_", " ")} 
          />
        </Descriptions.Item>

        {selectedEvaluation.coupon_code && (
          <>
            <Descriptions.Item label="Código de Cupón">
              <Text code copyable strong>{selectedEvaluation.coupon_code}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="Generado">
              {dayjs(selectedEvaluation.coupon_generated_at).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
          </>
        )}

        {selectedEvaluation.expires_at && (
          <Descriptions.Item label="Expira" span={2}>
            {dayjs(selectedEvaluation.expires_at).format("DD/MM/YYYY")}
            {dayjs().isAfter(selectedEvaluation.expires_at) && (
              <Tag color="red" style={{ marginLeft: 8 }}>EXPIRADO</Tag>
            )}
          </Descriptions.Item>
        )}

        {selectedEvaluation.evaluator_notes && (
          <Descriptions.Item label="Notas del Evaluador" span={2}>
            {selectedEvaluation.evaluator_notes}
          </Descriptions.Item>
        )}

        {selectedEvaluation.rejection_reason && (
          <Descriptions.Item label="Razón de Rechazo" span={2}>
            <Alert
              message={selectedEvaluation.rejection_reason}
              type="error"
              showIcon
            />
          </Descriptions.Item>
        )}

        <Descriptions.Item label="Fotos" span={2}>
          {selectedEvaluation.photos && selectedEvaluation.photos.length > 0 ? (
            <Image.PreviewGroup>
              <Space size="middle" wrap>
                {selectedEvaluation.photos.map((photo, index) => (
                  <Image
                    key={index}
                    width={100}
                    height={100}
                    src={photo}
                    style={{ objectFit: "cover" }}
                  />
                ))}
              </Space>
            </Image.PreviewGroup>
          ) : (
            <Text type="secondary">Sin fotos</Text>
          )}
        </Descriptions.Item>
      </Descriptions>
    );
  };

  const pendingEvaluations = evaluationsData?.data?.filter(e => e.evaluation_status === "pending").length || 0;
  const approvedEvaluations = evaluationsData?.data?.filter(e => e.evaluation_status === "approved").length || 0;
  const totalTradeInValue = evaluationsData?.data
    ?.filter(e => e.evaluation_status === "approved")
    ?.reduce((sum, e) => sum + e.trade_in_value, 0) || 0;

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <div>
          <Title level={2}>
            <SwapOutlined /> Evaluaciones Trade-In
          </Title>
          <Paragraph type="secondary">
            Gestiona las evaluaciones del programa Trade & Sleep para colchones usados
          </Paragraph>
        </div>

        {/* Statistics */}
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Evaluaciones Pendientes"
                value={pendingEvaluations}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Evaluaciones Aprobadas"
                value={approvedEvaluations}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Valor Total Trade-In"
                value={totalTradeInValue}
                prefix="$"
                precision={0}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tasa de Aprobación"
                value={evaluationsData?.total 
                  ? ((approvedEvaluations / evaluationsData.total) * 100).toFixed(1)
                  : 0}
                suffix="%"
                prefix={<StarOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Info Alert */}
        <Alert
          message="Programa Trade & Sleep"
          description={
            <Space direction="vertical">
              <Text>
                Los clientes con plan Elite pueden evaluar su colchón usado y recibir un crédito para la compra de uno nuevo.
              </Text>
              <Text>
                • Evaluación válida por 90 días
                • Descuento aplicable solo en colchones nuevos
                • Un cupón por cliente
              </Text>
            </Space>
          }
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
        />

        {/* Evaluations Table */}
        <Card
          title="Lista de Evaluaciones"
          extra={
            <Space>
              <Select
                placeholder="Filtrar por estado"
                style={{ width: 180 }}
                allowClear
                onChange={setStatusFilter}
                value={statusFilter}
              >
                <Option value="pending">Pendiente</Option>
                <Option value="in_review">En Revisión</Option>
                <Option value="approved">Aprobado</Option>
                <Option value="rejected">Rechazado</Option>
              </Select>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateModalVisible(true)}
              >
                Nueva Evaluación
              </Button>
            </Space>
          }
        >
          <Table
            dataSource={evaluationsData?.data || []}
            columns={columns}
            rowKey="id"
            loading={!evaluationsData}
            pagination={{
              total: evaluationsData?.total,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total: ${total} evaluaciones`,
            }}
          />
        </Card>
      </Space>

      {/* Create Evaluation Modal */}
      <Modal
        title="Nueva Evaluación Trade-In"
        visible={isCreateModalVisible}
        onCancel={() => {
          setIsCreateModalVisible(false);
          form.resetFields();
          setFileList([]);
          setCurrentStep(0);
        }}
        footer={null}
        width={800}
      >
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          <Step title="Cliente" icon={<UserOutlined />} />
          <Step title="Información del Colchón" icon={<HomeOutlined />} />
          <Step title="Condición" icon={<FormOutlined />} />
          <Step title="Fotos" icon={<CameraOutlined />} />
        </Steps>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateEvaluation}
        >
          {/* Step 1: Customer */}
          <div style={{ display: currentStep === 0 ? "block" : "none" }}>
            <Form.Item
              name="customer_id"
              label="Cliente"
              rules={[{ required: true, message: "Por favor seleccione un cliente" }]}
            >
              <Select
                placeholder="Seleccionar cliente"
                showSearch
                filterOption={(input, option) =>
                  option?.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {customersData?.data?.map((customer) => (
                  <Option key={customer.id} value={customer.id}>
                    {customer.first_name} {customer.last_name} - {customer.email}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Alert
              message="Requisitos del Programa"
              description="Solo los clientes con suscripción Elite activa pueden participar en el programa Trade-In."
              type="warning"
              showIcon
              style={{ marginTop: 16 }}
            />
          </div>

          {/* Step 2: Mattress Info */}
          <div style={{ display: currentStep === 1 ? "block" : "none" }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="mattress_brand"
                  label="Marca del Colchón"
                  rules={[{ required: true, message: "Por favor ingrese la marca" }]}
                >
                  <Input placeholder="Ej: Sealy, Tempur-Pedic, etc." />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="mattress_model"
                  label="Modelo (opcional)"
                >
                  <Input placeholder="Modelo específico" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="years_of_use"
              label="Años de Uso"
              rules={[{ required: true, message: "Por favor ingrese los años de uso" }]}
            >
              <Slider
                marks={{
                  0: "0",
                  5: "5",
                  10: "10",
                  15: "15",
                  20: "20+",
                }}
                max={20}
                tooltipVisible
              />
            </Form.Item>
          </div>

          {/* Step 3: Condition */}
          <div style={{ display: currentStep === 2 ? "block" : "none" }}>
            <Form.Item
              name="condition_rating"
              label="Condición General"
              rules={[{ required: true, message: "Por favor califique la condición" }]}
            >
              <Rate
                tooltips={["Muy malo", "Malo", "Regular", "Bueno", "Excelente"]}
                style={{ fontSize: 30 }}
              />
            </Form.Item>

            <Divider>Problemas Específicos</Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="has_stains"
                  label="¿Tiene manchas?"
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Radio.Group>
                    <Radio value={false}>No</Radio>
                    <Radio value={true}>Sí</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="has_odors"
                  label="¿Tiene olores?"
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Radio.Group>
                    <Radio value={false}>No</Radio>
                    <Radio value={true}>Sí</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="has_bedbugs"
                  label="¿Tiene chinches?"
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Radio.Group>
                    <Radio value={false}>No</Radio>
                    <Radio value={true}>Sí</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="has_structural_damage"
                  label="¿Tiene daño estructural?"
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Radio.Group>
                    <Radio value={false}>No</Radio>
                    <Radio value={true}>Sí</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>

            <Alert
              message="Nota Importante"
              description="Los colchones con chinches no son elegibles para el programa Trade-In."
              type="error"
              showIcon
              style={{ marginTop: 16 }}
            />
          </div>

          {/* Step 4: Photos */}
          <div style={{ display: currentStep === 3 ? "block" : "none" }}>
            <Form.Item label="Fotos del Colchón">
              <Dragger
                listType="picture-card"
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                beforeUpload={() => false}
                multiple
                accept="image/*"
              >
                <p className="ant-upload-drag-icon">
                  <CameraOutlined />
                </p>
                <p className="ant-upload-text">
                  Haz clic o arrastra las fotos aquí
                </p>
                <p className="ant-upload-hint">
                  Sube fotos claras del colchón desde diferentes ángulos
                </p>
              </Dragger>
            </Form.Item>

            <Alert
              message="Recomendaciones para las fotos"
              description={
                <ul>
                  <li>Vista general del colchón</li>
                  <li>Acercamiento a manchas o daños (si los hay)</li>
                  <li>Etiqueta con información del modelo (si está visible)</li>
                  <li>Mínimo 3 fotos, máximo 10</li>
                </ul>
              }
              type="info"
              showIcon
            />
          </div>

          <Form.Item>
            <Space style={{ float: "right", marginTop: 24 }}>
              {currentStep > 0 && (
                <Button onClick={() => setCurrentStep(currentStep - 1)}>
                  Anterior
                </Button>
              )}
              {currentStep < 3 && (
                <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)}>
                  Siguiente
                </Button>
              )}
              {currentStep === 3 && (
                <Button type="primary" htmlType="submit">
                  Crear Evaluación
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Detalles de la Evaluación"
        visible={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Cerrar
          </Button>,
          selectedEvaluation?.evaluation_status === "approved" && (
            <Button key="print" icon={<PrinterOutlined />}>
              Imprimir
            </Button>
          ),
        ]}
        width={900}
      >
        {renderEvaluationDetails()}
      </Modal>

      {/* Evaluate Modal */}
      <Modal
        title="Evaluar Trade-In"
        visible={isEvaluateModalVisible}
        onCancel={() => {
          setIsEvaluateModalVisible(false);
          evaluationForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={evaluationForm}
          layout="vertical"
          onFinish={handleEvaluate}
        >
          <Alert
            message="Evaluación del Colchón"
            description="Revisa las fotos y la información proporcionada para determinar el valor final del Trade-In."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            name="evaluation_status"
            label="Decisión"
            rules={[{ required: true, message: "Por favor tome una decisión" }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value="approved">Aprobar - Generar cupón de descuento</Radio>
                <Radio value="rejected">Rechazar - No cumple requisitos</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.evaluation_status !== currentValues.evaluation_status
            }
          >
            {({ getFieldValue }) => {
              const status = getFieldValue("evaluation_status");
              
              if (status === "approved") {
                return (
                  <>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="trade_in_value"
                          label="Valor Trade-In Final"
                          rules={[{ required: true, message: "Por favor ingrese el valor" }]}
                        >
                          <InputNumber
                            min={0}
                            max={500}
                            formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="discount_percentage"
                          label="Porcentaje de Descuento"
                          rules={[{ required: true, message: "Por favor ingrese el porcentaje" }]}
                        >
                          <InputNumber
                            min={5}
                            max={25}
                            formatter={(value) => `${value}%`}
                            parser={(value) => value!.replace("%", "")}
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                );
              }
              
              if (status === "rejected") {
                return (
                  <Form.Item
                    name="rejection_reason"
                    label="Razón de Rechazo"
                    rules={[{ required: true, message: "Por favor explique la razón" }]}
                  >
                    <Select placeholder="Seleccionar razón">
                      <Option value="bedbugs">Presencia de chinches</Option>
                      <Option value="severe_damage">Daño estructural severo</Option>
                      <Option value="hygiene">Problemas de higiene graves</Option>
                      <Option value="age">Colchón demasiado antiguo (>15 años)</Option>
                      <Option value="ineligible_brand">Marca no elegible</Option>
                      <Option value="photos_unclear">Fotos no claras o insuficientes</Option>
                      <Option value="other">Otra razón</Option>
                    </Select>
                  </Form.Item>
                );
              }
              
              return null;
            }}
          </Form.Item>

          <Form.Item
            name="evaluator_notes"
            label="Notas del Evaluador"
          >
            <TextArea
              rows={4}
              placeholder="Observaciones adicionales sobre la evaluación..."
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ float: "right" }}>
              <Button onClick={() => setIsEvaluateModalVisible(false)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                Confirmar Evaluación
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};