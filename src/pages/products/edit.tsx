import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, Switch, Card, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import type { Product } from "../../types/directus";

const { TextArea } = Input;

export const ProductEdit: React.FC = () => {
  const navigate = useNavigate();
  const { formProps, saveButtonProps, query } = useForm<Product>({
    resource: "products",
    redirect: "show",
    onMutationSuccess: () => {
      navigate("/products");
    },
  });

  const product = query?.data?.data;

  return (
    <Edit 
      saveButtonProps={saveButtonProps} 
      title={`Editar Producto: ${product?.name}`}
    >
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
                label="Stock Actual"
                name="stock"
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
              >
                <Switch 
                  checkedChildren="Activo" 
                  unCheckedChildren="Inactivo"
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        {product && (
          <Row style={{ marginTop: 16 }}>
            <Col span={24}>
              <Card title="Información del Sistema" bordered={false} size="small">
                <Row gutter={16}>
                  <Col span={8}>
                    <p><strong>ID:</strong> {product.id}</p>
                  </Col>
                  <Col span={8}>
                    <p><strong>Creado:</strong> {product.created_at ? new Date(product.created_at).toLocaleString("es-MX") : "No disponible"}</p>
                  </Col>
                  <Col span={8}>
                    <p><strong>Última actualización:</strong> {product.updated_at ? new Date(product.updated_at).toLocaleString("es-MX") : "No disponible"}</p>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        )}
      </Form>
    </Edit>
  );
};
