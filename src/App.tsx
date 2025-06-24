import { Refine, Authenticated } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import {
  notificationProvider,
  ThemedLayoutV2,
  ErrorComponent,
} from "@refinedev/antd";
import routerBindings, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { App as AntdApp, ConfigProvider } from "antd";
import "@refinedev/antd/dist/reset.css";
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  PhoneOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import { authProvider } from "./providers/authProvider";
import { directusDataProvider } from "./providers/directus/dataProvider";
import { Login } from "./pages/login";
import { Dashboard } from "./pages/dashboard";
import { UserList, UserCreate, UserEdit, UserShow } from "./pages/users";
import { CustomerList, CustomerCreate, CustomerEdit, CustomerShow } from "./pages/customers";
import { ProductList, ProductCreate, ProductEdit, ProductShow } from "./pages/products";
import { SaleList, SaleCreate, SaleEdit, SaleShow } from "./pages/sales";
import { CallList, CallCreate, CallEdit, CallShow } from "./pages/calls";
import { TeamList, TeamCreate, TeamEdit, TeamShow } from "./pages/teams";
import { CampaignList, CampaignCreate, CampaignEdit, CampaignShow } from "./pages/campaigns";
import { SettingsList } from "./pages/settings";

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#764ba2",
              colorSuccess: "#52c41a",
              colorWarning: "#faad14",
              colorError: "#f5222d",
              colorInfo: "#1890ff",
              colorTextBase: "#000000",
              colorBgBase: "#ffffff",
              borderRadius: 6,
            },
          }}
        >
          <AntdApp>
            <Refine
              authProvider={authProvider}
              dataProvider={directusDataProvider}
              routerProvider={routerBindings}
              notificationProvider={notificationProvider}
              resources={[
                {
                  name: "dashboard",
                  list: "/",
                  meta: {
                    label: "Dashboard",
                    icon: <DashboardOutlined />,
                  },
                },
                {
                  name: "directus_users",
                  list: "/users",
                  create: "/users/create",
                  edit: "/users/edit/:id",
                  show: "/users/show/:id",
                  meta: {
                    label: "Usuarios",
                    icon: <UserOutlined />,
                  },
                },
                {
                  name: "customers",
                  list: "/customers",
                  create: "/customers/create",
                  edit: "/customers/edit/:id",
                  show: "/customers/show/:id",
                  meta: {
                    label: "Clientes",
                    icon: <TeamOutlined />,
                  },
                },
                {
                  name: "calls",
                  list: "/calls",
                  create: "/calls/create",
                  edit: "/calls/edit/:id",
                  show: "/calls/show/:id",
                  meta: {
                    label: "Llamadas/Tareas",
                    icon: <PhoneOutlined />,
                  },
                },
                {
                  name: "sales",
                  list: "/sales",
                  create: "/sales/create",
                  edit: "/sales/edit/:id",
                  show: "/sales/show/:id",
                  meta: {
                    label: "Ventas",
                    icon: <ShoppingCartOutlined />,
                  },
                },
                {
                  name: "products",
                  list: "/products",
                  create: "/products/create",
                  edit: "/products/edit/:id",
                  show: "/products/show/:id",
                  meta: {
                    label: "Productos",
                    icon: <AppstoreOutlined />,
                  },
                },
                {
                  name: "teams",
                  list: "/teams",
                  create: "/teams/create",
                  edit: "/teams/edit/:id",
                  show: "/teams/show/:id",
                  meta: {
                    label: "Equipos",
                    icon: <TeamOutlined />,
                  },
                },
                {
                  name: "campaigns",
                  list: "/campaigns",
                  create: "/campaigns/create",
                  edit: "/campaigns/edit/:id",
                  show: "/campaigns/show/:id",
                  meta: {
                    label: "Campañas",
                    icon: <BarChartOutlined />,
                  },
                },
                {
                  name: "settings",
                  list: "/settings",
                  meta: {
                    label: "Configuración",
                    icon: <SettingOutlined />,
                  },
                },
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "sleep-plus-admin",
              }}
            >
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  element={
                    <Authenticated key="authenticated-layout" fallback={<Login />}>
                      <ThemedLayoutV2>
                        <Outlet />
                      </ThemedLayoutV2>
                    </Authenticated>
                  }
                >
                  <Route index element={<Dashboard />} />
                  
                  {/* Rutas de Usuarios */}
                  <Route path="/users">
                    <Route index element={<UserList />} />
                    <Route path="create" element={<UserCreate />} />
                    <Route path="edit/:id" element={<UserEdit />} />
                    <Route path="show/:id" element={<UserShow />} />
                  </Route>

                  {/* Rutas de Clientes */}
                  <Route path="/customers">
                    <Route index element={<CustomerList />} />
                    <Route path="create" element={<CustomerCreate />} />
                    <Route path="edit/:id" element={<CustomerEdit />} />
                    <Route path="show/:id" element={<CustomerShow />} />
                  </Route>

                  {/* Rutas de Productos */}
                  <Route path="/products">
                    <Route index element={<ProductList />} />
                    <Route path="create" element={<ProductCreate />} />
                    <Route path="edit/:id" element={<ProductEdit />} />
                    <Route path="show/:id" element={<ProductShow />} />
                  </Route>

                  {/* Rutas de Ventas */}
                  <Route path="/sales">
                    <Route index element={<SaleList />} />
                    <Route path="create" element={<SaleCreate />} />
                    <Route path="edit/:id" element={<SaleEdit />} />
                    <Route path="show/:id" element={<SaleShow />} />
                  </Route>

                  {/* Rutas de Llamadas */}
                  <Route path="/calls">
                    <Route index element={<CallList />} />
                    <Route path="create" element={<CallCreate />} />
                    <Route path="edit/:id" element={<CallEdit />} />
                    <Route path="show/:id" element={<CallShow />} />
                  </Route>

                  {/* Rutas de Equipos */}
                  <Route path="/teams">
                    <Route index element={<TeamList />} />
                    <Route path="create" element={<TeamCreate />} />
                    <Route path="edit/:id" element={<TeamEdit />} />
                    <Route path="show/:id" element={<TeamShow />} />
                  </Route>

                  {/* Rutas de Campañas */}
                  <Route path="/campaigns">
                    <Route index element={<CampaignList />} />
                    <Route path="create" element={<CampaignCreate />} />
                    <Route path="edit/:id" element={<CampaignEdit />} />
                    <Route path="show/:id" element={<CampaignShow />} />
                  </Route>

                  {/* Configuración */}
                  <Route path="/settings" element={<SettingsList />} />
                  
                  <Route path="*" element={<ErrorComponent />} />
                </Route>
              </Routes>
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
          </AntdApp>
        </ConfigProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
