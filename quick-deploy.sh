#!/bin/bash
# Quick deployment to EC2 - Run from your local machine

# Configuration
EC2_USER="ubuntu"
EC2_KEY="your-key.pem"
EC2_HOST="your-ec2-ip"
APP_PATH="/var/www/deltarray"

echo "🚀 Starting deployment to $EC2_HOST..."

# Push to GitHub
echo "📤 Pushing code to GitHub..."
git add .
git commit -m "Deployment: $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main

# SSH and deploy
echo "🔄 Running deployment on EC2..."
ssh -i $EC2_KEY $EC2_USER@$EC2_HOST << 'EOF'
  cd /var/www/deltarray
  git pull origin main
  cd backend && npm install --production
  cd ../frontend && npm run build
  cd ../backend
  pm2 restart deltarray-backend
  sudo systemctl reload nginx
  echo "✅ Deployment complete!"
EOF

echo "🎉 Done! App running at http://$EC2_HOST"
