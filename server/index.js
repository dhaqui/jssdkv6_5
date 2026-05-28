import express from "express";
import path from "path";

const app = express();
const __dirname = path.resolve();

app.use(express.json());

const PAYPAL_ENV = process.env.PAYPAL_ENV || "sandbox";
const PAYPAL_BASE_URL =
  PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

function getCredentials() {
  const clientId =
    PAYPAL_ENV === "live"
      ? process.env.PAYPAL_LIVE_CLIENT_ID
      : process.env.PAYPAL_SANDBOX_CLIENT_ID;

  const clientSecret =
    PAYPAL_ENV === "live"
      ? process.env.PAYPAL_LIVE_CLIENT_SECRET
      : process.env.PAYPAL_SANDBOX_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing PayPal credentials. Set PAYPAL_ENV, PAYPAL_SANDBOX_CLIENT_ID, and PAYPAL_SANDBOX_CLIENT_SECRET in Render."
    );
  }

  return { clientId, clientSecret };
}

async function getAccessToken() {
  const { clientId, clientSecret } = getCredentials();

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("PayPal OAuth error:", data);
    throw new Error(data.error_description || data.error || "Failed to get PayPal access token");
  }

  return data.access_token;
}

async function paypalRequest(pathname, options = {}) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_BASE_URL}${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("PayPal API error:", data);
    throw new Error(data.message || data.name || "PayPal API request failed");
  }

  return data;
}

app.get("/api/paypal/client-id", (req, res) => {
  try {
    const { clientId } = getCredentials();
    res.json({
      clientId,
      environment: PAYPAL_ENV
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/create-order", async (req, res) => {
  try {
    const order = await paypalRequest("/v2/checkout/orders", {
      method: "POST",
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            description: "PayPal JS SDK v6 Render Demo",
            amount: {
              currency_code: "USD",
              value: "10.00"
            }
          }
        ]
      })
    });

    res.json({ orderId: order.id, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/capture-order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: "Missing orderId" });
    }

    const capture = await paypalRequest(`/v2/checkout/orders/${orderId}/capture`, {
      method: "POST"
    });

    res.json({ capture });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`PayPal environment: ${PAYPAL_ENV}`);
});
