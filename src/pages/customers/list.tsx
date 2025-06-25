import React from "react";
import { List, Tag, Button, Space } from "antd";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useList, useNavigation } from "@refinedev/core";
import { handleDirectusError } from "../../utils/errorHandler";
import { getDemoCustomers } from "../../utils/demoData";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  stripe_customer_id?: string;
  shopify_customer_id?: string;
  created_at: string;
}

export const CustomerList: React.FC = () => {
  const { show, edit } = useNavigation();
  
  const { data, isLoading, isError, error } = useList<Customer>({
    resource: "new_customers",
    pagination: {
      pageSize: 10,
    },
    sorters: [
      {
        field: "created_at",
        order: "desc",
      },
    ],
  });

  // Manejo de errores y datos de demostración
  const customers = React.useMemo(() => {
    if (isError && error) {
      const errorData = handleDirectusError(error);
      if (errorData.status === 403) {
        console.warn("Using demo data due to permission error");
        return getDemoCustomers();
      }
      return [];
    }
    return data?.data || [];
  }, [data, isError, error]);

  return (
    <List
      itemLayout="horizontal"
      dataSource={customers}
      loading={isLoading}
      renderItem={(item) => (
        <List.Item
          actions={[
            <Space>
              <Button
                type="primary"
                icon={<EyeOutlined />}
                onClick={() => show("new_customers", item.id)}
              >
                Ver
              </Button>
              <Button
                icon={<EditOutlined />}
                onClick={() => edit("new_customers", item.id)}
              >
                Editar
              </Button>
            </Space>,
          ]}
        >
          <List.Item.Meta
            title={item.name}
            description={
              <div>
                <p>Email: {item.email}</p>
                {item.phone && <p>Teléfono: {item.phone}</p>}
                <Space>
                  {item.stripe_customer_id && (
                    <Tag color="blue">Stripe</Tag>
                  )}
                  {item.shopify_customer_id && (
                    <Tag color="green">Shopify</Tag>
                  )}
                </Space>
                <p>Fecha: {new Date(item.created_at).toLocaleDateString()}</p>
              </div>
            }
          />
        </List.Item>
      )}
    />
  );
};