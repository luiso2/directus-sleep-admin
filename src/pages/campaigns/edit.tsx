import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, DatePicker, Card, Row, Col, Space } from "antd";
import { 
  MailOutlined, 
  MessageOutlined, 
  PhoneOutlined, 
  GlobalOutlined, 
  DollarOutlined,
  CalendarOutlined,
  TeamOutlined,
  AimOutlined,
  BarChartOutlined
} from "@ant-design/icons";
import type { Campaign } from "../../types/directus";
import dayjs from "dayjs";

const { TextArea } = Input;

export const CampaignEdit: React.FC = () => {
  const { formProps, saveButtonProps, queryResult } = useForm<Campaign>({
    resource: "campaigns",
    redirect: "list",
  });

  const campaignData = queryResult?.data?.data;

  // Transform dates for form
  React.useEffect(() => {
    if (campaignData && formProps.form) {
      formProps.form.setFieldsValue({
        ...campaignData,
        start_date: campaignData.start_date ? dayjs(campaignData.start_date) : undefined,
        end_date: campaignData.end_date ? dayjs(campaignData.end_date) : undefined,
      });
    }
  }, [campaignData]);

  return (
    <Edit saveButtonProps={saveButtonProps} title="Editar Campaña">
      <Form {...formProps} layout="vertical">
        <Card bordered={false}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Nombre de la Campaña"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Por favor ingrese el nombre de la campaña",
                  },
                ]}
              >
                <Input 
                  prefix={<AimOutlined />}
                  placeholder="Ej: Campaña Navideña 2025" 
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Tipo de Campaña"
                name="type"
                rules={[
                  {
                    required: true,
                    message: "Por favor seleccione el tipo de campaña",
                  },
                ]}
              >
                <Select placeholder="Seleccione un tipo">
                  <Select.Option value="email">
                    <Space>
                      <MailOutlined />
                      Email
                    </Space>
                  </Select.Option>
                  <Select.Option value="sms">
                    <Space>
                      <MessageOutlined />
                      SMS
                    </Space>
                  </Select.Option>
                  <Select.Option value="phone">
                    <Space>
                      <PhoneOutlined />
                      Llamadas
                    </Space>
                  </Select.Option>
                  <Select.Option value="social">
                    <Space>
                      <GlobalOutlined />
                      Redes Sociales
                    </Space>
                  </Select.Option>
                  <Select.Option value="paid_ads">
                    <Space>
                      <DollarOutlined />
                      Anuncios Pagados
                    </Space>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                label="Descripción"
                name="description"
              >
                <TextArea
                  rows={3}
                  placeholder="Describa los objetivos y detalles de la campaña"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={6}>
              <Form.Item
                label={
                  <Space>
                    <CalendarOutlined />
                    <span>Fecha de Inicio</span>
                  </Space>
                }
                name="start_date"
                rules={[
                  {
                    required: true,
                    message: "Por favor seleccione la fecha de inicio",
                  },
                ]}
              >
                <DatePicker 
                  style={{ width: "100%" }}
                  placeholder="Fecha de inicio"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={6}>
              <Form.Item
                label="Fecha de Fin"
                name="end_date"
              >
                <DatePicker 
                  style={{ width: "100%" }}
                  placeholder="Fecha de fin"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Estado"
                name="status"
              >
                <Select>
                  <Select.Option value="draft">Borrador</Select.Option>
                  <Select.Option value="active">Activa</Select.Option>
                  <Select.Option value="paused">Pausada</Select.Option>
                  <Select.Option value="completed">Completada</Select.Option>
                  <Select.Option value="cancelled">Cancelada</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <Space>
                    <DollarOutlined />
                    <span>Presupuesto</span>
                  </Space>
                }
                name="budget"
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="Ej: 50000"
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, "") as any}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <Space>
                    <TeamOutlined />
                    <span>Audiencia Objetivo</span>
                  </Space>
                }
                name="target_audience"
              >
                <Input placeholder="Ej: Clientes VIP, Nuevos clientes, etc." />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Card
                title="Objetivos de la Campaña"
                type="inner"
                size="small"
              >
                <Form.Item
                  name={["goals", "description"]}
                  label="Describa los objetivos principales"
                >
                  <TextArea
                    rows={2}
                    placeholder="Ej: Aumentar ventas en 20%, Conseguir 100 nuevos clientes, etc."
                  />
                </Form.Item>

                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      label="Conversiones esperadas"
                      name={["goals", "expected_conversions"]}
                    >
                      <InputNumber
                        min={0}
                        style={{ width: "100%" }}
                        placeholder="Ej: 100"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={8}>
                    <Form.Item
                      label="Alcance esperado"
                      name={["goals", "expected_reach"]}
                    >
                      <InputNumber
                        min={0}
                        style={{ width: "100%" }}
                        placeholder="Ej: 5000"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={8}>
                    <Form.Item
                      label="ROI esperado (%)"
                      name={["goals", "expected_roi"]}
                    >
                      <InputNumber
                        min={0}
                        max={1000}
                        style={{ width: "100%" }}
                        placeholder="Ej: 150"
                        formatter={(value) => `${value}%`}
                        parser={(value) => value?.replace('%', '') as any}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col xs={24}>
              <Card
                title={
                  <Space>
                    <BarChartOutlined />
                    <span>Métricas Actuales</span>
                  </Space>
                }
                type="inner"
                size="small"
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      label="Conversiones actuales"
                      name={["metrics", "current_conversions"]}
                    >
                      <InputNumber
                        min={0}
                        style={{ width: "100%" }}
                        placeholder="0"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={8}>
                    <Form.Item
                      label="Alcance actual"
                      name={["metrics", "current_reach"]}
                    >
                      <InputNumber
                        min={0}
                        style={{ width: "100%" }}
                        placeholder="0"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={8}>
                    <Form.Item
                      label="ROI actual (%)"
                      name={["metrics", "current_roi"]}
                    >
                      <InputNumber
                        min={0}
                        max={1000}
                        style={{ width: "100%" }}
                        placeholder="0"
                        formatter={(value) => `${value}%`}
                        parser={(value) => value?.replace('%', '') as any}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Card>
      </Form>
    </Edit>
  );
};
