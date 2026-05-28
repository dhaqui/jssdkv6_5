import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  PayPalProvider,
  PayPalOneTimePaymentButton,
  PayPalMessages
} from '@paypal/react-paypal-js/sdk-v6';
import './styles.css';

type Config = {
  clientId: string;
  environment: 'sandbox' | 'live' | string;
};

type CaptureResult = {
  id?: string;
  status?: string;
  payer?: {
    name?: { given_name?: string; surname?: string };
    email_address?: string;
  };
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{ id?: string; status?: string; amount?: { value?: string; currency_code?: string } }>;
    };
  }>;
};

function App() {
  const [config, setConfig] = useState<Config | null>(null);
  const [amount, setAmount] = useState('1000');
  const [currency, setCurrency] = useState('JPY');
  const [status, setStatus] = useState('Sandbox 用の PayPal v6 デモです。金額を選んで決済を開始してください。');
  const [result, setResult] = useState<CaptureResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/config')
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text());
        return response.json();
      })
      .then(setConfig)
      .catch((err) => setError(err.message));
  }, []);

  async function createOrder() {
    setError(null);
    setResult(null);
    setStatus('PayPal order を作成中...');

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency, itemName: 'PayPal JS SDK v6 Demo Item' })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || data?.error || 'Order creation failed');
    }

    setStatus(`Order created: ${data.orderId}`);
    return { orderId: data.orderId };
  }

  async function onApprove(data: { orderId?: string }) {
    if (!data.orderId) throw new Error('orderId was not returned by PayPal.');
    setStatus('承認済み。Capture を実行中...');

    const response = await fetch(`/api/orders/${data.orderId}/capture`, { method: 'POST' });
    const capture = await response.json();
    if (!response.ok) {
      throw new Error(capture?.message || capture?.error || 'Capture failed');
    }

    setResult(capture);
    setStatus(`Capture completed: ${capture.status}`);
  }

  if (error) {
    return <Shell><ErrorPanel message={error} /></Shell>;
  }

  if (!config) {
    return <Shell><div className="card">設定を読み込み中...</div></Shell>;
  }

  return (
    <PayPalProvider
      clientId={config.clientId}
      components={["paypal-payments", "messages"]}
      pageType="checkout"
      currency={currency}
      dataSdkIntegrationSource="paypal-v6-render-demo"
    >
      <Shell>
        <section className="hero card">
          <div>
            <p className="eyebrow">PayPal JS SDK v6 / Sandbox</p>
            <h1>Render にデプロイできる PayPal Checkout デモ</h1>
            <p>
              React の v6 Web SDK コンポーネントと Express API で、Order 作成から Capture までを試せます。
            </p>
          </div>
          <div className="badge">{config.environment}</div>
        </section>

        <section className="grid">
          <div className="card checkout-card">
            <h2>購入内容</h2>
            <label>
              金額
              <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" />
            </label>
            <label>
              通貨
              <select value={currency} onChange={(event) => setCurrency(event.target.value)}>
                <option value="JPY">JPY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </label>
            <PayPalMessages amount={amount} placement="product" />
            <div className="button-box">
              <PayPalOneTimePaymentButton
                createOrder={createOrder}
                onApprove={onApprove}
                onCancel={() => setStatus('Buyer canceled the checkout flow.')}
                onError={(err: unknown) => {
                  const message = err instanceof Error ? err.message : String(err);
                  setError(message);
                }}
              />
            </div>
          </div>

          <div className="card">
            <h2>ステータス</h2>
            <p className="status">{status}</p>
            {result ? <pre>{JSON.stringify(result, null, 2)}</pre> : <p className="muted">Capture 後のレスポンスがここに表示されます。</p>}
          </div>
        </section>
      </Shell>
    </PayPalProvider>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <nav>
        <strong>PayPal v6 Demo</strong>
        <span>React + Express + Render</span>
      </nav>
      {children}
    </main>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="card error">
      <h2>エラー</h2>
      <p>{message}</p>
      <p>Render の Environment Variables に PayPal Sandbox の Client ID / Secret が設定されているか確認してください。</p>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
