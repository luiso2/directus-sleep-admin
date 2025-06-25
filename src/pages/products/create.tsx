import React from "react";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, Switch, Card, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import type { CreateProductForm } from "../../types/directus";

const { TextArea } = Input;

export const ProductCreate: React.FC = () => {
  const navigate = useNavigate();
  const { formProps, saveButtonProps } = useForm<CreateProductForm>({
    resource: "products",
    redirect: "show",
    onMutationSuccess: () => {
      navigate("/products");
    },
  });

  return (
    <Create saveButtonProps={saveButtonProps} title="Agregar Producto">
      <Form {...formProps} layout="vertical">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="Información del Producto" bordered={false}>
              <Form.Item
                label="Nombre del Producto"
                name="name"
                rules={[{ required: true, message: "El nombre es requerido" }]}
              >
                <Input placeholder="Ej. Colchón Memory Foam King" />
              </Form.Item>

              <Form.Item
                label="SKU"
                name="sku"
              >
                <Input placeholder="COL-MF-K-001" />
              </Form.Item>

              <Form.Item
                label="Categoría"
                name="category"
                rules={[{ required: true, message: "Seleccione una categoría" }]}
              >
                <Select placeholder="Seleccione categoría">
                  <Select.Option value="colchones">Colchones</Select.Option>
                  <Select.Option value="bases">Bases</Select.Option>
                  <Select.Option value="almohadas">Almohadas</Select.Option>
                  <Select.Option value="accesorios">Accesorios</Select.Option>
                  <Select.Option value="electronics">Electrónicos</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Descripción"
                name="description"
              >
                <TextArea 
                  rows={4} 
                  placeholder="Descripción detallada del producto..." 
                />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="Precios e Inventario" bordered={false}>
              <Form.Item
                label="Precio de Venta (MXN)"
                name="price"
                rules={[{ required: true, message: "El precio es requerido" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  step={100}
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                  placeholder="25000"
                />
              </Form.Item>

              <Form.Item
                label="Costo (MXN)"
                name="cost"
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  step={100}
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                  placeholder="18000"
                />
              </Form.Item>

              <Form.Item
                label="Stock Inicial"
                name="stock"
                initialValue={0}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="10"
                />
              </Form.Item>

              <Form.Item
                label="Producto Activo"
                name="active"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch 
                  checkedChildren="Activo" 
                  unCheckedChildren="Inactivo"
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </Create>
  );
};
