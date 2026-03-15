"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import Link from "next/link";
import styles from "../assets/styles/ErrorBoundary.module.css";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    // Здесь можно отправить ошибку в аналитику
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <span className={styles.errorIcon}>😕</span>
            <h1 className={styles.errorTitle}>Что-то пошло не так</h1>
            <p className={styles.errorMessage}>
              Произошла ошибка при загрузке страницы
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <pre className={styles.errorDetails}>
                {this.state.error.toString()}
              </pre>
            )}
            <div className={styles.errorActions}>
              <button
                onClick={() => window.location.reload()}
                className={styles.retryButton}
              >
                Обновить страницу
              </button>
              <Link href="/" className={styles.homeButton}>
                На главную
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
