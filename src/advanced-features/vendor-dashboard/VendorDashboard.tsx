// @ts-nocheck
import React from "react";
import DashboardOverview from "./components/DashboardOverview";

interface VendorDashboardProps {
  vendorId: string;
  vendorName?: string;
}

const VendorDashboard: React.FC<VendorDashboardProps> = ({ vendorId, vendorName }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <DashboardOverview vendorId={vendorId} vendorName={vendorName} />
  </div>
);

export default VendorDashboard;


