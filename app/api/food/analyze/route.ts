import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if Gemini API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured');
      return NextResponse.json(
        { error: 'AI service not configured. Please contact administrator.' },
        { status: 500 }
      );
    }

    // Get image from request
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Create prompt for food detection
    const prompt = `Analyze this food image and identify all food items visible.

For each food item, provide:
1. The name of the food (in Traditional Chinese 繁體中文)
2. An estimated portion size (in grams or common measurements like "1碗", "1片", etc.)
3. A brief description (in Traditional Chinese)

Return as JSON in this exact format:
[
  {
    "name": "白飯",
    "portion": "1碗 (約200g)",
    "description": "蒸白米飯"
  },
  {
    "name": "烤雞胸肉",
    "portion": "1塊 (約150g)",
    "description": "烤雞胸肉"
  }
]

Important:
- Use Traditional Chinese (繁體中文) for all text
- Be specific about portion sizes
- If you can't identify a food clearly, still make your best estimate
- Limit to maximum 10 food items

Only return the JSON array, no additional text.`;

    // Generate content
    const result = await model.generateContent([
      {
        inlineData: {
          data: image,
          mimeType: 'image/png',
        },
      },
      prompt,
    ]);

    const response = result.response;
    let responseText = response.text();

    console.log('Gemini raw response:', responseText);

    // Parse response (handle markdown code blocks)
    if (responseText.includes('```json')) {
      responseText = responseText.split('```json')[1].split('```')[0];
    } else if (responseText.includes('```')) {
      responseText = responseText.split('```')[1].split('```')[0];
    }

    // Clean up any remaining markdown or whitespace
    responseText = responseText.trim();

    // Parse JSON
    let foods;
    try {
      foods = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
      throw new Error('Failed to parse AI response');
    }

    // Validate response structure
    if (!Array.isArray(foods)) {
      throw new Error('Invalid response format from AI');
    }

    // Ensure all foods have required fields
    foods = foods.map((food: any) => ({
      name: food.name || '未知食物',
      portion: food.portion || '未知份量',
      description: food.description || '',
    }));

    return NextResponse.json({ foods }, { status: 200 });

  } catch (error) {
    console.error('API POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

