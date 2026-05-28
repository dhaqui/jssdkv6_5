import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  PayPalProvider,
  PayPalOneTimePaymentButton,
} from "@paypal/react-paypal-js/sdk-v6";
import "./styles.css";

async function fetchClientId(): Promise<string> {
  const response = await fetch("/api/paypal/client-id");

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to load PayPal client ID");
  }

  const data = await response.json();
  return data.clientId;
}

function Checkout() {
  const [status, setStatus] = useState("Ready");
  const [lastOrderId, setLastOrderId] = useState("");

  return (
    <section className="card">
      <h2>One-time payment</h2>
      <p>Amount: <strong>$10.00 USD</strong></p>

      <PayPalOneTimePaymentButton
        createOrder={async () => {
          setStatus("Creating order on server...");

          const response = await fetch("/api/create-order", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            }
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to create order");
          }

          setLastOrderId(data.orderId);
          setStatus(`Order created: ${data.orderId}`);

          return { orderId: data.orderId };
        }}
        onApprove={async ({ orderId }: { orderId: string }) => {
          setStatus(`Capturing order on server: ${orderId}`);

          const response = await fetch(`/api/capture-order/${orderId}`, {
            method: "POST"
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to capture order");
          }

          setStatus("Payment captured successfully.");
        }}
        onCancel={() => {
          setStatus("Payment cancelled.");
        }}
        onError={(error: unknown) => {
          console.error(error);
          setStatus("Payment error. Check browser console and Render logs.");
        }}
      />

      <div className="status">
        <div><strong>Status:</strong> {status}</div>
        {lastOrderId ? <div><strong>Last Order ID:</strong> {lastOrderId}</div> : null}
      </div>
    </section>
  );
}

function App() {
  const clientIdPromise = useMemo(() => fetchClientId(), []);

  return (
    <PayPalProvider
      clientId={clientIdPromise}
      components={["paypal-payments"]}
      pageType="checkout"
      environment="sandbox"
      debug={true}
    >
      <main className="container">
        <header>
          <h1>PayPal JS SDK v6 Server-side Demo</h1>
          <p>
            Orders are created and captured by the Express server.
            The browser never receives your PayPal client secret.
          </p>
        </header>

        <Checkout />
      </main>
    </PayPalProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
