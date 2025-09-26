# ☁️ Cloudinary Setup for Video Storage

## **Why Cloudinary is Better**

✅ **Unlimited Storage** - No file size limits  
✅ **Global CDN** - Fast video delivery worldwide  
✅ **Automatic Optimization** - Video compression and format conversion  
✅ **Reliable** - 99.9% uptime guarantee  
✅ **Free Tier** - 25GB storage + 25GB bandwidth/month  
✅ **No Server Storage** - Keeps your Render instance lightweight  
✅ **Secure URLs** - Automatic HTTPS and access control  

---

## **Step 1: Create Cloudinary Account**

1. **Go to [Cloudinary.com](https://cloudinary.com)**
2. **Sign up for a free account**
3. **Verify your email**
4. **Go to Dashboard**

---

## **Step 2: Get Your Credentials**

From your Cloudinary Dashboard:

1. **Cloud Name**: Found in the "Product Environment Credentials" section
2. **API Key**: Found in the "Product Environment Credentials" section  
3. **API Secret**: Found in the "Product Environment Credentials" section

**Example:**
```
Cloud Name: dq8h8h8h8
API Key: 123456789012345
API Secret: abcdefghijklmnopqrstuvwxyz123456
```

---

## **Step 3: Update Environment Variables**

### **Backend (.env)**
```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dq8h8h8h8
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

### **Render Environment Variables**
In your Render dashboard, add these environment variables:

```
CLOUDINARY_CLOUD_NAME=dq8h8h8h8
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

---

## **Step 4: Install Dependencies**

```bash
cd backend
npm install cloudinary multer-storage-cloudinary
```

---

## **Step 5: How It Works**

### **Before (Local Storage):**
```
Video uploaded → Stored on server → URL: http://localhost:5000/uploads/demos/video.mp4
```

### **After (Cloudinary):**
```
Video uploaded → Stored on Cloudinary → URL: https://res.cloudinary.com/your-cloud/video/upload/v1234567890/task-manager/demos/video.mp4
```

---

## **Step 6: Benefits You'll Get**

### **🚀 Performance**
- **Global CDN**: Videos load fast worldwide
- **Automatic Optimization**: Videos compressed for web
- **Multiple Formats**: Automatic format conversion

### **💾 Storage**
- **Unlimited**: No storage limits on your server
- **Reliable**: 99.9% uptime guarantee
- **Secure**: Automatic HTTPS URLs

### **🔧 Management**
- **Dashboard**: View all uploaded videos
- **Analytics**: Track video usage
- **Transformations**: Resize, crop, optimize on-the-fly

---

## **Step 7: Video URL Examples**

### **Development:**
```
https://res.cloudinary.com/dq8h8h8h8/video/upload/v1234567890/task-manager/demos/demo-video.mp4
```

### **Production:**
```
https://res.cloudinary.com/dq8h8h8h8/video/upload/v1234567890/task-manager/demos/demo-video.mp4
```

**Both URLs work the same!** No more localhost issues.

---

## **Step 8: Testing**

### **1. Test Upload**
```bash
# Test video upload endpoint
curl -X POST https://task-manager-backend.onrender.com/api/demos/upload \
  -F "file=@test-video.mp4" \
  -F "title=Test Video" \
  -F "description=Testing Cloudinary upload"
```

### **2. Check Response**
```json
{
  "success": true,
  "message": "Demo uploaded successfully",
  "demo": {
    "id": "1234567890",
    "title": "Test Video",
    "fileUrl": "https://res.cloudinary.com/dq8h8h8h8/video/upload/v1234567890/task-manager/demos/test-video.mp4",
    "status": "under_review"
  }
}
```

### **3. Test Video Playback**
- Copy the `fileUrl` from the response
- Paste it in a browser
- Video should play directly

---

## **Step 9: Cloudinary Dashboard**

### **Access Your Videos**
1. **Go to [Cloudinary Dashboard](https://cloudinary.com/console)**
2. **Click "Media Library"**
3. **Navigate to "task-manager/demos" folder**
4. **View all uploaded videos**

### **Video Management**
- **View**: Click any video to preview
- **Download**: Download original or optimized versions
- **Delete**: Remove videos you don't need
- **Transform**: Apply transformations (resize, crop, etc.)

---

## **Step 10: Free Tier Limits**

### **What's Included (Free)**
- **25GB Storage**
- **25GB Bandwidth/month**
- **Unlimited Transformations**
- **Basic Analytics**

### **When You Need to Upgrade**
- **More Storage**: $89/month for 100GB
- **More Bandwidth**: $89/month for 1TB
- **Advanced Features**: $99/month for premium

### **For Most Projects**
The free tier is sufficient for:
- **~1000 videos** (25MB each)
- **~1000 views/month** (25MB each)
- **Small to medium** applications

---

## **Step 11: Security**

### **Secure URLs**
- **HTTPS**: All URLs are HTTPS by default
- **Access Control**: Videos are private by default
- **Signed URLs**: Optional for time-limited access

### **Best Practices**
- **Keep API Secret**: Never expose in frontend code
- **Use Environment Variables**: Store credentials securely
- **Regular Cleanup**: Delete old/unused videos

---

## **Step 12: Troubleshooting**

### **Common Issues**

**1. "Invalid Cloudinary credentials"**
- **Check**: Environment variables are set correctly
- **Check**: Credentials are copied correctly
- **Check**: No extra spaces in values

**2. "File too large"**
- **Check**: File size limit in multer configuration
- **Check**: Cloudinary free tier limits
- **Solution**: Compress video before upload

**3. "Upload failed"**
- **Check**: Internet connection
- **Check**: Cloudinary service status
- **Check**: File format is supported

### **Debug Commands**
```bash
# Check environment variables
echo $CLOUDINARY_CLOUD_NAME
echo $CLOUDINARY_API_KEY

# Test Cloudinary connection
node -e "const cloudinary = require('cloudinary'); console.log(cloudinary.config())"
```

---

## **Step 13: Migration from Local Storage**

### **If You Have Existing Videos**
1. **Download** videos from your current storage
2. **Upload** them to Cloudinary manually
3. **Update** database URLs to Cloudinary URLs
4. **Test** that all videos play correctly

### **Script to Migrate**
```javascript
// Migration script (run once)
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

const migrateVideos = async () => {
  const uploadsDir = 'uploads/demos';
  const files = fs.readdirSync(uploadsDir);
  
  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      folder: 'task-manager/demos'
    });
    
    console.log(`Uploaded ${file}: ${result.secure_url}`);
  }
};

migrateVideos();
```

---

## **🎉 Result**

After setup, your video uploads will:

1. **Upload directly to Cloudinary**
2. **Get a secure, global URL**
3. **Play fast worldwide**
4. **Never fill up your server storage**
5. **Work the same in development and production**

**No more localhost URL issues!** 🚀
