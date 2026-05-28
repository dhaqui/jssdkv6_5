# PayPal JS SDK v6 Server-side Render Demo

This project is a Render-ready React + Express demo.

- Frontend: React + Vite + `@paypal/react-paypal-js/sdk-v6`
- Backend: Express
- Server creates PayPal Orders API v2 orders
- Server captures PayPal Orders API v2 orders
- PayPal client secret is only used on the server

## Render settings

Build Command:

```bash
yarn install && yarn build
```

Start Command:

```bash
yarn start
```

Environment variables:

```bash
NODE_VERSION=20
PAYPAL_ENV=sandbox
PAYPAL_SANDBOX_CLIENT_ID=your_sandbox_client_id
PAYPAL_SANDBOX_CLIENT_SECRET=your_sandbox_client_secret
```

## Local development

```bash
cp .env.example .env
yarn install
yarn dev
```

For local full-stack testing, build and run Express:

```bash
yarn build
yarn start
```

Then open:

```bash
http://localhost:3000
```
