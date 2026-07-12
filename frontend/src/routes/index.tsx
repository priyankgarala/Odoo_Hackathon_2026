import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute, RoleGuard } from "@/routes/ProtectedRoute";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { VehiclesPage } from "@/pages/VehiclesPage";
import { DriversPage } from "@/pages/DriversPage";
import { TripsPage } from "@/pages/TripsPage";
import { MaintenancePage } from "@/pages/MaintenancePage";
import { FuelExpensesPage } from "@/pages/FuelExpensesPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { DriverPortalPage } from "@/pages/DriverPortalPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route
            path="vehicles"
            element={
              <RoleGuard roles={["FLEET_MANAGER"]}>
                <VehiclesPage />
              </RoleGuard>
            }
          />
          <Route
            path="drivers"
            element={
              <RoleGuard roles={["SAFETY_OFFICER", "FLEET_MANAGER"]}>
                <DriversPage />
              </RoleGuard>
            }
          />
          <Route
            path="trips"
            element={
              <RoleGuard roles={["FLEET_MANAGER"]}>
                <TripsPage />
              </RoleGuard>
            }
          />
          <Route path="my-trips" element={<RoleGuard roles={["DRIVER"]}><DriverPortalPage /></RoleGuard>} />
          <Route
            path="maintenance"
            element={
              <RoleGuard roles={["FLEET_MANAGER"]}>
                <MaintenancePage />
              </RoleGuard>
            }
          />
          <Route
            path="fuel-expenses"
            element={
              <RoleGuard roles={["FINANCIAL_ANALYST", "FLEET_MANAGER"]}>
                <FuelExpensesPage />
              </RoleGuard>
            }
          />
          <Route
            path="reports"
            element={
              <RoleGuard roles={["FINANCIAL_ANALYST", "FLEET_MANAGER"]}>
                <ReportsPage />
              </RoleGuard>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
