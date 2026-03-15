"use client";

import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import styles from "../assets/styles/Layout.module.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Header /> {/* Header внутри ThemeProvider */}
      <main className={styles.main}>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
