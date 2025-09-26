# 🚀 Quick Setup Guide

## **✅ Dependencies Installed Successfully!**

All required packages are now installed:
- ✅ `cloudinary` - For video storage
- ✅ `multer-storage-cloudinary` - For file uploads
- ✅ `cookie-parser` - For cookie handling
- ✅ All other dependencies

## **🔧 Next Steps:**

### **1. Set Up Environment Variables**

Create a `.env` file in the `backend` folder:

```bash
# Copy the example file
cp env.example .env
```

Then edit `.env` and add your Cloudinary credentials:

```env
# Cloudinary Configuration (Get these from cloudinary.com)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Other required variables
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your-super-secret-jwt-key-here
FRONTEND_URL=http://localhost:5173
```

### **2. Get Cloudinary Credentials**

1. **Go to [cloudinary.com](https://cloudinary.com)**
2. **Sign up for free account**
3. **Go to Dashboard**
4. **Copy your credentials:**
   - Cloud Name
   - API Key
   - API Secret

### **3. Test the Setup**

```bash
# Test Cloudinary configuration
node test-cloudinary.js

# Start the server
npm start
```

### **4. Test Video Upload**

1. **Start your frontend** (`npm run dev` in frontend folder)
2. **Go to Trainee Demo Management**
3. **Try uploading a video**
4. **Check if it uploads to Cloudinary**

## **🎯 What Happens Now:**

- **Videos upload directly to Cloudinary** ☁️
- **No more localhost URLs** 🌍
- **Global CDN for fast loading** ⚡
- **Unlimited storage** 💾

## **🚨 If You Get Errors:**

**"Cloudinary not configured"**
- Check your `.env` file has the right credentials
- Make sure you copied them correctly from Cloudinary dashboard

**"Cannot find module"**
- Run `npm install` in the backend folder

**"Database connection failed"**
- Make sure MongoDB is running
- Check your MONGODB_URI in `.env`

## **🎉 Success!**

Once everything is working, your videos will be stored in the cloud and accessible from anywhere! 🚀
