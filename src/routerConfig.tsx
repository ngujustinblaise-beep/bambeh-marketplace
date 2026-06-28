import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import AdvancePayment from './pages/AdvancePayment';
import OrderManagement from './advanced-features/admin/OrderManagement';
import VoiceAssistant from './advanced-features/voice-assistant/VoiceAssistant';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: 'payment', element: <AdvancePayment /> },
      { path: 'admin/orders', element: <OrderManagement vendorId="default" /> },
      { path: 'voice', element: <VoiceAssistant /> }
    ]
  }
]);
