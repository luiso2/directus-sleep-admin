import React from "react";
import { Layout as AntLayout, Menu, theme, Avatar, Space, Typography } from "antd";
import { Link, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  UserOutlined,
  CrownOutlined,
  SwapOutlined,
  CreditCardOutlined,
  ShoppingOutlined,
  LogoutOutlined,
  BellOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useLogout } from "@refinedev/core";

const { Header, Sider, Content, Footer } = AntLayout;
const { Text } = Typography;

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { mutate: logout } = useLogout();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: "/customers",
      icon: <UserOutlined />,
      label: <Link to="/customers">Clientes</Link>,
    },
    {
      key: "/subscriptions",
      icon: <CrownOutlined />,
      label: <Link to="/subscriptions">Suscripciones</Link>,
    },
    {
      key: "/evaluations",
      icon: <SwapOutlined />,
      label: <Link to="/evaluations">Trade-In</Link>,
    },
    {
      key: "integrations",
      label: "Integraciones",
      type: "group",
      children: [
        {
          key: "/stripe",
          icon: <CreditCardOutlined />,
          label: <Link to="/stripe">Stripe</Link>,
        },
        {
          key: "/shopify",
          icon: <ShoppingOutlined />,
          label: <Link to="/shopify">Shopify</Link>,
        },
      ],
    },
  ];

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <Sider
        width={250}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ 
          height: 64, 
          margin: 16, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center" 
        }}>
          <Space>
            <Avatar size={40} style={{ backgroundColor: "#1890ff" }}>S+</Avatar>
            <Text strong style={{ color: "white", fontSize: 18 }}>
              Sleep+ Admin
            </Text>
          </Space>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
        <div style={{ 
          position: "absolute", 
          bottom: 0, 
          width: "100%", 
          padding: "16px" 
        }}>
          <Menu
            theme="dark"
            mode="inline"
            items={[
              {
                key: "settings",
                icon: <SettingOutlined />,
                label: "Configuración",
              },
              {
                key: "logout",
                icon: <LogoutOutlined />,
                label: "Cerrar Sesión",
                onClick: () => logout(),
              },
            ]}
          />
        </div>
      </Sider>
      <AntLayout style={{ marginLeft: 250 }}>
        <Header 
          style={{ 
            padding: "0 24px", 
            background: colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
          }}
        >
          <div />
          <Space size="large">
            <BellOutlined style={{ fontSize: 18, cursor: "pointer" }} />
            <Avatar icon={<UserOutlined />} />
          </Space>
        </Header>
        <Content
          style={{
            margin: "24px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Sleep+ Admin ©{new Date().getFullYear()} - Sistema de Gestión
        </Footer>
      </AntLayout>
    </AntLayout>
  );
};
