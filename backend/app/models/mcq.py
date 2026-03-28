from pydantic import BaseModel, constr
from typing import List, Optional

class MCQOption(BaseModel):
    label: str # e.g., 'A', 'B', 'C', 'D'
    text: str

class MCQItem(BaseModel):
    question: str
    options: List[str] # List of 4 strings
    correct_answer: Optional[str] = None # 'A', 'B', 'C', or 'D', or None if missing

class ParseRequest(BaseModel):
    text: str

class GenerateRequest(BaseModel):
    mcqs: List[MCQItem]
    title: str = "MCQ Assignment"
    mode: str = "full" # "full" | "no_answers" | "key"


class AIGenerateRequest(BaseModel):
    text: str # study material text
    num_questions: int = 10

class ExtractTextResponse(BaseModel):
    text: str

class MCQListResponse(BaseModel):
    mcqs: List[MCQItem]
