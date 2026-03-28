import os
from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel
from typing import List
from app.models.mcq import MCQListResponse, MCQItem

load_dotenv()
API_KEY = os.getenv("API_KEY")

# Initialize the client.
client = genai.Client(api_key=API_KEY)

def generate_mcqs_from_text(text: str, num_questions: int) -> List[MCQItem]:
    """
    Generates structured MCQs from provided study material text 
    using Gemini API with Structured Outputs.
    """
    prompt = f"""
You are an expert educator. Extract strictly {num_questions} multiple-choice questions from the provided study material.
Ensure the questions represent key concepts in the text and do not hallucinate outside the given text.

ENFORCE STRICT FORMAT for your internal thought process and output formatting:
Each MCQ must be formatted exactly like this:
1. Question text
A) Option
B) Option
C) Option
D) Option
Answer: X

RULES:
- Always include "Answer: X"
- X must be A, B, C, or D
- Do NOT skip answer line
- Do NOT change format

Study Material:
{text}
"""
    
    # We use gemini-2.5-flash which is very fast and capable of extracting structured JSON
    # We pass the desired Schema to ensure strictly matching structure
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=genai.types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=MCQListResponse,
            temperature=0.2, # Low temperature for factual extraction
        ),
    )
    
    # The SDK handles validating the output against the schema
    import json
    try:
        if hasattr(response, 'parsed') and response.parsed:
            return response.parsed.mcqs
        else:
            return MCQListResponse.model_validate_json(response.text).mcqs
    except Exception as e:
        raise ValueError(f"Failed to parse structurally valid MCQs from Gemini: {str(e)}")

