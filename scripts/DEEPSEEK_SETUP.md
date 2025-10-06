# DeepSeek API Setup Guide

## 1. Get DeepSeek API Key

1. Go to [DeepSeek Platform](https://platform.deepseek.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key (starts with `sk-`)

## 2. Add API Key to Environment

Add your DeepSeek API key to your `.env` file:

```bash
# Add this line to your .env file
DEEPSEEK_API_KEY=sk-your-api-key-here
```

## 3. Install Required Dependencies

```bash
pip install requests
```

## 4. Run DeepSeek Quiz Generation

```bash
cd scripts
python generate_quizzes_deepseek.py
```

## 5. DeepSeek vs Gemini Comparison

| Feature | DeepSeek | Gemini |
|---------|----------|---------|
| **Cost** | ~$0.50-1.00 | ~$1-2 |
| **Speed** | ~3-5 minutes | ~5-7 minutes |
| **Rate Limits** | More generous | Stricter |
| **Model** | deepseek-chat | gemini-2.5-pro |
| **API Format** | OpenAI-compatible | Google-specific |

## 6. Troubleshooting

### Common Issues:

1. **API Key Error**: Make sure `DEEPSEEK_API_KEY` is set in `.env`
2. **Rate Limiting**: Script includes 1-second delays between calls
3. **JSON Parsing**: DeepSeek responses are validated and cleaned
4. **Network Issues**: Script includes timeout and error handling

### Error Messages:

- `Missing environment variables`: Check your `.env` file
- `API request error`: Check your internet connection and API key
- `Failed to decode JSON`: DeepSeek response format issue (rare)

## 7. Expected Output

```
==================================================
  Generate Quizzes with DeepSeek AI
==================================================

📚 Fetching book content from Supabase...

Found 21 days of content
Generating quizzes using DeepSeek (this takes ~3-5 minutes)...

📝 Day  1: 第1課：營養學，一個令人著迷的話題...
    ✓ Saved 3 questions

📝 Day  2: 第2課：怎樣吃早餐更管飽？多加點蛋白質吧！...
    ✓ Saved 3 questions

...

==================================================
✅ Quiz generation complete!
   Success: 21/21 days
==================================================
```
