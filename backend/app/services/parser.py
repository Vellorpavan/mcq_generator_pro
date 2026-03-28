import re
from typing import List
from app.models.mcq import MCQItem

def parse_mcq_text(text: str) -> List[MCQItem]:
    """
    Robust parser to extract questions, options, and answers from messy real-world text.
    Handles extra whitespace, inconsistent numbering, and missing fields.
    """
    mcqs = []
    
    # Normalize text (handle \r\n and weird zero-width spaces)
    text = text.replace('\r\n', '\n').strip()
    lines = text.split('\n')
    
    current_question = None
    current_options = []
    current_answer = None # Default fallback
    
    def save_current():
        nonlocal current_question, current_options, current_answer
        if current_question:
            # Clean up the question (remove leading numbers/tabs)
            q_clean = re.sub(r'^\s*(?:Q)?\s*\d+[\.\)\s]+', '', current_question, flags=re.IGNORECASE).strip()
            if not q_clean:
                q_clean = "Untitled Question"
                
            # Pad options if less than 4 (do NOT crash on missing data)
            while len(current_options) < 4:
                current_options.append(f"Option {len(current_options) + 1} Missing")
            
            # Truncate if somehow more than 4 were matched
            current_options = current_options[:4]
            
            mcqs.append(MCQItem(
                question=q_clean,
                options=current_options,
                correct_answer=current_answer
            ))
            
        # Reset state for next question
        current_question = None
        current_options = []
        current_answer = None

    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # 1. Detect a New Question (e.g., "1.", "1)", "Q1.")
        # Starts with optional 'Q', a digit, and a dot/parenthesis, or just digits and a dot/tab
        is_new_question = re.match(r'^(?:Q\s*)?\d+(?:[\.\)]|\s+)', line, re.IGNORECASE)
        
        # 2. Detect an Option (e.g., "A)", "A.", "a)")
        is_option = re.match(r'^[\(\[]?\s*[A-E]\s*[\.\)\]]\s+', line, re.IGNORECASE)
        
        # 3. Detect an Answer (e.g., "Answer: B", "Ans: c", "Correct: C")
        is_answer = re.match(r'^(?:answer|ans|correct(?: answer)?)[\s\:]+([A-D])', line, re.IGNORECASE)

        if is_new_question and len(current_options) > 0:
            # We found a new question and we already had built the previous one
            save_current()
            current_question = line
        elif is_new_question and current_question is None:
            # Very first question
            current_question = line
            
        elif is_answer:
            current_answer = is_answer.group(1).upper()
            
        elif is_option:
            # Extract option text by stripping the "A)" prefix
            opt_text = re.sub(r'^[\(\[]?\s*[A-E]\s*[\.\)\]]\s*', '', line, flags=re.IGNORECASE).strip()
            current_options.append(opt_text)
            
        else:
            # Continuation text
            if current_question and len(current_options) == 0:
                # Multiline question
                current_question += " " + line
            elif len(current_options) > 0 and not is_answer:
                # Multiline option
                current_options[-1] += " " + line
            elif not current_question:
                # Graceful fallback: Treat the very first unidentified line as a question
                current_question = line

    # Save the last question in the buffer
    save_current()
    
    if not mcqs:
        raise ValueError("Could not extract any standard MCQs from the provided text. Please ensure questions are numbered (1.) and options use letters (A).")
        
    return mcqs
