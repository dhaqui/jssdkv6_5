# PayPal JS SDK v6 Render Demo

PayPal JS SDK v6 の React コンポーネントを使った、Render デプロイ用の最小デモです。

## 機能

- PayPal Sandbox の Client ID をフロントへ安全に渡す `/api/config`
- サーバー側で OAuth access token を取得
- `/api/orders` で PayPal Order を作成
- `/api/orders/:orderId/capture` で Capture
- Vite のビルド成果物を Express が配信
- `render.yaml` 付き

## ローカル起動

```bash
cp .env.example .env
# .env に PayPal Sandbox の Client ID / Secret を設定
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

## Render へデプロイ

1. このフォルダを GitHub リポジトリに push します。
2. Render で **New +** → **Web Service** を選び、この GitHub リポジトリを接続します。
3. Build Command は `npm install && npm run build`、Start Command は `npm start` にします。
4. Environment Variables に以下を設定します。

| Key | Value |
| --- | --- |
| `NODE_VERSION` | `20` |
| `PAYPAL_ENV` | `sandbox` |
| `PAYPAL_SANDBOX_CLIENT_ID` | PayPal Developer Dashboard の Sandbox Client ID |
| `PAYPAL_SANDBOX_CLIENT_SECRET` | PayPal Developer Dashboard の Sandbox Secret |

`render.yaml` を使う場合、Render の Blueprint として読み込んでも構いません。

## GitHub へアップロード

```bash
git init
git add .
git commit -m "Add PayPal JS SDK v6 Render demo"
git branch -M main
git remote add origin https://github.com/<your-org-or-user>/<repo-name>.git
git push -u origin main
```

## 注意

- Sandbox デモ用です。本番化する場合は `PAYPAL_ENV=live` と Live credentials を使い、金額・在庫・Webhook・ログ・エラーハンドリングを本番要件に合わせてください。
- Client Secret は絶対にフロントエンドへ露出させないでください。
