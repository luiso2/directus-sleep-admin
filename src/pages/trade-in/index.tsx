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
  Input,
  Row,
  Col,
  Statistic,
  Steps,
  Descriptions,
  Badge,
  Timeline,
  Alert,
  Typography
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  DollarOutlined,
  CalendarOutlined,
  BarcodeOutlined,
  SyncOutlined,
  TagOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  GiftOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { DirectusService, ShopifyService, Evaluation, NewCustomer } from '../../services';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;
const { Text } = Typography;

const TradeInManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [customers, setCustomers] = useState<NewCustomer[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    totalCredit: 0
  });

  // Cargar datos
  const fetchData = async () => {
    setLoading(true);
    try {
      const [evalData, custData] = await Promise.all([
        DirectusService.getEvaluations(),
        DirectusService.getCustomers()
      ]);
      
      setEvaluations(evalData);
      setCustomers(custData);
      
      // Calcular estadísticas
      const pendingEvals = evalData.filter(e => e.status === 'pending');
      const approvedEvals = evalData.filter(e => e.status === 'approved');
      const totalCreditAmount = approvedEvals.reduce((sum, e) => sum + (e.credit_approved || 0), 0);
      
      setStats({
        total: evalData.length,
        pending: pendingEvals.length,
        approved: approvedEvals.length,
        totalCredit: totalCreditAmount
      });
    } catch (error: any) {
      message.error('Error al cargar evaluaciones: ' + error.message);
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
      case 'pending': return 'processing';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'redeemed': return 'default';
      default: return 'default';
    }
  };

  // Obtener información del cliente
  const getCustomerInfo = (customerId: string) => {
    const customer = customers.find(c => c.id?.toString() === customerId);
    return customer || null;
  };

  // Calcular crédito basado en condición
  const calculateCredit = (estimatedValue: number, condition: string) => {
    const percentages = {
      'excellent': 0.8,
      'good': 0.6,
      'fair': 0.4,
      'poor': 0.2
    };
    return Math.round(estimatedValue * (percentages[condition as keyof typeof percentages] || 0.5));
  };

  // Manejar formulario
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const creditAmount = calculateCredit(values.estimated_value, values.condition);
      const evaluationData: Partial<Evaluation> = {
        customer_id: values.customer_id,
        mattress: {
          brand: values.mattress_brand,
          model: values.mattress_model,
          age: values.mattress_age,
          condition: values.condition,
          size: values.mattress_size
        },
        credit_approved: creditAmount,
        status: 'pending',
        customer_info: values.notes ? { notes: values.notes } : undefined,
        expires_at: dayjs().add(90, 'days').toISOString()
      };

      if (editingEvaluation?.id) {
        await DirectusService.updateEvaluation(editingEvaluation.id, evaluationData);
        message.success('Evaluación actualizada exitosamente');
      } else {
        await DirectusService.createEvaluation(evaluationData);
        message.success('Evaluación creada exitosamente');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingEvaluation(null);
      fetchData();
    } catch (error: any) {
      message.error('Error al guardar evaluación: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Aprobar evaluación
  const handleApprove = async (evaluation: Evaluation) => {
    Modal.confirm({
      title: 'Aprobar Evaluación',
      content: (
        <div>
          <p>¿Está seguro de aprobar esta evaluación?</p>
          <p>Se generará un cupón de <strong>${evaluation.credit_approved}</strong> válido por 90 días.</p>
        </div>
      ),
      onOk: async () => {
        try {
          setLoading(true);
          
          // Generar cupón en Shopify
          const coupon = await ShopifyService.createTradeInCoupon(
            evaluation.id!,
            evaluation.customer_id,
            evaluation.credit_approved || 0
          );
          
          message.success('Evaluación aprobada y cupón generado exitosamente');
          fetchData();
        } catch (error: any) {
          message.error('Error al aprobar evaluación: ' + error.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Rechazar evaluación
  const handleReject = async (evaluation: Evaluation) => {
    Modal.confirm({
      title: 'Rechazar Evaluación',
      content: '¿Está seguro de rechazar esta evaluación?',
      onOk: async () => {
        try {
          setLoading(true);
          await DirectusService.updateEvaluation(evaluation.id!, {
            status: 'rejected'
          });
          message.success('Evaluación rechazada');
          fetchData();
        } catch (error: any) {
          message.error('Error al rechazar evaluación: ' + error.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Ver detalles
  const handleViewDetails = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setDetailsModalVisible(true);
  };

  // Copiar código de cupón
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    message.success('Código copiado al portapapeles');
  };

  // Columnas de la tabla
  const columns: ColumnsType<Evaluation> = [
    {
      title: 'Cliente',
      key: 'customer',
      render: (_, record) => {
        const customer = getCustomerInfo(record.customer_id);
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
      title: 'Colchón',
      key: 'mattress',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.mattress?.brand || 'Sin marca'}</div>
          {record.mattress?.model && (
            <div style={{ fontSize: '12px', color: '#666' }}>{record.mattress.model}</div>
          )}
        </div>
      )
    },
    {
      title: 'Condición',
      key: 'condition',
      render: (_, record) => {
        const condition = record.mattress?.condition;
        const colors = {
          'excellent': 'green',
          'good': 'blue',
          'fair': 'orange',
          'poor': 'red'
        };
        const labels = {
          'excellent': 'Excelente',
          'good': 'Buena',
          'fair': 'Regular',
          'poor': 'Mala'
        };
        return condition ? (
          <Tag color={colors[condition as keyof typeof colors]}>
            {labels[condition as keyof typeof labels]}
          </Tag>
        ) : '-';
      }
    },
    {
      title: 'Crédito Aprobado',
      dataIndex: 'credit_approved',
      key: 'credit_approved',
      render: (value) => (
        <Tag color="green" style={{ fontSize: '14px' }}>
          ${value || 0}
        </Tag>
      ),
      sorter: (a, b) => (a.credit_approved || 0) - (b.credit_approved || 0)
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const labels = {
          'pending': 'Pendiente',
          'approved': 'Aprobada',
          'rejected': 'Rechazada',
          'redeemed': 'Canjeada'
        };
        return (
          <Badge status={getStatusColor(status) as any} text={labels[status as keyof typeof labels]} />
        );
      },
      filters: [
        { text: 'Pendiente', value: 'pending' },
        { text: 'Aprobada', value: 'approved' },
        { text: 'Rechazada', value: 'rejected' },
        { text: 'Canjeada', value: 'redeemed' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Cupón',
      dataIndex: 'coupon_code',
      key: 'coupon_code',
      render: (code) => code ? (
        <Space>
          <Tag icon={<BarcodeOutlined />} color="purple">{code}</Tag>
          <Button
            type="link"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => handleCopyCode(code)}
          />
        </Space>
      ) : '-'
    },
    {
      title: 'Fecha Evaluación',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix()
    },
    {
      title: 'Vencimiento',
      dataIndex: 'expires_at',
      key: 'expires_at',
      render: (date, record) => {
        if (record.status !== 'approved' || !date) return '-';
        const isExpired = dayjs().isAfter(dayjs(date));
        return (
          <Tag color={isExpired ? 'red' : 'green'} icon={<CalendarOutlined />}>
            {dayjs(date).format('DD/MM/YYYY')}
          </Tag>
        );
      }
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Ver detalles">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          
          {record.status === 'pending' && (
            <>
              <Tooltip title="Aprobar">
                <Button
                  type="link"
                  icon={<CheckOutlined />}
                  onClick={() => handleApprove(record)}
                  style={{ color: '#52c41a' }}
                />
              </Tooltip>
              <Tooltip title="Rechazar">
                <Button
                  type="link"
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => handleReject(record)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Estadísticas */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Evaluaciones"
              value={stats.total}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pendientes"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Aprobadas"
              value={stats.approved}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Crédito Total"
              value={stats.totalCredit}
              precision={2}
              valueStyle={{ color: '#1890ff' }}
              prefix="$"
            />
          </Card>
        </Col>
      </Row>

      {/* Información del programa */}
      <Alert
        message="Programa Trade & Sleep"
        description="Los clientes pueden recibir crédito por su colchón usado para la compra de uno nuevo. El crédito es válido por 90 días."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* Tabla */}
      <Card
        title="Gestión de Evaluaciones Trade-In"
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
                setEditingEvaluation(null);
                form.resetFields();
                setModalVisible(true);
              }}
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

      {/* Modal de formulario */}
      <Modal
        title={editingEvaluation ? 'Editar Evaluación' : 'Nueva Evaluación Trade-In'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingEvaluation(null);
        }}
        confirmLoading={loading}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            condition: 'good',
            mattress_size: 'queen'
          }}
          onValuesChange={(changedValues, allValues) => {
            if (changedValues.estimated_value !== undefined || changedValues.condition !== undefined) {
              const credit = calculateCredit(
                allValues.estimated_value || 0,
                allValues.condition || 'good'
              );
              form.setFieldValue('credit_amount', credit);
            }
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

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="mattress_brand"
                label="Marca del Colchón"
                rules={[{ required: true, message: 'Por favor ingrese la marca' }]}
              >
                <Input placeholder="Ej: Tempur-Pedic, Casper, etc." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="mattress_model"
                label="Modelo (opcional)"
              >
                <Input placeholder="Ej: Cloud Supreme, Wave Hybrid, etc." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="mattress_size"
                label="Tamaño"
                rules={[{ required: true, message: 'Por favor seleccione el tamaño' }]}
              >
                <Select>
                  <Option value="single">Individual</Option>
                  <Option value="double">Matrimonial</Option>
                  <Option value="queen">Queen</Option>
                  <Option value="king">King</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="mattress_age"
                label="Años de Uso"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={20}
                  placeholder="Años"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="condition"
                label="Condición"
                rules={[{ required: true, message: 'Por favor seleccione la condición' }]}
              >
                <Select>
                  <Option value="excellent">Excelente (80% crédito)</Option>
                  <Option value="good">Buena (60% crédito)</Option>
                  <Option value="fair">Regular (40% crédito)</Option>
                  <Option value="poor">Mala (20% crédito)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="estimated_value"
                label="Valor Estimado Original"
                rules={[{ required: true, message: 'Por favor ingrese el valor estimado' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  prefix="$"
                  min={0}
                  max={10000}
                  placeholder="Valor original del colchón"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="credit_amount"
                label="Crédito Calculado"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  prefix="$"
                  disabled
                  value={form.getFieldValue('credit_amount')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Notas (opcional)"
          >
            <TextArea
              rows={3}
              placeholder="Notas adicionales sobre la evaluación..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de detalles */}
      <Modal
        title="Detalles de Evaluación Trade-In"
        open={detailsModalVisible}
        onCancel={() => {
          setDetailsModalVisible(false);
          setSelectedEvaluation(null);
        }}
        footer={null}
        width={800}
      >
        {selectedEvaluation && (
          <div>
            {/* Timeline del proceso */}
            <Card title="Estado del Proceso" style={{ marginBottom: 16 }}>
              <Steps
                current={
                  selectedEvaluation.status === 'pending' ? 0 :
                  selectedEvaluation.status === 'approved' ? 1 :
                  selectedEvaluation.status === 'rejected' ? -1 :
                  2
                }
                status={selectedEvaluation.status === 'rejected' ? 'error' : 'process'}
              >
                <Step title="Evaluación" description="Colchón evaluado" />
                <Step title="Aprobación" description="Crédito aprobado" />
                <Step title="Cupón Generado" description="Listo para usar" />
                <Step title="Canjeado" description="Crédito utilizado" />
              </Steps>
            </Card>

            {/* Información del cliente */}
            <Card title="Información del Cliente" style={{ marginBottom: 16 }}>
              <Descriptions column={2}>
                <Descriptions.Item label="Nombre">
                  {getCustomerInfo(selectedEvaluation.customer_id)?.first_name} {getCustomerInfo(selectedEvaluation.customer_id)?.last_name}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {getCustomerInfo(selectedEvaluation.customer_id)?.email}
                </Descriptions.Item>
                <Descriptions.Item label="Teléfono">
                  {getCustomerInfo(selectedEvaluation.customer_id)?.phone || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Tipo">
                  <Tag>{getCustomerInfo(selectedEvaluation.customer_id)?.type || 'Regular'}</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Detalles del colchón */}
            <Card title="Detalles del Colchón" style={{ marginBottom: 16 }}>
              <Descriptions column={2}>
                <Descriptions.Item label="Marca">
                  {selectedEvaluation.mattress?.brand || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Modelo">
                  {selectedEvaluation.mattress?.model || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Tamaño">
                  {selectedEvaluation.mattress?.size || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Años de Uso">
                  {selectedEvaluation.mattress?.age || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Condición">
                  <Tag color={
                    selectedEvaluation.mattress?.condition === 'excellent' ? 'green' :
                    selectedEvaluation.mattress?.condition === 'good' ? 'blue' :
                    selectedEvaluation.mattress?.condition === 'fair' ? 'orange' : 'red'
                  }>
                    {selectedEvaluation.mattress?.condition || '-'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Crédito Aprobado">
                  <Tag color="green" style={{ fontSize: '16px' }}>
                    ${selectedEvaluation.credit_approved || 0}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Información del cupón */}
            {selectedEvaluation.coupon_code && (
              <Card title="Información del Cupón" style={{ marginBottom: 16 }}>
                <Descriptions column={1}>
                  <Descriptions.Item label="Código de Cupón">
                    <Space>
                      <Tag color="purple" style={{ fontSize: '16px' }}>
                        {selectedEvaluation.coupon_code}
                      </Tag>
                      <Button
                        type="link"
                        icon={<CopyOutlined />}
                        onClick={() => handleCopyCode(selectedEvaluation.coupon_code!)}
                      >
                        Copiar
                      </Button>
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Válido hasta">
                    <Tag color={dayjs().isAfter(dayjs(selectedEvaluation.expires_at)) ? 'red' : 'green'}>
                      {dayjs(selectedEvaluation.expires_at).format('DD/MM/YYYY')}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Estado">
                    <Badge status={getStatusColor(selectedEvaluation.status) as any} text={
                      selectedEvaluation.status === 'redeemed' ? 'Canjeado' : 'Disponible'
                    } />
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {/* Notas */}
            {selectedEvaluation.customer_info?.notes && (
              <Card title="Notas">
                <p>{selectedEvaluation.customer_info.notes}</p>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TradeInManagement;
