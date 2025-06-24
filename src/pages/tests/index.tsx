// Página de pruebas para ejecutar desde el navegador
import React, { useState } from 'react';
import { Card, Button, Space, Typography, Alert, Spin, Tag, Progress, List, Divider } from 'antd';
import { PlayCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import runTests from '../../tests/system.test';

const { Title, Text, Paragraph } = Typography;

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
  error?: string;
}

const SystemTestPage: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [overallResult, setOverallResult] = useState<{
    success: boolean;
    results: any;
  } | null>(null);

  const handleRunTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setOverallResult(null);

    try {
      // Simular progreso de pruebas
      const tests = [
        'Conexión con Directus',
        'Obtener Suscripciones',
        'Obtener Evaluaciones Trade-In',
        'Configuración de Stripe',
        'Configuración de Shopify',
        'Crear Cliente de Prueba',
        'Crear Suscripción de Prueba',
        'Verificar Conflictos de Sincronización',
        'Historial de Sincronización',
        'Verificar Estructura de Datos'
      ];

      // Inicializar todos como pendientes
      setTestResults(tests.map(name => ({ name, status: 'pending' })));

      // Ejecutar pruebas
      const result = await runTests();
      setOverallResult(result);

    } catch (error: any) {
      console.error('Error al ejecutar pruebas:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'running':
        return <Spin size="small" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'success';
      case 'failed':
        return 'error';
      case 'running':
        return 'processing';
      default:
        return 'default';
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ textAlign: 'center' }}>
            <Title level={2}>🧪 Pruebas del Sistema</Title>
            <Paragraph>
              Ejecuta pruebas completas para verificar que todos los componentes del sistema funcionan correctamente.
            </Paragraph>
          </div>

          <Alert
            message="Información Importante"
            description="Estas pruebas verificarán la conexión con Directus, las integraciones con Stripe y Shopify, y crearán algunos registros de prueba. Los registros creados pueden ser eliminados manualmente después."
            type="info"
            showIcon
          />

          <div style={{ textAlign: 'center' }}>
            <Button
              type="primary"
              size="large"
              icon={isRunning ? <Spin /> : <PlayCircleOutlined />}
              onClick={handleRunTests}
              disabled={isRunning}
              loading={isRunning}
            >
              {isRunning ? 'Ejecutando Pruebas...' : 'Ejecutar Pruebas'}
            </Button>
          </div>

          {overallResult && (
            <>
              <Divider />
              <Card 
                bordered={false}
                style={{ 
                  background: overallResult.success ? '#f6ffed' : '#fff2e8',
                  borderLeft: `4px solid ${overallResult.success ? '#52c41a' : '#faad14'}`
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Title level={4}>
                    {overallResult.success ? (
                      <>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                        ¡Todas las pruebas pasaron exitosamente!
                      </>
                    ) : (
                      <>
                        <CloseCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                        Algunas pruebas fallaron
                      </>
                    )}
                  </Title>
                  
                  <Space>
                    <Tag color="blue">Total: {overallResult.results.total}</Tag>
                    <Tag color="success">Exitosas: {overallResult.results.passed}</Tag>
                    <Tag color="error">Fallidas: {overallResult.results.failed}</Tag>
                  </Space>

                  <Progress 
                    percent={Math.round((overallResult.results.passed / overallResult.results.total) * 100)}
                    status={overallResult.success ? 'success' : 'exception'}
                  />

                  {overallResult.results.errors.length > 0 && (
                    <>
                      <Divider />
                      <div>
                        <Text strong style={{ color: '#ff4d4f' }}>Errores encontrados:</Text>
                        <List
                          size="small"
                          dataSource={overallResult.results.errors}
                          renderItem={(error, index) => (
                            <List.Item>
                              <Text type="danger">{index + 1}. {error}</Text>
                            </List.Item>
                          )}
                        />
                      </div>
                    </>
                  )}
                </Space>
              </Card>
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => window.location.reload()}
              >
                Recargar Página
              </Button>
              <Button
                type="link"
                onClick={() => console.log('Para más detalles, revisa la consola del navegador')}
              >
                Ver Consola para Detalles
              </Button>
            </Space>
          </div>

          <Alert
            message="Consejo"
            description='También puedes ejecutar las pruebas desde la consola del navegador escribiendo: window.runSystemTests()'
            type="success"
            showIcon
          />
        </Space>
      </Card>
    </div>
  );
};

export default SystemTestPage;
