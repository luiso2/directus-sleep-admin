import React, { useState, useEffect } from "react";
import { Row, Col, Card, Statistic, Typography, Table, Progress } from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  RiseOutlined,
  PhoneOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { Column } from "@ant-design/charts";
import { getStats } from "../../providers/directus/dataProvider";

const { Title, Text } = Typography;

export const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    activeAgents: 0,
    conversionRate: 0,
    totalCalls: 0,
    todaySales: 0,
  });
  const [topProducts, setTopProducts] = useState([]);
  const [teamPerformance, setTeamPerformance] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas generales
      const today = new Date().toISOString().split('T')[0];
      
      // Total de ventas del mes
      const salesResponse = await getStats("/items/sales", {
        aggregate: { count: "id", sum: ["total_amount"] },
        filter: JSON.stringify({
          created_at: {
            _gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
          }
        }),
      });

      // Ventas de hoy
      const todaySalesResponse = await getStats("/items/sales", {
        aggregate: { count: "id" },
        filter: JSON.stringify({
          created_at: {
            _gte: today + "T00:00:00",
            _lte: today + "T23:59:59"
          }
        }),
      });

      // Agentes activos
      const activeAgentsResponse = await getStats("/users", {
        filter: JSON.stringify({
          status: { _eq: "active" },
          role: { name: { _in: ["Agent", "Manager"] } }
        }),
        aggregate: { count: "id" }
      });

      // Llamadas totales del día
      const callsResponse = await getStats("/items/calls", {
        aggregate: { count: "id" },
        filter: JSON.stringify({
          created_at: {
            _gte: today + "T00:00:00",
            _lte: today + "T23:59:59"
          }
        }),
      });

      // Productos más vendidos
      const productsResponse = await getStats("/items/sales", {
        groupBy: ["product_id"],
        aggregate: { count: "id", sum: ["total_amount"] },
        sort: ["-count"],
        limit: 5
      });

      // Rendimiento por equipo
      const teamsResponse = await getStats("/items/sales", {
        groupBy: ["agent_id"],
        aggregate: { count: "id", sum: ["total_amount"] },
        sort: ["-sum"],
        limit: 10
      });

      // Ventas mensuales para gráfico
      const monthlyResponse = await getStats("/items/sales", {
        groupBy: ["created_at"],
        aggregate: { count: "id", sum: ["total_amount"] },
        filter: JSON.stringify({
          created_at: {
            _gte: new Date(new Date().getFullYear(), 0, 1).toISOString()
          }
        }),
      });

      // Actualizar estado
      setStats({
        totalSales: salesResponse.data?.[0]?.count?.id || 0,
        totalRevenue: salesResponse.data?.[0]?.sum?.total_amount || 0,
        activeAgents: activeAgentsResponse.data?.[0]?.count?.id || 0,
        conversionRate: calculateConversionRate(salesResponse.data?.[0]?.count?.id, callsResponse.data?.[0]?.count?.id),
        totalCalls: callsResponse.data?.[0]?.count?.id || 0,
        todaySales: todaySalesResponse.data?.[0]?.count?.id || 0,
      });

      setTopProducts(productsResponse.data || []);
      setTeamPerformance(teamsResponse.data || []);
      setMonthlySales(monthlyResponse.data || []);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateConversionRate = (sales: number, calls: number) => {
    if (calls === 0) return 0;
    return Number(((sales / calls) * 100).toFixed(2));
  };

  const productColumns = [
    {
      title: "Producto",
      dataIndex: ["product", "name"],
      key: "product",
    },
    {
      title: "Ventas",
      dataIndex: ["count", "id"],
      key: "sales",
      sorter: (a: any, b: any) => a.count.id - b.count.id,
    },
    {
      title: "Revenue",
      dataIndex: ["sum", "total_amount"],
      key: "revenue",
      render: (value: number) => `$${value?.toFixed(2) || 0}`,
    },
  ];

  const teamColumns = [
    {
      title: "Agente",
      dataIndex: ["agent", "name"],
      key: "agent",
    },
    {
      title: "Ventas",
      dataIndex: ["count", "id"],
      key: "sales",
    },
    {
      title: "Revenue",
      dataIndex: ["sum", "total_amount"],
      key: "revenue",
      render: (value: number) => `$${value?.toFixed(2) || 0}`,
    },
    {
      title: "Conversión",
      key: "conversion",
      render: (_: any, record: any) => (
        <Progress
          percent={calculateConversionRate(record.count.id, record.calls_count || 100)}
          size="small"
          status="active"
        />
      ),
    },
  ];

  // Configuración del gráfico
  const chartConfig = {
    data: monthlySales.map((item: any) => ({
      month: new Date(item.created_at).toLocaleDateString('es', { month: 'short' }),
      sales: item.sum.total_amount || 0,
    })),
    xField: "month",
    yField: "sales",
    label: {
      position: "top",
      style: {
        fill: "#FFFFFF",
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      sales: {
        alias: "Ventas ($)",
        formatter: (v: number) => `$${v.toFixed(0)}`,
      },
    },
  };

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>Dashboard Ejecutivo</Title>
      
      {/* Estadísticas principales */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ventas del Mes"
              value={stats.totalSales}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Revenue Total"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Agentes Activos"
              value={stats.activeAgents}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tasa de Conversión"
              value={stats.conversionRate}
              prefix={<RiseOutlined />}
              suffix="%"
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Estadísticas del día */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Llamadas Hoy"
              value={stats.totalCalls}
              prefix={<PhoneOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Ventas Hoy"
              value={stats.todaySales}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Gráfico de ventas mensuales */}
      <Card title="Ventas Mensuales" style={{ marginBottom: 24 }}>
        <Column {...chartConfig} height={300} />
      </Card>

      {/* Tablas */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Productos Más Vendidos">
            <Table
              dataSource={topProducts}
              columns={productColumns}
              pagination={false}
              loading={loading}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Top Agentes">
            <Table
              dataSource={teamPerformance}
              columns={teamColumns}
              pagination={false}
              loading={loading}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
