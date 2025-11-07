#!/bin/bash
set -e

echo "🚀 Starting deployment of domainopartner.com..."

# Step 1: Update system
echo "📦 Updating system..."
sudo apt update && sudo apt upgrade -y

# Step 2: Install Node.js 20
echo "📦 Installing Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Step 3: Install pnpm
echo "📦 Installing pnpm..."
npm install -g pnpm

# Step 4: Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Step 5: Install Certbot
echo "📦 Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Step 6: Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Step 7: Clone repository
echo "📦 Cloning repository..."
cd /var/www
if [ ! -d "domainopartner" ]; then
    git clone https://github.com/ashashpachaa/domainopartner.com.git domainopartner
fi
cd domainopartner
git pull origin main

# Step 8: Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Step 9: Build project
echo "🔨 Building project..."
pnpm run build

# Step 10: Create .env file if not exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
GOOGLE_VISION_CREDENTIALS=$(cat .credentials/vision.json 2>/dev/null || echo '{}')
NODE_ENV=production
VITE_API_BASE_URL=https://domainopartner.com
EOF
fi

# Step 11: Start with PM2
echo "🚀 Starting app with PM2..."
pm2 delete domainopartner 2>/dev/null || true
pm2 start "pnpm run start" --name domainopartner --instances 1 --exec-mode fork
pm2 startup
pm2 save

# Step 12: Configure Nginx
echo "🔧 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/domainopartner.com > /dev/null << EOF
server {
    listen 80;
    server_name domainopartner.com www.domainopartner.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Enable site if not enabled
if [ ! -L /etc/nginx/sites-enabled/domainopartner.com ]; then
    sudo ln -s /etc/nginx/sites-available/domainopartner.com /etc/nginx/sites-enabled/
fi

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
sudo nginx -t && sudo systemctl restart nginx

# Step 13: Setup SSL
echo "🔒 Setting up SSL certificate..."
sudo certbot --nginx -d domainopartner.com -d www.domainopartner.com --non-interactive --agree-tos --email ashrafashash2010@gmail.com || echo "⚠️  SSL setup skipped (may already exist)"

# Step 14: Verify
echo ""
echo "✅ Deployment completed!"
echo ""
echo "Checking status..."
pm2 status
sudo systemctl status nginx --no-pager | head -20

echo ""
echo "🌐 Your app should be live at: https://domainopartner.com"
echo ""
