# Food Image Recognition Implementation Guide
## Based on Google's Spatial Understanding App

This guide shows you **exactly** how to implement food image recognition using the same approach as Google's spatial-understanding app.

---

## 📋 Overview

The spatial-understanding app uses **Gemini 2.5 Flash** (or 2.0 Flash for 3D) with vision capabilities to detect objects in images. We'll adapt this for food recognition.

---

## 🔑 Key Components from Spatial Understanding App

### **1. API Setup**

The app uses `@google/genai` library:

```typescript
import {GoogleGenAI} from '@google/genai';

// Initialize with API key
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
```

**For your app**, you'll need:
- Google AI Studio account
- Gemini API key
- Install the library: `npm install @google/genai`

---

### **2. Image Preparation**

The app resizes images to max 640px before sending to API (to save costs and speed):

```typescript
async function prepareImage(imageSrc: string) {
  const maxSize = 640;
  const copyCanvas = document.createElement('canvas');
  const ctx = copyCanvas.getContext('2d')!;
  
  // Load the image
  const image = await loadImage(imageSrc);
  
  // Calculate scale to fit within maxSize
  const scale = Math.min(maxSize / image.width, maxSize / image.height);
  
  // Resize canvas
  copyCanvas.width = image.width * scale;
  copyCanvas.height = image.height * scale;
  
  // Draw resized image
  ctx.drawImage(image, 0, 0, image.width * scale, image.height * scale);
  
  // Convert to base64 data URL
  return copyCanvas.toDataURL('image/png');
}
```

**Why resize?**
- Faster API response
- Lower costs (charged per pixel)
- Still accurate for food detection

---

### **3. API Call Structure**

Here's the **exact** API call structure used:

```typescript
async function detectObjects(imageDataURL: string, prompt: string) {
  const model = 'models/gemini-2.5-flash';
  
  const config = {
    temperature: 0.5,
    thinkingConfig: {thinkingBudget: 0}  // Disable thinking for spatial tasks
  };
  
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              // Remove the data URL prefix
              data: imageDataURL.replace('data:image/png;base64,', ''),
              mimeType: 'image/png'
            }
          },
          {text: prompt}
        ]
      }
    ],
    config
  });
  
  return response.text;
}
```

**Key points:**
- Use `gemini-2.5-flash` (faster, cheaper)
- Set `thinkingBudget: 0` for spatial understanding tasks (as recommended by Google)
- Send image as base64 inline data
- Include text prompt

---

### **4. Prompts for Different Detection Types**

The app uses structured prompts:

#### **2D Bounding Boxes** (objects with positions):
```typescript
const prompt = `Detect ${items}, with no more than 20 items. Output a json list where each entry contains the 2D bounding box in "box_2d" and a text label in "label".`;

// Response format:
[
  {
    "box_2d": [ymin, xmin, ymax, xmax],  // normalized to 0-1000
    "label": "apple"
  },
  ...
]
```

#### **Points** (simple location markers):
```typescript
const prompt = `Point to the ${items} with no more than 10 items. The answer should follow the json format: [{"point": <point>, "label": <label>}, ...]. The points are in [y, x] format normalized to 0-1000.`;

// Response format:
[
  {
    "point": [y, x],  // normalized to 0-1000
    "label": "banana"
  },
  ...
]
```

#### **Segmentation Masks** (detailed outlines):
```typescript
const prompt = `Give the segmentation masks for ${items}. Output a JSON list of segmentation masks where each entry contains the 2D bounding box in the key "box_2d", the segmentation mask in key "mask", and the text label in the key "label". Use descriptive labels.`;
```

---

## 🍎 **Adapted for Food Recognition**

### **Complete Frontend Implementation (React/Next.js)**

```typescript
'use client'
import {GoogleGenAI} from '@google/genai';
import {useState} from 'react';

const ai = new GoogleGenAI({apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY});

export default function FoodImageRecognition() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [detectedFoods, setDetectedFoods] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. Prepare image (resize for efficiency)
  async function prepareImage(imgSrc: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxSize = 640;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = imgSrc;
    });
  }

  // 3. Analyze food image
  async function analyzeFoodImage() {
    if (!imageSrc) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare image
      const processedImage = await prepareImage(imageSrc);
      
      // Create prompt for food detection
      const prompt = `Analyze this food image and identify all food items visible.
      
For each food item, provide:
1. The name of the food
2. An estimated portion size (e.g., "1 bowl", "100g", "1 piece")
3. A brief description

Return as JSON in this exact format:
[
  {
    "name": "white rice",
    "portion": "1 bowl (approximately 200g)",
    "description": "steamed white rice"
  },
  {
    "name": "grilled chicken",
    "portion": "1 piece (approximately 150g)",
    "description": "grilled chicken breast"
  }
]

Only return the JSON array, no additional text.`;

      // Call Gemini API
      const response = await ai.models.generateContent({
        model: 'models/gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: processedImage.replace('data:image/png;base64,', ''),
                  mimeType: 'image/png'
                }
              },
              {text: prompt}
            ]
          }
        ],
        config: {
          temperature: 0.4,  // Lower temperature for more consistent results
          thinkingConfig: {thinkingBudget: 0}
        }
      });

      let responseText = response.text;
      
      // Parse response (handle markdown code blocks)
      if (responseText.includes('```json')) {
        responseText = responseText.split('```json')[1].split('```')[0];
      }
      
      const parsedFoods = JSON.parse(responseText);
      setDetectedFoods(parsedFoods);
      
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">食物影像識別</h1>
      
      {/* Image Upload */}
      <div className="mb-6">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mb-4"
        />
        
        {imageSrc && (
          <div className="relative">
            <img 
              src={imageSrc} 
              alt="Uploaded food" 
              className="max-w-full h-auto rounded-lg shadow-md"
            />
          </div>
        )}
      </div>

      {/* Analyze Button */}
      {imageSrc && (
        <button
          onClick={analyzeFoodImage}
          disabled={isLoading}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '分析中...' : '分析食物'}
        </button>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Results Display */}
      {detectedFoods.length > 0 && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4">檢測到的食物：</h2>
          
          <div className="space-y-4">
            {detectedFoods.map((food, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{food.name}</h3>
                    <p className="text-gray-600">{food.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-blue-600">
                      {food.portion}
                    </span>
                  </div>
                </div>
                
                {/* User can edit portion */}
                <div className="mt-3">
                  <label className="block text-sm text-gray-600 mb-1">
                    實際份量：
                  </label>
                  <input
                    type="text"
                    defaultValue={food.portion}
                    className="w-full p-2 border rounded"
                    placeholder="例如：150g, 1碗, 2片"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Next: Analyze Nutrition button */}
          <button
            className="mt-6 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
            onClick={() => {/* Next step: analyze nutrition */}}
          >
            分析營養成分
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 🔧 **Backend Implementation (Python/FastAPI)**

If you want to do the AI processing on backend instead:

```python
# backend/food_recognition.py

import google.generativeai as genai
import base64
from fastapi import UploadFile, HTTPException
from PIL import Image
import io
import os

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

async def analyze_food_image(file: UploadFile):
    """
    Analyze food image using Gemini Vision API
    """
    try:
        # Read uploaded image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        
        # Resize to max 640px (cost optimization)
        max_size = 640
        ratio = min(max_size / image.width, max_size / image.height)
        if ratio < 1:
            new_size = (int(image.width * ratio), int(image.height * ratio))
            image = image.resize(new_size, Image.Resampling.LANCZOS)
        
        # Convert to bytes
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()
        
        # Initialize model
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Create prompt
        prompt = """Analyze this food image and identify all food items visible.

For each food item, provide:
1. The name of the food
2. An estimated portion size
3. A brief description

Return as JSON in this exact format:
[
  {
    "name": "white rice",
    "portion": "1 bowl (approximately 200g)",
    "description": "steamed white rice"
  }
]

Only return the JSON array, no additional text."""

        # Generate content
        response = model.generate_content(
            [prompt, {"mime_type": "image/png", "data": img_byte_arr}],
            generation_config={
                "temperature": 0.4,
                "max_output_tokens": 2048,
            }
        )
        
        # Parse response
        response_text = response.text
        
        # Handle markdown code blocks
        if '```json' in response_text:
            response_text = response_text.split('```json')[1].split('```')[0]
        
        import json
        foods = json.loads(response_text.strip())
        
        return {"foods": foods, "success": True}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing image: {str(e)}")


# API endpoint
from fastapi import APIRouter

router = APIRouter()

@router.post("/analyze-food")
async def analyze_food(file: UploadFile):
    """
    Endpoint to analyze food image
    """
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    result = await analyze_food_image(file)
    return result
```

---

## 💡 **Key Learnings from Spatial Understanding App**

### **1. Model Selection**
- Use `gemini-2.5-flash` for most spatial tasks (faster, cheaper)
- Use `gemini-2.0-flash` only for 3D bounding boxes
- **For food recognition**: `gemini-2.5-flash` is perfect

### **2. Configuration**
```typescript
{
  temperature: 0.4-0.5,  // Lower = more consistent
  thinkingConfig: {thinkingBudget: 0}  // Disable for spatial tasks
}
```

### **3. Image Optimization**
- **Always resize to 640px max** before sending
- Use canvas for resizing (better quality)
- Convert to PNG for consistency

### **4. Prompt Engineering**
- Be **very specific** about JSON format
- Include **exact structure** you want back
- Limit number of items (e.g., "no more than 20")
- Use `normalized to 0-1000` for coordinates

### **5. Response Parsing**
```typescript
// Handle markdown code blocks
if (response.includes('```json')) {
  response = response.split('```json')[1].split('```')[0];
}
const parsed = JSON.parse(response);
```

---

## 📊 **Cost Estimation**

Based on Gemini pricing (as of 2024):

- **Gemini 2.5 Flash**: $0.001 per image (up to 640x640)
- **Resizing to 640px**: Keeps you in cheapest tier
- **For 100 users, 1 image/day**: ~$3/month

**Cost optimization tips:**
1. Resize images to 640px max ✅
2. Use gemini-2.5-flash (not pro) ✅
3. Cache common food items
4. Batch process when possible

---

## 🎯 **Next Steps: Add Nutrition Analysis**

After detecting foods, analyze nutrition:

```typescript
async function analyzeNutrition(foods: Food[]) {
  const prompt = `Given these foods and portions:
${JSON.stringify(foods, null, 2)}

Analyze the nutritional content and categorize into 7 groups:
1. Carbohydrates
2. Proteins  
3. Fats
4. Vitamins
5. Minerals
6. Water
7. Fiber

Provide:
- Approximate calories
- Breakdown by nutrition category
- Health suggestions for balance

Return as JSON.`;

  const response = await ai.models.generateContent({
    model: 'models/gemini-2.5-flash',
    contents: [{
      role: 'user',
      parts: [{text: prompt}]
    }],
    config: {temperature: 0.5}
  });

  return JSON.parse(response.text);
}
```

---

## 📦 **Required Packages**

### **Frontend (Next.js)**
```json
{
  "dependencies": {
    "@google/genai": "^0.21.0",
    "react": "^18.2.0",
    "next": "^14.0.0"
  }
}
```

### **Backend (Python/FastAPI)**
```txt
google-generativeai==0.3.2
fastapi==0.109.0
uvicorn==0.27.0
pillow==10.2.0
python-multipart==0.0.6
```

---

## 🔐 **Environment Variables**

### **Frontend (.env.local)**
```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

### **Backend (.env)**
```bash
GEMINI_API_KEY=your_api_key_here
```

**Get your API key**: https://ai.google.dev/

---

## ✅ **Testing Checklist**

- [ ] Image upload works
- [ ] Image resizes to 640px
- [ ] API call succeeds
- [ ] JSON parsing handles markdown code blocks
- [ ] Multiple food items detected correctly
- [ ] Portion estimates are reasonable
- [ ] User can edit portions
- [ ] Handles errors gracefully
- [ ] Loading states show properly
- [ ] Works on mobile (camera upload)

---

## 🚀 **Production Considerations**

1. **Rate Limiting**: Gemini has rate limits, implement queuing
2. **Error Handling**: Show friendly messages to users
3. **Image Validation**: Check file size, type before processing
4. **Caching**: Cache common foods to reduce API calls
5. **Monitoring**: Track API usage and costs
6. **Fallback**: Have manual entry option if API fails

---

## 📚 **References**

- **Google Spatial Understanding App**: https://ai.studio/apps/bundled/spatial-understanding
- **Gemini API Docs**: https://ai.google.dev/docs
- **@google/genai Library**: https://www.npmjs.com/package/@google/genai
- **Gemini Pricing**: https://ai.google.dev/pricing

---

## 💬 **Summary**

The spatial-understanding app shows us that food image recognition is:

1. **Straightforward** - Just ~100 lines of code
2. **Affordable** - ~$0.001 per image
3. **Accurate** - Gemini Vision is very good at identifying objects
4. **Fast** - Responses in 1-3 seconds

**Key takeaway**: You don't need complex ML models or training. Use Gemini's pre-trained vision capabilities with good prompt engineering!

---

## 🎓 **For Beginners**

If this seems complex, start with:

1. **Week 1**: Get API key, test in Google AI Studio web interface
2. **Week 2**: Build simple image upload page
3. **Week 3**: Connect to Gemini API (use frontend code above)
4. **Week 4**: Add nutrition analysis

Or consider **hiring a developer for $500-1000** to build this specific feature, then you can maintain it.

