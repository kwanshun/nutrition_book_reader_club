# Food Recognition Setup Guide

## 🔑 Gemini API Key Configuration

The food recognition feature uses Google's Gemini AI to analyze food images. You need to configure your API key before this feature will work.

### Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy your API key

### Step 2: Add API Key to Environment Variables

#### For Local Development:

Create or edit `/frontend/.env.local`:

```bash
cd frontend
touch .env.local
```

Add this line (replace with your actual key):

```bash
GEMINI_API_KEY=your_api_key_here
```

#### For Production (Vercel):

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add new variable:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your API key
   - **Scope**: Production, Preview, Development

### Step 3: Restart Development Server

After adding the API key, restart your development server:

```bash
cd frontend
npm run dev
```

---

## 📊 Features Implemented

### ✅ What Works Now:

1. **Image Upload**
   - Camera capture on mobile devices
   - Photo library selection
   - File validation (type and size)

2. **Image Processing**
   - Auto-resize to 640px (cost optimization)
   - Canvas-based image preparation
   - Base64 encoding

3. **AI Analysis**
   - Gemini 2.0 Flash for food detection
   - Traditional Chinese output (繁體中文)
   - Identifies multiple food items
   - Estimates portion sizes

4. **Results Display**
   - Shows detected foods with descriptions
   - Editable portion sizes
   - Image thumbnail
   - Save functionality (UI ready)

### ⏳ Future Enhancements:

1. **Database Integration**
   - Save food logs to `food_logs` table
   - Food items history
   - Date-based filtering

2. **Nutrition Analysis**
   - Calculate calories
   - Break down into 7 nutrition categories
   - Health suggestions

3. **Progress Tracking**
   - Daily food intake summary
   - Nutrition balance charts
   - Integration with `/records` dashboard

---

## 💰 Cost Estimation

Based on Gemini API pricing:

- **Model**: Gemini 2.0 Flash Exp (currently free during preview)
- **Image size**: 640x640px (optimized)
- **Expected cost**: $0.001-0.002 per analysis once pricing is active
- **For 100 users, 1 photo/day**: ~$3-6/month

---

## 🧪 Testing

### Test with Sample Images:

1. Navigate to `http://localhost:3000/food`
2. Upload a food image or take a photo
3. Click "開始辨識"
4. Wait for AI analysis (typically 2-5 seconds)
5. Review results and adjust portions
6. Click "儲存記錄"

### Good Test Images:

- Plate with multiple food items
- Rice bowl with side dishes
- Fruit platter
- Sandwich or burger
- Restaurant meal

### Expected Results:

- Food names in Traditional Chinese
- Reasonable portion estimates (e.g., "1碗 (約200g)")
- Brief descriptions
- 1-10 food items detected

---

## 🐛 Troubleshooting

### Error: "AI service not configured"

**Solution**: You haven't added the Gemini API key. Follow Step 2 above.

### Error: "分析失敗，請稍後再試"

**Possible causes**:
1. Invalid API key
2. Gemini API rate limit exceeded
3. Network issues
4. Invalid image format

**Solutions**:
- Check API key in `.env.local`
- Wait a few minutes if rate limited
- Try a different image
- Check browser console for detailed error

### Error: "Failed to parse AI response"

**Possible causes**:
- Gemini returned unexpected format
- Model changed response structure

**Solutions**:
- Check server logs for raw Gemini response
- May need to adjust prompt in `/app/api/food/analyze/route.ts`

### Images Not Showing

**Solutions**:
- Check browser console for errors
- Ensure image file is < 10MB
- Try different image format (JPG, PNG)

---

## 📁 File Structure

```
frontend/
├── app/
│   ├── (dashboard)/
│   │   └── food/
│   │       └── page.tsx              # Main food page
│   └── api/
│       └── food/
│           └── analyze/
│               └── route.ts          # Gemini API integration
├── components/
│   └── food/
│       ├── FoodUploadForm.tsx        # Upload & camera UI
│       └── FoodResultDisplay.tsx     # Results display
└── .env.local                        # API keys (not in git)
```

---

## 🔐 Security Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use environment variables** for API keys, not hardcoded values
3. **Validate user authentication** before processing (already implemented)
4. **Limit file sizes** to prevent abuse (10MB max)

---

## 📚 References

- [Google AI Studio](https://makersuite.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Food Recognition Guide](./docs/food_image_recognition_guide.md)
- [Gemini Pricing](https://ai.google.dev/pricing)

---

## ✅ Quick Checklist

- [ ] Get Gemini API key from Google AI Studio
- [ ] Add `GEMINI_API_KEY` to `frontend/.env.local`
- [ ] Restart development server
- [ ] Test with a food image
- [ ] Verify results are in Traditional Chinese
- [ ] Check portion estimates are reasonable
- [ ] Test on mobile device (camera capture)

---

Need help? Check the browser console and server logs for detailed error messages.

