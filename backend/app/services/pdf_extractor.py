import fitz  # PyMuPDF
import io

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts text from a PDF file provided as bytes.
    Works in-memory - no file path needed.
    """
    print(f"PDF extraction started. Bytes received: {len(file_bytes)}")
    
    if not file_bytes or len(file_bytes) == 0:
        raise ValueError("Empty file received")
    
    text = ""
    try:
        # Ensure we have valid bytes
        if isinstance(file_bytes, str):
            file_bytes = file_bytes.encode('latin-1')
        
        # Open PDF directly from bytes stream
        pdf_document = fitz.open(stream=io.BytesIO(file_bytes), filetype="pdf")
        
        print(f"PDF opened. Pages: {pdf_document.page_count}")
        
        # Extract text from each page
        for page_num in range(pdf_document.page_count):
            page = pdf_document.load_page(page_num)
            page_text = page.get_text()
            text += page_text
            print(f"Page {page_num + 1}: {len(page_text)} chars extracted")
        
        pdf_document.close()
        
        if not text.strip():
            print("Warning: PDF contains no extractable text (might be scanned image)")
            raise ValueError("No text found in PDF. The file might be a scanned image requiring OCR.")
        
        print(f"Total text extracted: {len(text)} chars")
        return text
        
    except ValueError:
        raise
    except Exception as e:
        print(f"PDF extraction error: {type(e).__name__}: {str(e)}")
        raise ValueError(f"Failed to read PDF: {str(e)}")
