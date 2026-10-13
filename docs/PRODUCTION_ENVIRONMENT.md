# Mellosoft Production Environment Architecture

---

## 1. Runtime Architecture & Topology

```
                         Internet
                            │
               ┌────────────▼────────────┐
               │    Hostinger VPS IP     │
               │  Ports 80 (HTTP) & 443  │
               └────────────┬────────────┘
                            │
               ┌────────────▼────────────┐
               │   Nginx Reverse Proxy   │ (TLS Termination, Gzip,
               │     (Port 80 / 443)     │  Static Cache, Rate Limit)
               └──────┬────────────┬─────┘
                      │            │
            /uploads/ │            │ Reverse Proxy (Port 3000)
                      │            │
               ┌──────▼─────┐ ┌────▼─────────────────────────┐
               │  Uploads   │ │      Next.js 16 Web App      │
               │  Directory │ │   Node.js 24 Standalone      │
               │  (Volume)  │ │   Non-root user (UID 1001)   │
               └────────────┘ └──────────────┬───────────────┘
                                             │
                                             │ Private Network: mellosoft_net
                                             │ (Port 5432 - NOT EXPOSED)
                                             │
                                      ┌──────▼────────┐
                                      │ PostgreSQL 16 │
                                      │ Persistent DB │
                                      │   (Volume)    │
                                      └───────────────┘
```

---

## 2. Storage & Volume Mapping

| Volume Name | Container Mount | Host Location | Purpose |
|---|---|---|---|
| `postgres_data` | `/var/lib/postgresql/data` | `/var/lib/docker/volumes/mellosoft_postgres_data/_data` | PostgreSQL transactional data, tables, indexes, customer accounts, orders. |
| `uploads_data` | `/app/public/uploads` (Next.js) & `/var/www/uploads` (Nginx) | `/var/lib/docker/volumes/mellosoft_uploads_data/_data` | Uploaded product images, banners, category icons. Preserved across app rebuilds. |
| `certbot_conf` | `/etc/letsencrypt` | Docker volume | Let's Encrypt live and renewal certificates. |
| `certbot_www` | `/var/www/certbot` | Docker volume | ACME challenge tokens for zero-downtime certificate renewals. |

---

## 3. Environment Variables Specification

| Variable | Required in Production | Description | Example / Recommended Value |
|---|---|---|---|
| `NODE_ENV` | **Yes** | Node environment mode. Disables dev stack traces in API errors. | `production` |
| `PORT` | **Yes** | Internal application port. | `3000` |
| `APP_URL` | **Yes** | Canonical public URL used for cookie domain, CORS, and redirects. | `https://mellosoft.in` |
| `SESSION_SECRET` | **Yes** | Cryptographic key used to sign session cookies. | 64-character random hex string (`openssl rand -hex 32`). |
| `POSTGRES_DB` | **Yes** | Relational database name. | `mellosoft` |
| `POSTGRES_USER` | **Yes** | Dedicated non-superuser database username. | `mellosoft_user` |
| `POSTGRES_PASSWORD` | **Yes** | Strong database password. | High-entropy string (`openssl rand -base64 24`). |
| `DATABASE_URL` | **Yes** | Authoritative Prisma database connection URI. | `postgresql://mellosoft_user:PASS@postgres:5432/mellosoft?schema=public` |
| `RAZORPAY_KEY_ID` | Optional | Razorpay merchant API key ID. | `rzp_live_...` (or blank if using COD/UPI). |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay merchant API secret key. | Confidential (or blank if using COD/UPI). |
| `STRIPE_PUBLISHABLE_KEY`| Optional | Stripe public client key. | `pk_live_...` (or blank if using COD/UPI). |
| `STRIPE_SECRET_KEY` | Optional | Stripe server secret key. | Confidential (or blank if using COD/UPI). |
| `SMTP_HOST` | Optional | Outgoing mail server for order notifications. | `smtp.hostinger.com` |
| `SMTP_PORT` | Optional | Outgoing mail port. | `587` |
| `SMTP_USER` | Optional | Mail account username. | `orders@mellosoft.in` |
| `SMTP_PASS` | Optional | Mail account password. | Confidential |
| `SMTP_FROM` | Optional | Sender email header. | `Mellosoft <orders@mellosoft.in>` |
