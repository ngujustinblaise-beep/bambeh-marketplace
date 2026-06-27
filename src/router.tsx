import { createBrowserRouter } from "react-router-dom"
import MainLayout from "@/components/layout/MainLayout"
import AuthGate from "@/components/security/AuthGate"
import HomePage from "@/pages/HomePage"
import AdvancedPaymentGateway from "@/pages/PaymentGateway-ADVANCED"
import AdminPanelAdvanced from "@/pages/AdminPanel-ADVANCED"
import GPSTrackingAdvanced from "@/pages/GPSTracking-ADVANCED"
import OrderManagement from "@/pages/OrderManagement"
import VoiceAssistant from "@/pages/VoiceAssistant"

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthGate>
        <MainLayout />
      </AuthGate>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: "payments/advanced", element: <AdvancedPaymentGateway /> },
      { path: "admin/advanced", element: <AdminPanelAdvanced /> },
      { path: "tracking/gps", element: <GPSTrackingAdvanced /> },
      { path: "orders", element: <OrderManagement /> },
      { path: "assistant", element: <VoiceAssistant /> }
    ]
  }
])
