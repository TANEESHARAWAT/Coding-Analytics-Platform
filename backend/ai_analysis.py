import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def analyze_mistake(code: str, language: str, verdict: str, problem_title: str, error_output: str = ""):
    prompt = f"""You are a coding mentor reviewing a student's submission.

Problem: {problem_title}
Language: {language}
Verdict: {verdict}
Error/Output (if any): {error_output}

Student's code:
{code}

In 1-2 short sentences, identify the SPECIFIC mistake pattern in this code. 
Be precise and actionable, e.g. "Missing base case in recursion causing infinite calls" 
or "Off-by-one error in loop boundary" or "Not handling empty input edge case".
Do not explain the whole problem or give the full solution. Just name the mistake pattern."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=150,
        temperature=0.3
    )

    return response.choices[0].message.content.strip()