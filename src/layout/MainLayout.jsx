import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import "./MainLayout.css";
import Footer from "../components/layout/Footer";

const MainLayout = () => {
  return (
    <>
      <Header />
      <main className="appMain">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
