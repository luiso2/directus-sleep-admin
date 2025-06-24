import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, Card, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;

export const UserEdit: React.FC = () => {
  const navigate = useNavigate();
  const { formProps, saveButtonProps, queryResult } = useForm({
    resource: "directus_users",
    redirect: "show",
    onMutationSuccess: () => {
      navigate("/users");
    },
  });

  const userData = queryResult?.data?.data;

  return (
    <Edit saveButtonProps={saveButtonProps} title="Editar Usuario">
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
                <Input placeholder="ejemplo@sleepplus.com" />
              </Form.Item>

              <Form.Item
                label="Cambiar Contraseña"
                name="password"
                help="Dejar en blanco para mantener la contraseña actual"
                rules={[
                  { min: 8, message: "La contraseña debe tener al menos 8 caracteres" }
                ]}
              >
                <Input.Password placeholder="Nueva contraseña (opcional)" />
              </Form.Item>

              <Form.Item
                label="Teléfono"
                name="phone"
              >
                <Input placeholder="+34 600 000 000" />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="Configuración de Rol" bordered={false}>
              <Form.Item
                label="Rol"
                name={["role", "id"]}
                rules={[{ required: true, message: "Seleccione un rol" }]}
              >
                <Select placeholder="Seleccione un rol">
                  <Select.Option value="admin">Administrador</Select.Option>
                  <Select.Option value="manager">Manager</Select.Option>
                  <Select.Option value="agent">Agente</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Estado"
                name="status"
              >
                <Select>
                  <Select.Option value="active">Activo</Select.Option>
                  <Select.Option value="inactive">Inactivo</Select.Option>
                  <Select.Option value="break">En Descanso</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Equipo"
                name="team_id"
              >
                <Select placeholder="Seleccione un equipo">
                  {/* Aquí se cargarán los equipos disponibles */}
                </Select>
              </Form.Item>
            </Card>

            <Card title="Metas y Comisiones" bordered={false} style={{ marginTop: 16 }}>
              <Form.Item
                label="Meta de Llamadas Diarias"
                name="daily_goal_calls"
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label="Meta de Ventas Diarias"
                name="daily_goal_sales"
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label="Porcentaje de Comisión (%)"
                name="commission_rate"
              >
                <InputNumber min={0} max={100} style={{ width: "100%" }} />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="Información Adicional" bordered={false}>
              <Form.Item
                label="Notas"
                name="notes"
              >
                <TextArea rows={4} placeholder="Notas adicionales sobre el usuario..." />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </Edit>
  );
};
