// src/components/Toast.jsx
//
// A small, self-dismissing notification shown in the corner of the screen.
// App.jsx owns an array of active toasts and renders one <Toast> per item;
// each one removes itself from that array after a few seconds.

import React, { useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export default function Toast({ id, message, type = "success", onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 3000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const isSuccess = type === "success";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: isSuccess ? "#1B2A3A" : "#C45D3F",
        color: "#F4F1EA",
        padding: "12px 16px",
        borderRadius: 10,
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
        fontFamily: "'Inter', sans-serif",
        fontSize: 13.5,
        fontWeight: 600,
        minWidth: 240,
        maxWidth: 360,
        animation: "toast-in 0.25s ease",
      }}
    >
      {isSuccess ? (
        <CheckCircle2 size={18} strokeWidth={2} style={{ flexShrink: 0 }} />
      ) : (
        <XCircle size={18} strokeWidth={2} style={{ flexShrink: 0 }} />
      )}
      <span style={{ flex: 1 }}>{message}</span>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div
      className="toast-container-mobile"
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        zIndex: 100,
      }}
    >
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .toast-container-mobile {
            left: 14px !important;
            right: 14px !important;
            bottom: 14px !important;
          }
        }
      `}</style>
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
