import { createBrowserRouter } from "react-router-dom"
import MainLayout from "@/components/layout/MainLayout"
import AuthGate from "@/components/security/AuthGate"
import HomePage from "@\/pages/HomePage.tsx"
import AdvancedPaymentGateway from "@\/pages/PaymentGateway-ADVANCED.tsx"
import AdminPanelAdvanced from "@\/pages/AdminPanel-ADVANCED.tsx"
import GPSTrackingAdvanced from "@\/pages/GPSTracking-ADVANCED.tsx"
import OrderManagement from "@\/pages/OrderManagement.tsx"
import VoiceAssistant from "@\/pages/VoiceAssistant.tsx"

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <MainLayout />
    ),
    children: [
      { index: true, element: <div>Home Loaded</div> },
      { path: "payments/advanced", element: <AdvancedPaymentGateway /> },
      { path: "admin/advanced", element: <AdminPanelAdvanced /> },
      { path: "tracking/gps", element: <GPSTrackingAdvanced /> },
      { path: "orders", element: <OrderManagement /> },
      { path: "assistant", element: <VoiceAssistant /> }
    ]
  }
])



export default router






