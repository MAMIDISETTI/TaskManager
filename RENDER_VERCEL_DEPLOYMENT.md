# 🚀 Deploy to Render (Backend) + Vercel (Frontend)

## **Backend Deployment on Render**

### **Step 1: Prepare Backend**

1. **Create a GitHub repository** and push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/task-manager.git
   git push -u origin main
   ```

2. **Ensure you have these files in your backend folder:**
   - `package.json` ✅
   - `server.js` ✅
   - `render.yaml` ✅ (created above)

### **Step 2: Deploy to Render**

1. **Go to [Render.com](https://render.com)** and sign up/login
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name**: `task-manager-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

5. **Set Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   BASE_URL=https://task-manager-backend.onrender.com
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager
   JWT_SECRET=your-super-secret-jwt-key-here
   MAX_FILE_SIZE=50MB
   ALLOWED_FILE_TYPES=video/mp4,video/avi,video/mov
   FRONTEND_URL=https://task-manager-frontend.vercel.app
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

6. **Click "Create Web Service"**
7. **Wait for deployment** (5-10 minutes)
8. **Note your backend URL**: `https://task-manager-backend.onrender.com`

---

## **Frontend Deployment on Vercel**

### **Step 1: Prepare Frontend**

1. **Update environment variables** in your frontend:
   ```bash
   # Create .env file
   echo "VITE_API_URL=https://task-manager-backend.onrender.com" > frontend/task-manager/.env
   ```

2. **Test locally:**
   ```bash
   cd frontend/task-manager
   npm install
   npm run dev
   ```

### **Step 2: Deploy to Vercel**

1. **Go to [Vercel.com](https://vercel.com)** and sign up/login
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure the project:**
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend/task-manager`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Set Environment Variables:**
   ```
   VITE_API_URL=https://task-manager-backend.onrender.com
   ```

6. **Click "Deploy"**
7. **Wait for deployment** (2-3 minutes)
8. **Note your frontend URL**: `https://task-manager-frontend.vercel.app`

---

## **Video Upload Configuration**

### **The Problem**
- **Development**: `http://localhost:5000/uploads/demos/video.mp4`
- **Production**: `https://task-manager-backend.onrender.com/uploads/demos/video.mp4`

### **The Solution**
The system is already configured to use environment variables:

**Backend (Render):**
- `BASE_URL=https://task-manager-backend.onrender.com`
- Videos will be accessible at: `https://task-manager-backend.onrender.com/uploads/demos/filename.mp4`

**Frontend (Vercel):**
- `VITE_API_URL=https://task-manager-backend.onrender.com`
- API calls will go to: `https://task-manager-backend.onrender.com/api/...`

---

## **File Storage Considerations**

### **Render Limitations**
- **Free tier**: 1GB storage
- **Files persist** but may be deleted after inactivity
- **Not ideal** for production with many videos

### **Recommended: Use Cloud Storage**

For better video storage, integrate with **AWS S3** or **Cloudinary**:

**AWS S3 Integration:**
```javascript
// In your demo controller
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Upload to S3 instead of local storage
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    key: (req, file, cb) => {
      cb(null, `demos/${Date.now()}-${file.originalname}`);
    }
  })
});

// Generate S3 URL
const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${req.file.key}`;
```

---

## **Testing Your Deployment**

### **1. Test Backend**
```bash
# Test health endpoint
curl https://task-manager-backend.onrender.com/api/health

# Test file upload endpoint
curl -X POST https://task-manager-backend.onrender.com/api/demos/upload
```

### **2. Test Frontend**
1. **Visit**: `https://task-manager-frontend.vercel.app`
2. **Login** with your credentials
3. **Upload a demo video**
4. **Check if video plays** correctly

### **3. Test Video Upload**
1. **Go to Trainee Demo Management**
2. **Click "Upload Demo"**
3. **Select a video file**
4. **Submit the form**
5. **Verify the video URL** in the response

---

## **Troubleshooting**

### **Common Issues**

**1. CORS Errors**
- **Solution**: Update CORS origin in `server.js` to include your Vercel URL

**2. Video Not Playing**
- **Check**: Video URL is accessible
- **Check**: File permissions on Render
- **Check**: File size limits

**3. Environment Variables Not Working**
- **Check**: Variables are set correctly in Render/Vercel
- **Check**: Variable names match exactly
- **Check**: Restart services after changing variables

**4. Database Connection Issues**
- **Check**: MongoDB URI is correct
- **Check**: Database is accessible from Render
- **Check**: Network security groups

### **Debug Commands**

**Backend Logs (Render):**
- Go to your Render dashboard
- Click on your service
- View "Logs" tab

**Frontend Logs (Vercel):**
- Go to your Vercel dashboard
- Click on your project
- View "Functions" tab for server logs

---

## **Production Checklist**

### **Before Going Live**
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] Database connected and working
- [ ] Video uploads working
- [ ] All API endpoints responding
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] SSL certificates working (automatic on both platforms)

### **After Going Live**
- [ ] Test all user roles (Trainee, Trainer, BOA, Master Trainer)
- [ ] Test video upload and playback
- [ ] Test file downloads
- [ ] Monitor error logs
- [ ] Set up monitoring/alerts

---

## **Costs**

### **Render (Backend)**
- **Free tier**: 750 hours/month
- **Paid tier**: $7/month for always-on

### **Vercel (Frontend)**
- **Free tier**: Unlimited static sites
- **Paid tier**: $20/month for advanced features

### **Total Cost**
- **Free**: $0/month (with limitations)
- **Paid**: $7-27/month (depending on needs)

---

## **Next Steps**

1. **Deploy backend to Render**
2. **Deploy frontend to Vercel**
3. **Test all functionality**
4. **Set up monitoring**
5. **Consider upgrading to paid tiers** for production use
6. **Implement cloud storage** for better video handling

Your Task Manager will be live and accessible from anywhere! 🎉
