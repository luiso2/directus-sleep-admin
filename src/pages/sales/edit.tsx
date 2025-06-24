import React, { useState, useEffect } from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, DatePicker, Card, Row, Col, Divider, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import type { Sale, Customer } from "../../types/directus";
import { ShoppingCartOutlined, UserOutlined, DollarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Title, Text } = Typography;

export const SaleEdit: React.FC = () => {
  const navigate = useNavigate();
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);

  const { formProps, saveButtonProps, form, queryResult } = useForm<Sale>({
    resource: "sales",
    redirect: "show",
    onMutationSuccess: () => {
      navigate("/sales");
    },
  });

  // Selector de clientes
  const { selectProps: customerSelectProps } = useSelect<Customer>({
    resource: "customers",
    optionLabel: (item) => `${item.first_name} ${item.last_name} - ${item.email}`,
    optionValue: "id",
    defaultValue: queryResult?.data?.data?.customer_id,
  });

  // Actualizar estados cuando se cargan los datos
  useEffect(() => {
    if (queryResult?.data?.data) {
      const data = queryResult.data.data;
      setSubtotal(data.subtotal || 0);
      setTax(data.tax || 0);
      setDiscount(data.discount || 0);
      setTotal(data.total || 0);
    }
  }, [queryResult?.data?.data]);

  // Calcular totales cuando cambian los valores
  useEffect(() => {
    const taxAmount = subtotal * 0.16; // 16% IVA
    const totalAmount = subtotal + taxAmount - discount;
    
    setTax(taxAmount);
    setTotal(totalAmount);
    
    form.setFieldsValue({
      tax: taxAmount,
      total: totalAmount,
    });
  }, [subtotal, discount, form]);

  const handleSubtotalChange = (value: number | null) => {
    setSubtotal(value || 0);
    form.setFieldsValue({ subtotal: value || 0 });
  };

  const handleDiscountChange = (value: number | null) => {
    setDiscount(value || 0);
    form.setFieldsValue({ discount: value || 0 });
  };

  // Convertir fecha a dayjs para el DatePicker
  if (formProps.initialValues?.sale_date) {
    formProps.initialValues.sale_date = dayjs(formProps.initialValues.sale_date);
  }

  return (
    <Edit saveButtonProps={saveButtonProps} title="Editar Venta">
      <Form {...formProps} layout="vertical">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title={<><ShoppingCartOutlined /> Información de la Venta</>} bordered={false}>
              <Form.Item
                label="Número de Venta"
                name="sale_number"
                rules={[{ required: true, message: "El número de venta es requerido" }]}
              >
                <Input prefix={<ShoppingCartOutlined />} disabled />
              </Form.Item>

              <Form.Item
                label="Cliente"
                name="customer_id"
                rules={[{ required: true, message: "Seleccione un cliente" }]}
              >
                <Select
                  {...customerSelectProps}
                  showSearch
                  placeholder="Buscar y seleccionar cliente"
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  suffixIcon={<UserOutlined />}
                />
              </Form.Item>

              <Form.Item
                label="Fecha de Venta"
                name="sale_date"
                rules={[{ required: true, message: "La fecha es requerida" }]}
              >
                <DatePicker 
                  style={{ width: "100%" }} 
                  format="DD/MM/YYYY"
                  showTime={false}
                />
              </Form.Item>

              <Form.Item
                label="Estado de la Venta"
                name="status"
                rules={[{ required: true, message: "El estado es requerido" }]}
              >
                <Select>
                  <Select.Option value="pending">Pendiente</Select.Option>
                  <Select.Option value="confirmed">Confirmada</Select.Option>
                  <Select.Option value="delivered">Entregada</Select.Option>
                  <Select.Option value="cancelled">Cancelada</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Método de Pago"
                name="payment_method"
                rules={[{ required: true, message: "Seleccione un método de pago" }]}
              >
                <Select placeholder="Seleccione método de pago">
                  <Select.Option value="cash">Efectivo</Select.Option>
                  <Select.Option value="credit_card">Tarjeta de Crédito</Select.Option>
                  <Select.Option value="debit_card">Tarjeta de Débito</Select.Option>
                  <Select.Option value="transfer">Transferencia</Select.Option>
                  <Select.Option value="financing">Financiamiento</Select.Option>
                </Select>
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title={<><DollarOutlined /> Detalles Financieros</>} bordered={false}>
              <Form.Item
                label="Subtotal (MXN)"
                name="subtotal"
                rules={[{ required: true, message: "El subtotal es requerido" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  step={100}
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0}
                  placeholder="0.00"
                  onChange={handleSubtotalChange}
                />
              </Form.Item>

              <Form.Item
                label="IVA (16%)"
                name="tax"
              >
                <InputNumber
                  style={{ width: "100%" }}
                  value={tax}
                  disabled
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0}
                />
              </Form.Item>

              <Form.Item
                label="Descuento (MXN)"
                name="discount"
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  step={100}
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0}
                  placeholder="0.00"
                  onChange={handleDiscountChange}
                />
              </Form.Item>

              <Divider />

              <Form.Item
                label={
                  <Title level={4} style={{ margin: 0 }}>
                    Total (MXN)
                  </Title>
                }
                name="total"
              >
                <InputNumber
                  style={{ width: "100%", fontSize: "24px", fontWeight: "bold" }}
                  value={total}
                  disabled
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0}
                />
              </Form.Item>

              <Card 
                type="inner" 
                style={{ backgroundColor: "#f0f2f5", marginTop: 16 }}
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Row justify="space-between">
                    <Col><Text>Subtotal:</Text></Col>
                    <Col><Text strong>{new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(subtotal)}</Text></Col>
                  </Row>
                  <Row justify="space-between">
                    <Col><Text>IVA (16%):</Text></Col>
                    <Col><Text strong>{new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(tax)}</Text></Col>
                  </Row>
                  <Row justify="space-between">
                    <Col><Text>Descuento:</Text></Col>
                    <Col><Text strong style={{ color: "#ff4d4f" }}>- {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(discount)}</Text></Col>
                  </Row>
                  <Divider style={{ margin: "8px 0" }} />
                  <Row justify="space-between">
                    <Col><Title level={5} style={{ margin: 0 }}>Total:</Title></Col>
                    <Col><Title level={5} style={{ margin: 0, color: "#52c41a" }}>{new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(total)}</Title></Col>
                  </Row>
                </Space>
              </Card>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <Card title="Notas y Observaciones" bordered={false}>
              <Form.Item
                label="Notas de la Venta"
                name="notes"
              >
                <TextArea 
                  rows={4} 
                  placeholder="Información adicional sobre la venta, productos incluidos, condiciones especiales, etc..." 
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </Edit>
  );
};
