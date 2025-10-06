# this doc describe how quiz is generated.

## Objective: this script is used to generate quiz from a given content. The content is stored in "CKN book content" folder, there are 21 files in the folder. Each file generate 10 questions 

### 

要求：

1. 每題有4個選項（A、B、C、D）

2. 清楚標註正確答案

3. 題目要測試對核心概念的理解，不只是文字記憶

4. 難度適中，適合一般讀者

5. 提供簡短的答案解釋

6. 嚴格返回JSON格式，不要有markdown代碼塊或其他文字



{

  "questions": [

{

"options": [

"A. 食物的味道",

"B. 營養素與健康的關係",

"C. 烹飪技巧",

"D. 食物保存方法"

],

"question": "營養學的主要研究對象是什麼？",

"explanation": "營養學主要研究營養素與人體健康的關係。",

"correct_answer": "B"

},

{

"options": [

"A. 成為廚師",

"B. 改善健康狀況",

"C. 減肥",

"D. 賺錢"

],

"question": "學習營養學最重要的目的是什麼？",

"explanation": "學習營養學最重要的目的是改善個人和社會的健康狀況。",

"correct_answer": "B"

},

{

"options": [

"A. 只在書本上學習",

"B. 應用到日常飲食中",

"C. 只告訴別人",

"D. 忽略實踐"

],

"question": "營養學知識應該如何應用？",

"explanation": "營養學知識最重要的是能夠應用到日常飲食生活中。",

"correct_answer": "B"

}

]

}