import React from "react";
import { Outlet } from "react-router-dom";

const MainLayout: React.FC = () => {
  return (
    <div style={{ padding: 40 }}>
      <h1>MainLayout Loaded</h1>
      <Outlet />
    </div>
  );
};

export default MainLayout;
