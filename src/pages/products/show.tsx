import React from "react";
import { Show, TextField, NumberField, BooleanField, DateField } from "@refinedev/antd";
import { Card, Row, Col, Space, Tag, Descriptions, Button, Progress } from "antd";
import { 
  ShoppingOutlined, 
  EditOutlined,
  DollarOutlined,
  StockOutlined,
  WarningOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import { useShow, useNavigation } from "@refinedev/core";
import type { Product } from "../../types/directus";

export const ProductShow: React.FC = () => {
  const { query } = useShow<Product>({
    resource: "products",
  });
  
  const { edit } = useNavigation();
  const product = query?.data?.data;

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case "electronics":
        return "blue";
      case "colchones":
        return "green";
      case "bases":
        return "orange";
      case "almohadas":
        return "purple";
      case "accesorios":
        return "cyan";
      default:
        return "default";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category?.toLowerCase()) {
      case "electronics":
        return "Electrónicos";
      case "colchones":
        return "Colchones";
      case "bases":
        return "Bases";
      case "almohadas":
        return "Almohadas";
      case "accesorios":
        return "Accesorios";
      default:
        return category || "Sin categoría";
    }
  };

  const getStockStatus = (stock: number | undefined) => {
    if (!stock || stock === 0) {
      return { 
        color: "error", 
        icon: <WarningOutlined />, 
        text: "Agotado",
        percent: 0,
        status: "exception" as const
      };
    } else if (stock < 10) {
      return { 
        color: "warning", 
        icon: <WarningOutlined />, 
        text: "Stock bajo",
        percent: 33,
        status: "normal" as const
      };
    } else {
      return { 
        color: "success", 
        icon: <CheckCircleOutlined />, 
        text: "Disponible",
        percent: 100,
        status: "success" as const
      };
    }
  };

  const calculateMargin = () => {
    if (!product?.price || !product?.cost) return 0;
    return ((product.price - product.cost) / product.price) * 100;
  };

  const stockStatus = getStockStatus(product?.stock);

  return (
    <Show
      title={
        <Space>
          <ShoppingOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
          <div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              {product?.name}
            </div>
            <div style={{ fontSize: "14px", color: "#666" }}>
              SKU: {product?.sku || "Sin SKU"} • ID: {product?.id}
            </div>
          </div>
        </Space>
      }
      headerButtons={
        <Button 
          type="primary" 
          icon={<EditOutlined />}
          onClick={() => product && edit("products", product.id!)}
        >
          Editar Producto
        </Button>
      }
    >
      <Row gutter={[16, 16]}>
        {/* Información General */}
        <Col xs={24} lg={12}>
          <Card title="Información del Producto" bordered={false}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Nombre">
                <strong style={{ fontSize: "16px" }}>{product?.name}</strong>
              </Descriptions.Item>
              
              <Descriptions.Item label="SKU">
                <code style={{ backgroundColor: "#f5f5f5", padding: "2px 6px", borderRadius: "4px" }}>
                  {product?.sku || "Sin SKU"}
                </code>
              </Descriptions.Item>
              
              <Descriptions.Item label="Categoría">
                <Tag color={getCategoryColor(product?.category || "")}>
                  {getCategoryLabel(product?.category || "")}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Estado">
                <Tag color={product?.active ? "success" : "error"}>
                  {product?.active ? "Activo" : "Inactivo"}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Descripción">
                <div style={{ 
                  padding: "8px", 
                  backgroundColor: "#fafafa", 
                  borderRadius: "6px",
                  whiteSpace: "pre-wrap" 
                }}>
                  {product?.description || "Sin descripción"}
                </div>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Información Financiera */}
        <Col xs={24} lg={12}>
          <Card title="Información Financiera" bordered={false}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Precio de Venta">
                <Space>
                  <DollarOutlined />
                  <span style={{ fontSize: "18px", fontWeight: "bold", color: "#52c41a" }}>
                    {formatCurrency(product?.price)}
                  </span>
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Costo">
                <Space>
                  <span style={{ fontSize: "16px", color: "#ff4d4f" }}>
                    {formatCurrency(product?.cost)}
                  </span>
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Margen de Ganancia">
                <Space>
                  <span style={{ 
                    fontSize: "16px", 
                    fontWeight: "bold",
                    color: calculateMargin() > 30 ? "#52c41a" : calculateMargin() > 15 ? "#faad14" : "#ff4d4f"
                  }}>
                    {calculateMargin().toFixed(1)}%
                  </span>
                  <Progress 
                    percent={Math.min(calculateMargin(), 100)} 
                    size="small" 
                    status={calculateMargin() > 30 ? "success" : calculateMargin() > 15 ? "normal" : "exception"}
                    style={{ width: "100px" }}
                  />
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Ganancia por Unidad">
                <span style={{ fontSize: "16px", fontWeight: "bold", color: "#1890ff" }}>
                  {formatCurrency((product?.price || 0) - (product?.cost || 0))}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* Información de Inventario */}
        <Col xs={24} lg={12}>
          <Card title="Inventario" bordered={false}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Stock Actual">
                <Space>
                  <StockOutlined />
                  <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                    {product?.stock || 0} unidades
                  </span>
                  <Tag color={stockStatus.color} icon={stockStatus.icon}>
                    {stockStatus.text}
                  </Tag>
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Estado del Stock">
                <Progress 
                  percent={stockStatus.percent}
                  status={stockStatus.status}
                  strokeColor={
                    stockStatus.status === "success" ? "#52c41a" :
                    stockStatus.status === "normal" ? "#faad14" : "#ff4d4f"
                  }
                />
              </Descriptions.Item>
              
              <Descriptions.Item label="Valor del Inventario">
                <Space>
                  <span style={{ fontSize: "16px", fontWeight: "bold", color: "#1890ff" }}>
                    {formatCurrency((product?.cost || 0) * (product?.stock || 0))}
                  </span>
                  <span style={{ fontSize: "12px", color: "#666" }}>
                    (Costo × Stock)
                  </span>
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Información del Sistema */}
        <Col xs={24} lg={12}>
          <Card title="Información del Sistema" bordered={false}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="ID del Producto">
                <TextField value={product?.id} />
              </Descriptions.Item>
              
              <Descriptions.Item label="Fecha de Creación">
                <DateField 
                  value={product?.created_at} 
                  format="DD/MM/YYYY HH:mm"
                />
              </Descriptions.Item>
              
              <Descriptions.Item label="Última Actualización">
                <DateField 
                  value={product?.updated_at} 
                  format="DD/MM/YYYY HH:mm"
                />
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </Show>
  );
};
