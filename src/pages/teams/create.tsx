import React from "react";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Switch, Select, Card, Row, Col, Space } from "antd";
import { TeamOutlined, CrownOutlined, AimOutlined } from "@ant-design/icons";
import type { Team } from "../../types/directus";

export const TeamCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm<Team>({
    resource: "teams",
    redirect: "list",
  });

  const { selectProps: userSelectProps } = useSelect({
    resource: "directus_users",
    optionLabel: "email",
    optionValue: "id",
  });

  return (
    <Create saveButtonProps={saveButtonProps} title="Crear Nuevo Equipo">
      <Form {...formProps} layout="vertical">
        <Card bordered={false}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <Space>
                    <TeamOutlined />
                    <span>Nombre del Equipo</span>
                  </Space>
                }
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Por favor ingrese el nombre del equipo",
                  },
                ]}
              >
                <Input placeholder="Ej: Equipo de Ventas Norte" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <Space>
                    <CrownOutlined />
                    <span>Líder del Equipo</span>
                  </Space>
                }
                name="leader_id"
              >
                <Select
                  {...userSelectProps}
                  placeholder="Seleccione un líder"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label?.toString() ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                label="Descripción"
                name="description"
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Describa el propósito y objetivos del equipo"
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Card
                title={
                  <Space>
                    <AimOutlined />
                    <span>Metas del Equipo</span>
                  </Space>
                }
                type="inner"
                size="small"
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      label="Meta de Llamadas Diarias"
                      name={["goals", "daily_calls"]}
                    >
                      <InputNumber
                        min={0}
                        style={{ width: "100%" }}
                        placeholder="Ej: 50"
                        formatter={(value) => `${value}`}
                        parser={(value) => value?.replace(/\D/g, "") as any}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={8}>
                    <Form.Item
                      label="Meta de Ventas Diarias"
                      name={["goals", "daily_sales"]}
                    >
                      <InputNumber
                        min={0}
                        style={{ width: "100%" }}
                        placeholder="Ej: 10"
                        formatter={(value) => `${value}`}
                        parser={(value) => value?.replace(/\D/g, "") as any}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={8}>
                    <Form.Item
                      label="Meta de Ingresos Mensuales"
                      name={["goals", "monthly_revenue"]}
                    >
                      <InputNumber
                        min={0}
                        style={{ width: "100%" }}
                        placeholder="Ej: 100000"
                        formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={(value) => value?.replace(/\$\s?|(,*)/g, "") as any}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col xs={24}>
              <Form.Item
                label="Estado del Equipo"
                name="active"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch
                  checkedChildren="Activo"
                  unCheckedChildren="Inactivo"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </Create>
  );
};
