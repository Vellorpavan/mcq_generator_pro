# mcq_generator_pro

AI MCQ generator app with FastAPI and React. Upload PDF/text, generate questions, preview results, and export Word documents with answers, without answers, and answer key.

## Project Structure

- `backend/`: FastAPI backend
- `frontend/`: React frontend

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Vellorpavan/mcq_generator_pro.git
   cd mcq_generator_pro
   ```

2. **Set up Environment Variables:**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and replace `your_api_key_here` with your actual Gemini API key.

3. **Backend Setup:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

4. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Security

**IMPORTANT:** Never commit your `.env` file to GitHub. The `.gitignore` file is configured to exclude it.
