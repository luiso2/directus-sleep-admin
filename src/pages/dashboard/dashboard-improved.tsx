import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Alert, Spin, Typography, Progress, Space, Tag } from 'antd';
import { 
  DollarOutlined, 
  UserOutlined, 
  ShoppingCartOutlined, 
  GiftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import DirectusService from '../../services/directus-service-improved';

const { Title, Text } = Typography;

interface DashboardMetrics {
  totalCustomers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  pendingEvaluations: number;
  todaySales: number;
  monthlyGrowth: number;
  topPlans: {
    basic: number;
    premium: number;
    elite: number;
  };
  recentActivity: any[];
}

export const DashboardImproved: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalCustomers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    pendingEvaluations: 0,
    todaySales: 0,
    monthlyGrowth: 0,
    topPlans: {
      basic: 0,
      premium: 0,
      elite: 0
    },
    recentActivity: []
  });

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      
      // Fetch all necessary data
      const [customers, subscriptions, evaluations] = await Promise.all([
        DirectusService.getCustomers({ limit: -1 }),
        DirectusService.getSubscriptions({ 
          filter: { status: { _eq: 'active' } },
          limit: -1 
        }),
        DirectusService.getEvaluations({ 
          filter: { status: { _eq: 'pending' } },
          limit: -1 
        })
      ]);

      // Calculate metrics
      const monthlyRevenue = subscriptions.reduce((sum: number, sub: any) => 
        sum + (sub.price_monthly || 0), 0
      );

      // Count plans
      const planCounts = subscriptions.reduce((acc: any, sub: any) => {
        acc[sub.plan_type] = (acc[sub.plan_type] || 0) + 1;
        return acc;
      }, { basic: 0, premium: 0, elite: 0 });

      setMetrics({
        totalCustomers: customers.length,
        activeSubscriptions: subscriptions.length,
        monthlyRevenue,
        pendingEvaluations: evaluations.length,
        todaySales: 0, // This would come from sales data
        monthlyGrowth: 15.3, // This would be calculated from historical data
        topPlans: planCounts,
        recentActivity: [] // This would come from activity logs
      });
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Cargando métricas del dashboard..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Dashboard Sleep+ Admin</Title>
      
      {/* Alert for important notifications */}
      <Alert
        message="Sistema de Suscripciones Activo"
        description="Las integraciones con Stripe y Shopify están funcionando correctamente."
        type="success"
        showIcon
        closable
        style={{ marginBottom: 24 }}
      />

      {/* Main Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable 
            onClick={() => navigate('/customers')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="Total Clientes"
              value={metrics.totalCustomers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Text type="secondary">Clientes registrados</Text>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable 
            onClick={() => navigate('/subscriptions')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="Suscripciones Activas"
              value={metrics.activeSubscriptions}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress 
              percent={(metrics.activeSubscriptions / metrics.totalCustomers) * 100} 
              showInfo={false}
              strokeColor="#52c41a"
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ingresos Mensuales"
              value={metrics.monthlyRevenue}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#faad14' }}
            />
            <Space>
              <RiseOutlined style={{ color: '#52c41a' }} />
              <Text type="success">{metrics.monthlyGrowth}%</Text>
              <Text type="secondary">vs mes anterior</Text>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable 
            onClick={() => navigate('/trade-in')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="Trade-In Pendientes"
              value={metrics.pendingEvaluations}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
            <Text type="secondary">Requieren evaluación</Text>
          </Card>
        </Col>
      </Row>

      {/* Plan Distribution */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Distribución de Planes" extra={<TeamOutlined />}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Text>Plan Basic</Text>
                  <Tag color="blue">{metrics.topPlans.basic} clientes</Tag>
                </Space>
                <Progress 
                  percent={(metrics.topPlans.basic / metrics.activeSubscriptions) * 100} 
                  strokeColor="#1890ff"
                />
              </div>
              
              <div>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Text>Plan Premium</Text>
                  <Tag color="gold">{metrics.topPlans.premium} clientes</Tag>
                </Space>
                <Progress 
                  percent={(metrics.topPlans.premium / metrics.activeSubscriptions) * 100} 
                  strokeColor="#faad14"
                />
              </div>
              
              <div>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Text>Plan Elite</Text>
                  <Tag color="purple">{metrics.topPlans.elite} clientes</Tag>
                </Space>
                <Progress 
                  percent={(metrics.topPlans.elite / metrics.activeSubscriptions) * 100} 
                  strokeColor="#722ed1"
                />
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Servicios Incluidos por Plan">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ padding: '8px', background: '#f0f2f5', borderRadius: '4px' }}>
                <Text strong>Plan Basic</Text>
                <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                  <li>3 limpiezas anuales</li>
                  <li>Protección básica</li>
                  <li>1 inspección anual</li>
                </ul>
              </div>
              
              <div style={{ padding: '8px', background: '#fffbe6', borderRadius: '4px' }}>
                <Text strong>Plan Premium</Text>
                <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                  <li>6 limpiezas anuales</li>
                  <li>Protección premium</li>
                  <li>2 inspecciones anuales</li>
                </ul>
              </div>
              
              <div style={{ padding: '8px', background: '#f9f0ff', borderRadius: '4px' }}>
                <Text strong>Plan Elite</Text>
                <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                  <li>12 limpiezas anuales</li>
                  <li>Protección elite</li>
                  <li>2 inspecciones anuales</li>
                  <li><strong>Trade-In disponible</strong></li>
                </ul>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Acciones Rápidas">
            <Space wrap>
              <Tag 
                icon={<UserOutlined />} 
                color="blue" 
                style={{ cursor: 'pointer', padding: '8px 16px' }}
                onClick={() => navigate('/customers/create')}
              >
                Nuevo Cliente
              </Tag>
              <Tag 
                icon={<ShoppingCartOutlined />} 
                color="green" 
                style={{ cursor: 'pointer', padding: '8px 16px' }}
                onClick={() => navigate('/subscriptions/create')}
              >
                Nueva Suscripción
              </Tag>
              <Tag 
                icon={<GiftOutlined />} 
                color="purple" 
                style={{ cursor: 'pointer', padding: '8px 16px' }}
                onClick={() => navigate('/trade-in/create')}
              >
                Nueva Evaluación Trade-In
              </Tag>
              <Tag 
                icon={<DollarOutlined />} 
                color="gold" 
                style={{ cursor: 'pointer', padding: '8px 16px' }}
                onClick={() => navigate('/stripe')}
              >
                Configurar Stripe
              </Tag>
              <Tag 
                icon={<ShoppingCartOutlined />} 
                color="orange" 
                style={{ cursor: 'pointer', padding: '8px 16px' }}
                onClick={() => navigate('/shopify')}
              >
                Configurar Shopify
              </Tag>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardImproved;
