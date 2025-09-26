#!/bin/bash

echo "🚀 Task Manager Deployment Setup"
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "frontend" ] && [ ! -d "backend" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📁 Setting up backend for Render deployment..."

# Create backend .env file
cat > backend/.env << EOF
NODE_ENV=production
PORT=10000
BASE_URL=https://task-manager-backend.onrender.com
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager
JWT_SECRET=your-super-secret-jwt-key-here-$(date +%s)
MAX_FILE_SIZE=50MB
ALLOWED_FILE_TYPES=video/mp4,video/avi,video/mov
FRONTEND_URL=https://task-manager-frontend.vercel.app
EOF

echo "✅ Backend .env file created"

# Create frontend .env file
cat > frontend/task-manager/.env << EOF
VITE_API_URL=https://task-manager-backend.onrender.com
EOF

echo "✅ Frontend .env file created"

# Create uploads directory
mkdir -p backend/uploads/demos
echo "✅ Uploads directory created"

echo ""
echo "🎯 Next Steps:"
echo "1. Update MongoDB URI in backend/.env with your actual connection string"
echo "2. Push code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Ready for deployment'"
echo "   git push origin main"
echo "3. Deploy backend to Render: https://render.com"
echo "4. Deploy frontend to Vercel: https://vercel.com"
echo ""
echo "📖 See RENDER_VERCEL_DEPLOYMENT.md for detailed instructions"
echo ""
echo "🎉 Setup complete!"
