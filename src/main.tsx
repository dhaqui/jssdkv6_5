import React from "react";
import ReactDOM from "react-dom/client";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import "./styles.css";

function App() {
  return (
    <PayPalScriptProvider
      options={{
        clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "test",
        currency: "USD"
      }}
    >
      <div className="container">
        <h1>PayPal JS SDK Demo</h1>

        <PayPalButtons
          createOrder={async () => {
            return "TEST_ORDER_ID";
          }}
          onApprove={async () => {
            alert("Payment approved");
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
