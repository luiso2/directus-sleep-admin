import React from "react";
import { List, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useList, useNavigation } from "@refinedev/core";
import { handleDirectusError } from "../../utils/errorHandler";
import { getDemoEvaluations } from "../../utils/demoData";

interface Evaluation {
  id: string;
  customer_name: string;
  customer_email: string;
  mattress_model: string;
  status: string;
  created_at: string;
}

export const TradeInEvaluations: React.FC = () => {
  const { show } = useNavigation();
  
  const { data, isLoading, isError, error } = useList<Evaluation>({
    resource: "evaluations",
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
  const evaluations = React.useMemo(() => {
    if (isError && error) {
      const errorData = handleDirectusError(error);
      if (errorData.status === 403) {
        console.warn("Using demo data due to permission error");
        return getDemoEvaluations();
      }
      return [];
    }
    return data?.data || [];
  }, [data, isError, error]);

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: "#faad14",
      approved: "#52c41a",
      rejected: "#f5222d",
    };
    return colors[status] || "#000";
  };

  return (
    <List
      itemLayout="horizontal"
      dataSource={evaluations}
      loading={isLoading}
      renderItem={(item) => (
        <List.Item
          actions={[
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => show("evaluations", item.id)}
            >
              Ver
            </Button>,
          ]}
        >
          <List.Item.Meta
            title={item.customer_name}
            description={
              <div>
                <p>Email: {item.customer_email}</p>
                <p>Modelo: {item.mattress_model}</p>
                <p>
                  Estado:{" "}
                  <span style={{ color: getStatusColor(item.status) }}>
                    {item.status}
                  </span>
                </p>
                <p>Fecha: {new Date(item.created_at).toLocaleDateString()}</p>
              </div>
            }
          />
        </List.Item>
      )}
    />
  );
};