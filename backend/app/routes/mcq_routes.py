from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from typing import List

from app.models.mcq import MCQItem, ParseRequest, GenerateRequest, AIGenerateRequest, ExtractTextResponse
from app.services.parser import parse_mcq_text
from app.services.docx_generator import generate_docx
from app.services.pdf_extractor import extract_text_from_pdf
from app.services.ai_generator import generate_mcqs_from_text

router = APIRouter()

@router.post("/upload-material", response_model=ExtractTextResponse)
async def upload_material(file: UploadFile = File(...)):
    """
    Accepts a PDF or text file and extracts the raw text.
    All processing done in-memory - works with ngrok.
    """
    try:
        print(f"File received: {file.filename}")
        
        # Read file content as bytes
        content = await file.read()
        print(f"Content size: {len(content)} bytes")
        
        if not content or len(content) == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded")
        
        # Determine file type
        filename = file.filename or ""
        filename_lower = filename.lower()
        
        if filename_lower.endswith(".pdf"):
            print("Processing as PDF")
            text = extract_text_from_pdf(content)
        else:
            print("Processing as text file")
            try:
                text = content.decode("utf-8")
            except UnicodeDecodeError:
                text = content.decode("latin-1")
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted from the file")
        
        print(f"Text extracted: {len(text)} characters")
        return ExtractTextResponse(text=text)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Upload error: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Failed to extract text: {str(e)}")

@router.post("/generate-mcqs", response_model=List[MCQItem])
async def generate_ai_mcqs(request: AIGenerateRequest):
    """
    Takes study material text and requested number of questions.
    Generates structured MCQs using Gemini AI.
    """
    try:
        mcqs = generate_mcqs_from_text(request.text, request.num_questions)
        return mcqs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Generation failed: {str(e)}")


@router.post("/parse", response_model=List[MCQItem])
async def parse_text(request: ParseRequest):
    """
    Takes raw text input and returns parsed structured MCQs.
    """
    try:
        parsed_mcqs = parse_mcq_text(request.text)
        return parsed_mcqs
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/generate")
async def generate_document(request: GenerateRequest):
    """
    Takes a structured list of MCQs and returns a downloadable .docx file.
    """
    try:
        if not request.mcqs:
            raise ValueError("No MCQs provided for generation.")

        # Generate docx byte stream
        file_stream = generate_docx(request.mcqs, request.title, request.mode)
        
        headers = {
            "Content-Disposition": f'attachment; filename="mcq_assignment.docx"'
        }

        return StreamingResponse(
            file_stream, 
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers=headers
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
