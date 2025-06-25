import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider } from "antd";
import esES from "antd/locale/es_ES";
import { Refine } from "@refinedev/core";
import { RefineAntd, notificationProvider, ErrorComponent } from "@refinedev/antd";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import routerProvider from "@refinedev/react-router-v6";
import "@refinedev/antd/dist/reset.css";
import dayjs from "dayjs";
import "dayjs/locale/es";

// Services
import { directusDataProvider } from "./services/directus";

// Pages
import { Dashboard } from "./pages/dashboard/Dashboard";
import { CustomerList } from "./pages/customers/CustomerList";
import { SubscriptionList } from "./pages/subscriptions/SubscriptionList";
import { TradeInEvaluations } from "./pages/evaluations/TradeInEvaluations";
import { StripeConfiguration } from "./pages/stripe/StripeConfiguration";
import { ShopifyConfiguration } from "./pages/shopify/ShopifyConfiguration";

// Components
import { Layout } from "./components/Layout";

dayjs.locale("es");

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ConfigProvider locale={esES}>
        <Refine
          dataProvider={directusDataProvider}
          notificationProvider={notificationProvider}
          routerProvider={routerProvider}
          resources={[
            {
              name: "dashboard",
              list: "/",
              meta: {
                label: "Dashboard",
                icon: "dashboard",
              },
            },
            {
              name: "new_customers",
              list: "/customers",
              meta: {
                label: "Clientes",
                icon: "user",
              },
            },
            {
              name: "subscriptions",
              list: "/subscriptions",
              meta: {
                label: "Suscripciones",
                icon: "crown",
              },
            },
            {
              name: "evaluations",
              list: "/evaluations",
              meta: {
                label: "Trade-In",
                icon: "swap",
              },
            },
            {
              name: "stripe",
              list: "/stripe",
              meta: {
                label: "Stripe",
                icon: "credit-card",
              },
            },
            {
              name: "shopify",
              list: "/shopify",
              meta: {
                label: "Shopify",
                icon: "shopping",
              },
            },
          ]}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
          }}
        >
          <Routes>
            <Route
              element={
                <Layout>
                  <Outlet />
                </Layout>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="/customers" element={<CustomerList />} />
              <Route path="/subscriptions" element={<SubscriptionList />} />
              <Route path="/evaluations" element={<TradeInEvaluations />} />
              <Route path="/stripe" element={<StripeConfiguration />} />
              <Route path="/shopify" element={<ShopifyConfiguration />} />
              <Route path="*" element={<ErrorComponent />} />
            </Route>
          </Routes>
        </Refine>
      </ConfigProvider>
    </BrowserRouter>
  );
};

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
