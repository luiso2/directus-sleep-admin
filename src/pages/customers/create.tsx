import React from "react";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, Switch, Card, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import type { CreateCustomerForm } from "../../types/directus";

const { TextArea } = Input;

export const CustomerCreate: React.FC = () => {
  const navigate = useNavigate();
  const { formProps, saveButtonProps } = useForm<CreateCustomerForm>({
    resource: "customers",
    redirect: "show",
    onMutationSuccess: () => {
      navigate("/customers");
    },
  });

  return (
    <Create saveButtonProps={saveButtonProps} title="Agregar Cliente">
      <Form {...formProps} layout="vertical">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="Información Personal" bordered={false}>
              <Form.Item
                label="Nombre"
                name="first_name"
                rules={[{ required: true, message: "El nombre es requerido" }]}
              >
                <Input placeholder="Ingrese el nombre" />
              </Form.Item>

              <Form.Item
                label="Apellido"
                name="last_name"
                rules={[{ required: true, message: "El apellido es requerido" }]}
              >
                <Input placeholder="Ingrese el apellido" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "El email es requerido" },
                  { type: "email", message: "Ingrese un email válido" }
                ]}
              >
                <Input placeholder="cliente@email.com" />
              </Form.Item>

              <Form.Item
                label="Teléfono"
                name="phone"
                rules={[
                  { required: true, message: "El teléfono es requerido" }
                ]}
              >
                <Input placeholder="+52 555 123 4567" />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="Información de Contacto" bordered={false}>
              <Form.Item
                label="Dirección"
                name="address"
              >
                <TextArea 
                  rows={3} 
                  placeholder="Calle, número, colonia..." 
                />
              </Form.Item>

              <Form.Item
                label="Ciudad"
                name="city"
              >
                <Input placeholder="Ciudad de México" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Estado"
                    name="state"
                  >
                    <Select placeholder="Seleccione estado">
                      <Select.Option value="CDMX">Ciudad de México</Select.Option>
                      <Select.Option value="Jalisco">Jalisco</Select.Option>
                      <Select.Option value="Nuevo León">Nuevo León</Select.Option>
                      <Select.Option value="Estado de México">Estado de México</Select.Option>
                      <Select.Option value="Puebla">Puebla</Select.Option>
                      <Select.Option value="Veracruz">Veracruz</Select.Option>
                      <Select.Option value="Yucatán">Yucatán</Select.Option>
                      <Select.Option value="Quintana Roo">Quintana Roo</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Código Postal"
                    name="zip_code"
                  >
                    <Input placeholder="12345" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="País"
                name="country"
                initialValue="México"
              >
                <Select>
                  <Select.Option value="México">México</Select.Option>
                  <Select.Option value="Estados Unidos">Estados Unidos</Select.Option>
                  <Select.Option value="España">España</Select.Option>
                  <Select.Option value="Otro">Otro</Select.Option>
                </Select>
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} md={12}>
            <Card title="Clasificación del Cliente" bordered={false}>
              <Form.Item
                label="Tipo de Cliente"
                name="type"
                initialValue="individual"
              >
                <Select>
                  <Select.Option value="individual">Individual</Select.Option>
                  <Select.Option value="business">Empresa</Select.Option>
                  <Select.Option value="vip">VIP</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Cliente VIP"
                name="vip"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch 
                  checkedChildren="Sí" 
                  unCheckedChildren="No"
                />
              </Form.Item>

              <Form.Item
                label="Límite de Crédito (MXN)"
                name="credit_limit"
                initialValue={0}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  step={1000}
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                  placeholder="50000"
                />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="Notas y Observaciones" bordered={false}>
              <Form.Item
                label="Notas"
                name="notes"
              >
                <TextArea 
                  rows={6} 
                  placeholder="Información adicional sobre el cliente, preferencias, historial, etc..." 
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </Create>
  );
};
