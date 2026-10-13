# Hostinger KVM 1 VPS Deployment Guide

This guide covers complete deployment and operational configuration for Mellosoft on a **Hostinger KVM 1 VPS** running **Ubuntu 24.04 LTS**.

---

## 1. Hostinger KVM 1 Server Profile & Resource Strategy

- **Plan:** Hostinger KVM 1
- **vCPU:** 1 Core
- **RAM:** 1 GB - 2 GB (Resource-constrained)
- **Storage:** 20 GB - 50 GB NVMe SSD
- **Bandwidth:** 1 TB - 4 TB
- **OS Recommended:** Ubuntu 24.04 LTS 64-bit

### Resource Optimization Strategy:
Because KVM 1 has limited physical RAM, running Next.js + PostgreSQL + Nginx simultaneously requires careful tuning:
1. **Configure a 2GB Swap File:** Protects the Linux kernel OOM (Out Of Memory) killer from terminating processes during peak memory spikes.
2. **PostgreSQL Tuned for Low Memory:** `shared_buffers=128MB`, `max_connections=50`.
3. **Next.js Standalone Build:** Emits a compact, pre-bundled Node server without bloated dev dependencies.
4. **Direct Static Asset Serving:** Nginx directly serves `/uploads/` and caches `/_next/static/` to minimize Node.js CPU/RAM usage.

---

## 2. Initial VPS Provisioning Steps (When Setup is Complete in hPanel)

Once Hostinger hPanel status changes from *Pending setup* to *Active*:

### Step 1: Connect via SSH
```bash
ssh root@YOUR_SERVER_IP
```

### Step 2: System Update & Essential Packages
```bash
apt update && apt upgrade -y
apt install -y curl wget git ufw htop fail2ban ca-certificates gnupg
```

### Step 3: Configure 2GB Swap Space
```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Tune swap aggressiveness for web server
sysctl vm.swappiness=10
echo 'vm.swappiness=10' >> /etc/sysctl.conf
```

### Step 4: Configure UFW Firewall
```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable
```

### Step 5: Install Docker & Docker Compose
```bash
# Add official Docker repository
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable --now docker
```

---

## 3. Clone Repository & Configure Environment

### Step 1: Clone Repository on Branch `Backend_hostinger`
```bash
mkdir -p /opt/mellosoft
git clone -b Backend_hostinger https://github.com/gohut/mellosoft.git /opt/mellosoft
cd /opt/mellosoft
```

### Step 2: Create Production `.env`
```bash
cp .env.example .env
nano .env
```
Fill in the following values:
```env
NODE_ENV=production
PORT=3000
APP_URL=https://your-domain.com

# Generate with: openssl rand -hex 32
SESSION_SECRET=paste_generated_secret_here

# PostgreSQL
POSTGRES_DB=mellosoft
POSTGRES_USER=mellosoft_user
# Generate with: openssl rand -base64 24
POSTGRES_PASSWORD=paste_generated_password_here

DATABASE_URL=postgresql://mellosoft_user:paste_generated_password_here@postgres:5432/mellosoft?schema=public
```

---

## 4. SSL Certificate Setup (Let's Encrypt Certbot)

For your domain (e.g., `mellosoft.in`):

```bash
# Point DNS A records for mellosoft.in and www.mellosoft.in to YOUR_SERVER_IP in hPanel DNS manager

# Install Certbot
apt install -y certbot

# Obtain certificate in standalone mode before starting Nginx
certbot certonly --standalone -d your-domain.com -d www.your-domain.com --non-interactive --agree-tos -m admin@your-domain.com

# Copy certificates to the Nginx volume path
mkdir -p /opt/mellosoft/nginx/ssl
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /opt/mellosoft/nginx/ssl/
cp /etc/letsencrypt/live/your-domain.com/privkey.pem /opt/mellosoft/nginx/ssl/
```

---

## 5. Build, Migrate, & Launch

Run the deployment script:
```bash
chmod +x scripts/*.sh
./scripts/deploy.sh
```

Or manually:
```bash
# 1. Build and start database
docker compose up -d postgres

# 2. Wait 5s, then run database migrations & initial seed
docker compose run --rm web npx prisma migrate deploy
docker compose run --rm web node prisma/seed.mjs

# 3. Start web application and Nginx reverse proxy
docker compose up -d web nginx

# 4. Verify status
docker compose ps
curl http://localhost:3000/api/health
```

---

## 6. Automated Process Supervision & Reboot Persistence

Docker Compose containers configured with `restart: unless-stopped` start automatically on server reboots.

To verify systemd integration:
```bash
# Verify docker service is enabled on boot
systemctl is-enabled docker
# Output: enabled
```

---

## 7. Automated Daily Backups

Set up a daily cron job to run `scripts/backup.sh` at 02:00 AM UTC:

```bash
crontab -e
```
Add line:
```cron
0 2 * * * /opt/mellosoft/scripts/backup.sh >> /var/log/mellosoft_backup.log 2>&1
```
