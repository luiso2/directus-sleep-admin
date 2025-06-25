import React, { useState, useEffect } from "react";
import { Card, List, Typography, Spin, Alert, Space, Tag } from "antd";
import { DatabaseOutlined } from "@ant-design/icons";
import { getDirectusCollections, getCollectionFields } from "../../utils/directusCollections";

const { Title, Text } = Typography;

export const SettingsList: React.FC = () => {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [fields, setFields] = useState<any[]>([]);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const data = await getDirectusCollections();
      setCollections(data);
    } catch (err) {
      setError("Error al cargar las colecciones");
    } finally {
      setLoading(false);
    }
  };

  const handleCollectionClick = async (collectionName: string) => {
    setSelectedCollection(collectionName);
    const collectionFields = await getCollectionFields(collectionName);
    setFields(collectionFields);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="error" />;
  }

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card>
        <Title level={2}>
          <DatabaseOutlined /> Colecciones de Directus
        </Title>
        <Text type="secondary">
          Estas son las colecciones disponibles en tu instancia de Directus
        </Text>
      </Card>

      <Card title="Colecciones del Sistema">
        <List
          dataSource={[
            { name: "directus_users", description: "Usuarios del sistema" },
            { name: "directus_roles", description: "Roles y permisos" },
          ]}
          renderItem={(item) => (
            <List.Item
              style={{ cursor: "pointer" }}
              onClick={() => handleCollectionClick(item.name)}
            >
              <List.Item.Meta
                title={item.name}
                description={item.description}
              />
              <Tag color="blue">Sistema</Tag>
            </List.Item>
          )}
        />
      </Card>

      <Card title="Colecciones Personalizadas">
        {collections.length === 0 ? (
          <Alert
            message="No se encontraron colecciones personalizadas"
            description="Parece que no hay colecciones personalizadas creadas en Directus. Asegúrate de que las colecciones mencionadas en la documentación estén creadas."
            type="warning"
          />
        ) : (
          <List
            dataSource={collections}
            renderItem={(item) => (
              <List.Item
                style={{ cursor: "pointer" }}
                onClick={() => handleCollectionClick(item.collection)}
              >
                <List.Item.Meta
                  title={item.collection}
                  description={item.note || "Sin descripción"}
                />
                <Tag color="green">Personalizada</Tag>
              </List.Item>
            )}
          />
        )}
      </Card>

      {selectedCollection && fields.length > 0 && (
        <Card title={`Campos de: ${selectedCollection}`}>
          <List
            dataSource={fields}
            renderItem={(field) => (
              <List.Item>
                <List.Item.Meta
                  title={field.field}
                  description={`Tipo: ${field.type} ${field.schema?.is_nullable === false ? "(Requerido)" : "(Opcional)"}`}
                />
              </List.Item>
            )}
          />
        </Card>
      )}
    </Space>
  );
};
