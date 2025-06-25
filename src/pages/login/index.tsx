import React from "react";
import { useLogin } from "@refinedev/core";
import { Form, Input, Button, Card, Typography, Alert, Space } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export const Login: React.FC = () => {
  const { mutate: login, isLoading } = useLogin();
  const [form] = Form.useForm();

  const onSubmit = (values: any) => {
    login(values);
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <Title level={2}>Sleep Plus Admin</Title>
            <Text type="secondary">Sistema de Gestión de Tareas</Text>
          </div>

          <Alert
            message="Credenciales de Prueba"
            description={
              <div>
                <div><strong>Admin:</strong> lbencomo94@gmail.com</div>
                <div><strong>Manager:</strong> ana.martinez@sleepplus.com</div>
                <div><strong>Agent:</strong> carlos.rodriguez@sleepplus.com</div>
                <div><strong>Password:</strong> admin123</div>
              </div>
            }
            type="info"
            showIcon
          />

          <Form
            form={form}
            name="login"
            onFinish={onSubmit}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Por favor ingresa tu email" },
                { type: "email", message: "Email inválido" },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="tu@email.com"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Contraseña"
              rules={[{ required: true, message: "Por favor ingresa tu contraseña" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="••••••••"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                size="large"
                block
              >
                Iniciar Sesión
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};