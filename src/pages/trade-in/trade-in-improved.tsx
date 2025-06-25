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
  InputNumber,
  message,
  Row,
  Col,
  Statistic,
  Alert,
  Descriptions,
  Timeline,
  Steps,
  Upload,
  Image,
  Drawer,
  Badge,
  Tooltip,
  Popconfirm,
  Progress
} from 'antd';
import {
  PlusOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  GiftOutlined,
  DollarOutlined,
  CalendarOutlined,
  CameraOutlined,
  FileImageOutlined,
  CopyOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import moment from 'moment';
import DirectusService from '../../services/directus-service-improved';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

interface EvaluationRecord {
  id: string;
  customer_id: any;
  mattress_brand: string;
  mattress_model: string;
  purchase_date?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  approved_credit: number;
  status: 'pending' | 'approved' | 'rejected' | 'used';
  coupon_code?: string;
  shopify_price_rule_id?: string;
  evaluation_date: string;
  expiry_date: string;
  notes?: string;
  photos?: string[];
}

const conditionCreditGuide = {
  excellent: { min: 300, max: 500, description: 'Como nuevo, sin manchas ni daños' },
  good: { min: 200, max: 300, description: 'Uso mínimo, manchas menores' },
  fair: { min: 100, max: 200, description: 'Uso moderado, algunas manchas' },
  poor: { min: 50, max: 100, description: 'Uso extenso, manchas significativas' }
};

export const TradeInImproved: React.FC = () => {
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationRecord | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();

  // Metrics states
  const [totalEvaluations, setTotalEvaluations] = useState(0);
  const [pendingEvaluations, setPendingEvaluations] = useState(0);
  const [approvedEvaluations, setApprovedEvaluations] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);

  useEffect(() => {
    fetchEvaluations();
    fetchCustomers();
  }, []);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const data = await DirectusService.getEvaluations({
        sort: ['-evaluation_date']
      });
      
      setEvaluations(data);
      
      // Calculate metrics
      setTotalEvaluations(data.length);
      setPendingEvaluations(data.filter((e: any) => e.status === 'pending').length);
      const approved = data.filter((e: any) => e.status === 'approved');
      setApprovedEvaluations(approved.length);
      setTotalCredit(approved.reduce((sum: number, e: any) => sum + e.approved_credit, 0));
    } catch (error) {
      message.error('Error al cargar evaluaciones');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      // Only fetch customers with Elite subscription
      const data = await DirectusService.getCustomers({ 
        filter: {
          _and: [
            {
              subscriptions: {
                plan_type: { _eq: 'elite' },
                status: { _eq: 'active' }
              }
            }
          ]
        }
      });
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleCreateEvaluation = async (values: any) => {
    try {
      const evaluationData = {
        customer_id: values.customer_id,
        mattress_brand: values.mattress_brand,
        mattress_model: values.mattress_model,
        purchase_date: values.purchase_date?.format('YYYY-MM-DD'),
        condition: values.condition,
        approved_credit: 0, // Will be set when approved
        status: 'pending',
        evaluation_date: new Date().toISOString(),
        expiry_date: moment().add(90, 'days').toISOString(), // 90 days validity
        notes: values.notes
      };

      await DirectusService.createEvaluation(evaluationData);
      
      message.success('Evaluación creada exitosamente');
      setIsModalOpen(false);
      form.resetFields();
      setCurrentStep(0);
      setFileList([]);
      fetchEvaluations();
    } catch (error) {
      message.error('Error al crear evaluación');
      console.error(error);
    }
  };

  const handleApproveEvaluation = async (record: EvaluationRecord, creditAmount: number) => {
    try {
      const approved = await DirectusService.approveEvaluation(record.id, creditAmount);
      
      // TODO: Create Shopify discount
      // const shopifyDiscount = await ShopifyService.createTradeInDiscount({
      //   code: approved.coupon_code,
      //   amount: creditAmount,
      //   expiryDate: approved.expiry_date
      // });
      
      message.success(`Evaluación aprobada. Cupón: ${approved.coupon_code}`);
      fetchEvaluations();
    } catch (error) {
      message.error('Error al aprobar evaluación');
      console.error(error);
    }
  };

  const handleRejectEvaluation = async (id: string, reason: string) => {
    try {
      await DirectusService.updateEvaluation(id, {
        status: 'rejected',
        notes: reason
      });
      
      message.success('Evaluación rechazada');
      fetchEvaluations();
    } catch (error) {
      message.error('Error al rechazar evaluación');
      console.error(error);
    }
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    message.success('Código copiado al portapapeles');
  };

  const viewEvaluationDetails = (record: EvaluationRecord) => {
    setSelectedEvaluation(record);
    setIsDrawerOpen(true);
  };

  const columns: ColumnsType<EvaluationRecord> = [
    {
      title: 'Cliente',
      dataIndex: ['customer_id', 'name'],
      key: 'customer',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <span>{record.customer_id?.name || 'N/A'}</span>
          <Tag>{record.customer_id?.email}</Tag>
        </Space>
      )
    },
    {
      title: 'Colchón',
      key: 'mattress',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <strong>{record.mattress_brand}</strong>
          <span>{record.mattress_model}</span>
        </Space>
      )
    },
    {
      title: 'Condición',
      dataIndex: 'condition',
      key: 'condition',
      render: (condition: string) => {
        const colors = {
          excellent: 'green',
          good: 'blue',
          fair: 'orange',
          poor: 'red'
        };
        const labels = {
          excellent: 'Excelente',
          good: 'Buena',
          fair: 'Regular',
          poor: 'Pobre'
        };
        return <Tag color={colors[condition as keyof typeof colors]}>
          {labels[condition as keyof typeof labels]}
        </Tag>;
      }
    },
    {
      title: 'Crédito Aprobado',
      dataIndex: 'approved_credit',
      key: 'approved_credit',
      sorter: true,
      render: (credit: number, record) => {
        if (record.status === 'pending') {
          const guide = conditionCreditGuide[record.condition];
          return (
            <Tooltip title={`Rango sugerido: $${guide.min} - $${guide.max}`}>
              <span style={{ color: '#999' }}>Por definir</span>
            </Tooltip>
          );
        }
        return <strong>${credit}</strong>;
      }
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Pendiente', value: 'pending' },
        { text: 'Aprobada', value: 'approved' },
        { text: 'Rechazada', value: 'rejected' },
        { text: 'Usada', value: 'used' }
      ],
      render: (status: string) => {
        const statusConfig = {
          pending: { icon: <ClockCircleOutlined />, color: 'warning', text: 'Pendiente' },
          approved: { icon: <CheckCircleOutlined />, color: 'success', text: 'Aprobada' },
          rejected: { icon: <CloseCircleOutlined />, color: 'error', text: 'Rechazada' },
          used: { icon: <ShoppingCartOutlined />, color: 'default', text: 'Usada' }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Badge status={config.color as any} text={config.text} />;
      }
    },
    {
      title: 'Cupón',
      dataIndex: 'coupon_code',
      key: 'coupon_code',
      render: (code: string) => {
        if (!code) return '-';
        return (
          <Space>
            <Tag color="purple">{code}</Tag>
            <Button 
              icon={<CopyOutlined />} 
              size="small"
              onClick={() => copyCouponCode(code)}
            />
          </Space>
        );
      }
    },
    {
      title: 'Fecha Evaluación',
      dataIndex: 'evaluation_date',
      key: 'evaluation_date',
      sorter: true,
      render: (date: string) => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Vencimiento',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      render: (date: string, record) => {
        if (record.status !== 'approved') return '-';
        const daysLeft = moment(date).diff(moment(), 'days');
        const isExpired = daysLeft < 0;
        
        return (
          <Tooltip title={moment(date).format('DD/MM/YYYY')}>
            <Tag color={isExpired ? 'red' : daysLeft < 30 ? 'orange' : 'green'}>
              {isExpired ? 'Expirado' : `${daysLeft} días`}
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
          <Button 
            icon={<FileImageOutlined />} 
            size="small"
            onClick={() => viewEvaluationDetails(record)}
          >
            Ver
          </Button>
          
          {record.status === 'pending' && (
            <>
              <Popconfirm
                title="Aprobar evaluación"
                description={
                  <div style={{ width: 300 }}>
                    <p>Ingrese el monto de crédito aprobado:</p>
                    <InputNumber
                      id={`credit-${record.id}`}
                      prefix="$"
                      min={50}
                      max={500}
                      defaultValue={conditionCreditGuide[record.condition].min}
                      style={{ width: '100%' }}
                    />
                    <Alert
                      message={`Rango sugerido: $${conditionCreditGuide[record.condition].min} - $${conditionCreditGuide[record.condition].max}`}
                      type="info"
                      style={{ marginTop: 8 }}
                    />
                  </div>
                }
                onConfirm={() => {
                  const input = document.getElementById(`credit-${record.id}`) as HTMLInputElement;
                  const amount = parseFloat(input.value);
                  handleApproveEvaluation(record, amount);
                }}
                okText="Aprobar"
                cancelText="Cancelar"
              >
                <Button type="primary" size="small" icon={<CheckCircleOutlined />}>
                  Aprobar
                </Button>
              </Popconfirm>
              
              <Popconfirm
                title="Rechazar evaluación"
                description="¿Está seguro de rechazar esta evaluación?"
                onConfirm={() => handleRejectEvaluation(record.id, 'No cumple con los criterios')}
              >
                <Button danger size="small" icon={<CloseCircleOutlined />}>
                  Rechazar
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      )
    }
  ];

  const modalSteps = [
    {
      title: 'Cliente',
      content: (
        <>
          <Alert
            message="Programa Trade & Sleep"
            description="Solo los clientes con Plan Elite pueden participar en el programa Trade-In"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Form.Item
            name="customer_id"
            label="Seleccionar Cliente Elite"
            rules={[{ required: true, message: 'Seleccione un cliente' }]}
          >
            <Select
              showSearch
              placeholder="Buscar cliente con Plan Elite..."
              optionFilterProp="children"
              notFoundContent={customers.length === 0 ? "No hay clientes con Plan Elite" : "No se encontraron clientes"}
            >
              {customers.map(customer => (
                <Option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.email}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </>
      )
    },
    {
      title: 'Información del Colchón',
      content: (
        <>
          <Form.Item
            name="mattress_brand"
            label="Marca del Colchón"
            rules={[{ required: true, message: 'Ingrese la marca' }]}
          >
            <Input placeholder="Ej: Sealy, Serta, Tempur-Pedic" />
          </Form.Item>

          <Form.Item
            name="mattress_model"
            label="Modelo"
            rules={[{ required: true, message: 'Ingrese el modelo' }]}
          >
            <Input placeholder="Ej: Posturepedic Plus" />
          </Form.Item>

          <Form.Item
            name="purchase_date"
            label="Fecha de Compra (aproximada)"
          >
            <DatePicker 
              style={{ width: '100%' }}
              placeholder="Seleccione fecha"
              disabledDate={(current) => current && current > moment()}
            />
          </Form.Item>
        </>
      )
    },
    {
      title: 'Evaluación de Condición',
      content: (
        <>
          <Form.Item
            name="condition"
            label="Condición del Colchón"
            rules={[{ required: true, message: 'Seleccione la condición' }]}
          >
            <Select onChange={(value) => {
              const guide = conditionCreditGuide[value as keyof typeof conditionCreditGuide];
              message.info(`Crédito sugerido: $${guide.min} - $${guide.max}`);
            }}>
              <Option value="excellent">
                <Space>
                  <Tag color="green">Excelente</Tag>
                  <span>Como nuevo, sin manchas ($300-$500)</span>
                </Space>
              </Option>
              <Option value="good">
                <Space>
                  <Tag color="blue">Buena</Tag>
                  <span>Uso mínimo, manchas menores ($200-$300)</span>
                </Space>
              </Option>
              <Option value="fair">
                <Space>
                  <Tag color="orange">Regular</Tag>
                  <span>Uso moderado, algunas manchas ($100-$200)</span>
                </Space>
              </Option>
              <Option value="poor">
                <Space>
                  <Tag color="red">Pobre</Tag>
                  <span>Uso extenso, manchas significativas ($50-$100)</span>
                </Space>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="photos"
            label="Fotos del Colchón"
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
            >
              {fileList.length >= 4 ? null : (
                <div>
                  <CameraOutlined />
                  <div style={{ marginTop: 8 }}>Subir Foto</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notas de Evaluación"
          >
            <TextArea 
              rows={3} 
              placeholder="Describa el estado del colchón, manchas, daños, etc."
            />
          </Form.Item>
        </>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Metrics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Evaluaciones"
              value={totalEvaluations}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Pendientes"
              value={pendingEvaluations}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Aprobadas"
              value={approvedEvaluations}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Crédito Total"
              value={totalCredit}
              prefix="$"
              precision={0}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Info Alert */}
      <Alert
        message="Programa Trade & Sleep"
        description="Los clientes pueden recibir crédito por su colchón usado para la compra de uno nuevo. El crédito es válido por 90 días y solo está disponible para clientes con Plan Elite."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        action={
          <Space direction="vertical">
            <Button size="small" type="primary">Ver Guía de Evaluación</Button>
          </Space>
        }
      />

      {/* Main Card */}
      <Card
        title="Gestión de Evaluaciones Trade-In"
        extra={
          <Space>
            <Button 
              icon={<SyncOutlined />} 
              onClick={fetchEvaluations}
              loading={loading}
            >
              Actualizar
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
            >
              Nueva Evaluación
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={evaluations}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} evaluaciones`
          }}
        />
      </Card>

      {/* Create Evaluation Modal */}
      <Modal
        title="Nueva Evaluación Trade-In"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setCurrentStep(0);
          setFileList([]);
        }}
        footer={null}
        width={700}
      >
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          {modalSteps.map(item => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateEvaluation}
        >
          <div style={{ minHeight: 300 }}>
            {modalSteps[currentStep].content}
          </div>

          <Space style={{ marginTop: 24 }}>
            {currentStep > 0 && (
              <Button onClick={() => setCurrentStep(currentStep - 1)}>
                Anterior
              </Button>
            )}
            {currentStep < modalSteps.length - 1 && (
              <Button type="primary" onClick={() => {
                form.validateFields().then(() => {
                  setCurrentStep(currentStep + 1);
                });
              }}>
                Siguiente
              </Button>
            )}
            {currentStep === modalSteps.length - 1 && (
              <Button type="primary" htmlType="submit" icon={<CheckCircleOutlined />}>
                Crear Evaluación
              </Button>
            )}
            <Button onClick={() => {
              setIsModalOpen(false);
              form.resetFields();
              setCurrentStep(0);
              setFileList([]);
            }}>
              Cancelar
            </Button>
          </Space>
        </Form>
      </Modal>

      {/* Evaluation Details Drawer */}
      <Drawer
        title="Detalles de Evaluación Trade-In"
        placement="right"
        width={600}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
      >
        {selectedEvaluation && (
          <>
            <Descriptions column={1} bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Cliente">
                {selectedEvaluation.customer_id?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedEvaluation.customer_id?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Colchón">
                {selectedEvaluation.mattress_brand} - {selectedEvaluation.mattress_model}
              </Descriptions.Item>
              {selectedEvaluation.purchase_date && (
                <Descriptions.Item label="Fecha de Compra">
                  {moment(selectedEvaluation.purchase_date).format('DD/MM/YYYY')}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Condición">
                <Tag color={
                  selectedEvaluation.condition === 'excellent' ? 'green' :
                  selectedEvaluation.condition === 'good' ? 'blue' :
                  selectedEvaluation.condition === 'fair' ? 'orange' : 'red'
                }>
                  {selectedEvaluation.condition.charAt(0).toUpperCase() + selectedEvaluation.condition.slice(1)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Badge 
                  status={
                    selectedEvaluation.status === 'approved' ? 'success' :
                    selectedEvaluation.status === 'pending' ? 'warning' :
                    selectedEvaluation.status === 'rejected' ? 'error' : 'default'
                  } 
                  text={selectedEvaluation.status}
                />
              </Descriptions.Item>
              {selectedEvaluation.approved_credit > 0 && (
                <Descriptions.Item label="Crédito Aprobado">
                  <strong style={{ fontSize: 18 }}>${selectedEvaluation.approved_credit}</strong>
                </Descriptions.Item>
              )}
              {selectedEvaluation.coupon_code && (
                <Descriptions.Item label="Código de Cupón">
                  <Space>
                    <Tag color="purple" style={{ fontSize: 16 }}>
                      {selectedEvaluation.coupon_code}
                    </Tag>
                    <Button 
                      icon={<CopyOutlined />} 
                      size="small"
                      onClick={() => copyCouponCode(selectedEvaluation.coupon_code!)}
                    >
                      Copiar
                    </Button>
                  </Space>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Fecha de Evaluación">
                {moment(selectedEvaluation.evaluation_date).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Fecha de Vencimiento">
                {moment(selectedEvaluation.expiry_date).format('DD/MM/YYYY')}
                {selectedEvaluation.status === 'approved' && (
                  <Progress 
                    percent={Math.max(0, Math.min(100, 
                      (90 - moment(selectedEvaluation.expiry_date).diff(moment(), 'days')) / 90 * 100
                    ))}
                    size="small"
                    style={{ marginTop: 8 }}
                  />
                )}
              </Descriptions.Item>
            </Descriptions>

            {selectedEvaluation.notes && (
              <Card title="Notas de Evaluación" size="small" style={{ marginBottom: 16 }}>
                <p>{selectedEvaluation.notes}</p>
              </Card>
            )}

            {selectedEvaluation.photos && selectedEvaluation.photos.length > 0 && (
              <Card title="Fotos del Colchón" size="small">
                <Image.PreviewGroup>
                  <Space wrap>
                    {selectedEvaluation.photos.map((photo, index) => (
                      <Image
                        key={index}
                        width={150}
                        src={photo}
                        placeholder={
                          <div style={{ 
                            width: 150, 
                            height: 150, 
                            background: '#f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <FileImageOutlined style={{ fontSize: 32, color: '#999' }} />
                          </div>
                        }
                      />
                    ))}
                  </Space>
                </Image.PreviewGroup>
              </Card>
            )}

            {selectedEvaluation.status === 'approved' && (
              <Timeline style={{ marginTop: 24 }}>
                <Timeline.Item color="green">
                  Evaluación creada - {moment(selectedEvaluation.evaluation_date).format('DD/MM/YYYY')}
                </Timeline.Item>
                <Timeline.Item color="green">
                  Evaluación aprobada - Crédito: ${selectedEvaluation.approved_credit}
                </Timeline.Item>
                <Timeline.Item color="blue">
                  Cupón generado: {selectedEvaluation.coupon_code}
                </Timeline.Item>
                {selectedEvaluation.status === 'used' ? (
                  <Timeline.Item color="green">
                    Cupón utilizado
                  </Timeline.Item>
                ) : (
                  <Timeline.Item color="gray">
                    Vence el {moment(selectedEvaluation.expiry_date).format('DD/MM/YYYY')}
                  </Timeline.Item>
                )}
              </Timeline>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
};

export default TradeInImproved;
