# 🚀 Task Manager - Production Deployment Guide

## **Video Upload URL Configuration**

### **Problem**
The current implementation generates URLs like `http://localhost:5000/uploads/demos/video.mp4` which won't work in production.

### **Solution Overview**
Configure environment variables and server settings to generate proper production URLs.

---

## **1. Environment Variables Setup**

### **Backend Environment (.env)**
Create a `.env` file in the `backend` directory:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Base URL for file uploads (CRITICAL)
BASE_URL=https://yourdomain.com
# OR for subdomain: https://api.yourdomain.com
# OR for different port: https://yourdomain.com:5000

# Database
MONGODB_URI=mongodb://localhost:27017/taskmanager
# OR for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/taskmanager

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# File Upload Settings
MAX_FILE_SIZE=50MB
ALLOWED_FILE_TYPES=video/mp4,video/avi,video/mov
```

### **Frontend Environment (.env)**
Create a `.env` file in the `frontend/task-manager` directory:

```env
# API Base URL (Vite uses VITE_ prefix)
VITE_API_URL=https://yourdomain.com
# OR for subdomain: https://api.yourdomain.com
# OR for different port: https://yourdomain.com:5000

# App Configuration
VITE_APP_NAME=Task Manager
VITE_APP_VERSION=1.0.0
```

---

## **2. Server Configuration Updates**

### **Backend Server (server.js)**
Update the server to serve static files properly:

```javascript
const express = require('express');
const path = require('path');

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS configuration for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'https://yourdomain.com',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

### **File Upload Middleware**
Update multer configuration for production:

```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads', 'demos');
    // Ensure directory exists
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024, // 50MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'video/mp4').split(',');
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'), false);
    }
  }
});
```

---

## **3. Frontend Configuration**

### **API Configuration (axiosInstance.js)**
Update the base URL configuration:

```javascript
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 60000, // 60 seconds for video uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

---

## **4. Deployment Options**

### **Option 1: Single Server Deployment**
- Deploy both frontend and backend on the same server
- Use Nginx as reverse proxy
- Serve static files directly

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend (React build)
    location / {
        root /var/www/taskmanager/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files (uploads)
    location /uploads {
        alias /var/www/taskmanager/backend/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### **Option 2: Separate Frontend/Backend Deployment**
- Frontend: Vercel, Netlify, or S3 + CloudFront
- Backend: Heroku, DigitalOcean, AWS EC2
- File Storage: AWS S3, Google Cloud Storage

**Backend Environment:**
```env
BASE_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

**Frontend Environment:**
```env
REACT_APP_API_URL=https://api.yourdomain.com/api
```

---

## **5. Cloud Storage Integration (Recommended)**

### **AWS S3 Integration**
For better scalability and reliability:

```javascript
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    key: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `demos/${uniqueSuffix}-${file.originalname}`);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  }
});

// Generate S3 URL
const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${req.file.key}`;
```

---

## **6. Security Considerations**

### **File Upload Security**
```javascript
// Validate file types
const allowedMimeTypes = ['video/mp4', 'video/avi', 'video/mov'];
if (!allowedMimeTypes.includes(file.mimetype)) {
  return res.status(400).json({ error: 'Invalid file type' });
}

// Scan for malware (optional)
const virusScan = require('clamscan');
const scanResult = await virusScan.scanFile(req.file.path);
if (!scanResult.isInfected) {
  // Process file
}
```

### **CORS Configuration**
```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://yourdomain.com',
      'https://www.yourdomain.com',
      'https://admin.yourdomain.com'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
```

---

## **7. Testing Checklist**

### **Before Deployment**
- [ ] Environment variables configured
- [ ] File upload working with production URLs
- [ ] CORS properly configured
- [ ] Database connection established
- [ ] SSL certificate installed (if using HTTPS)

### **After Deployment**
- [ ] Video uploads work from frontend
- [ ] Videos play correctly in browser
- [ ] File URLs are accessible
- [ ] Authentication works across domains
- [ ] Error handling works properly

---

## **8. Monitoring & Maintenance**

### **File Cleanup**
```javascript
// Clean up old files (run as cron job)
const cleanupOldFiles = async () => {
  const fs = require('fs');
  const path = require('path');
  
  const uploadsDir = path.join(__dirname, 'uploads', 'demos');
  const files = fs.readdirSync(uploadsDir);
  
  files.forEach(file => {
    const filePath = path.join(uploadsDir, file);
    const stats = fs.statSync(filePath);
    const ageInDays = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
    
    if (ageInDays > 90) { // Delete files older than 90 days
      fs.unlinkSync(filePath);
    }
  });
};
```

### **Health Check Endpoint**
```javascript
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

---

## **9. Quick Deployment Commands**

### **Backend Deployment**
```bash
# Install dependencies
npm install

# Set environment variables
export NODE_ENV=production
export BASE_URL=https://yourdomain.com

# Start server
npm start
```

### **Frontend Build**
```bash
# Install dependencies
npm install

# Set environment variables
export VITE_API_URL=https://yourdomain.com

# Build for production
npm run build

# Serve static files
npx serve -s dist -l 3000
```

---

## **10. Troubleshooting**

### **Common Issues**
1. **CORS Errors**: Check origin configuration
2. **File Not Found**: Verify file path and permissions
3. **Upload Timeout**: Increase timeout settings
4. **SSL Issues**: Ensure HTTPS is properly configured

### **Debug Commands**
```bash
# Check file permissions
ls -la uploads/demos/

# Test file access
curl -I https://yourdomain.com/uploads/demos/test.mp4

# Check server logs
tail -f logs/app.log
```

This configuration ensures your video uploads work correctly in production with proper URLs, security, and scalability.
