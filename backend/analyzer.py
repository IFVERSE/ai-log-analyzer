from dotenv import load_dotenv
from groq import Groq
import json
import os

load_dotenv()

def analyze_logs(log_content: str) -> dict:

    api_key = os.environ.get("GROQ_API_KEY")

    if not api_key:
        raise ValueError("GROQ_API_KEY is not set!")

    client = Groq(api_key=api_key)

    prompt = f"""You are an expert software engineer analyzing application logs.

Analyze the following logs and return a JSON response with exactly these fields:
1. "summary": A 2-3 sentence plain-English summary
2. "errors": A list of errors, each with "line", "type", "message", "severity" (critical/warning/info)
3. "root_cause": The most likely root cause
4. "recommended_fixes": A list of fix suggestions
5. "patterns": A list of recurring patterns

Logs:
{log_content[:8000]}

Respond ONLY with valid JSON. No markdown, no extra text.
Example format:
{{
  "summary": "...",
  "errors": [{{"line": 1, "type": "...", "message": "...", "severity": "critical"}}],
  "root_cause": "...",
  "recommended_fixes": ["fix 1", "fix 2"],
  "patterns": ["pattern 1"]
}}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=2000
    )

    raw_response = response.choices[0].message.content.strip()

    # Clean response in case model adds markdown
    if raw_response.startswith("```"):
        raw_response = raw_response.split("```")[1]
        if raw_response.startswith("json"):
            raw_response = raw_response[4:]
        raw_response = raw_response.strip()

    return json.loads(raw_response)