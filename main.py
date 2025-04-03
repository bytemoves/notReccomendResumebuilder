from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi import Request
from pydantic import BaseModel
from typing import List, Optional, Dict
import uvicorn
from datetime import datetime
import openai
import os
from dotenv import load_dotenv
import asyncio

# Load environment variables
load_dotenv()

app = FastAPI(title="Resume Builder API")

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates
templates = Jinja2Templates(directory="templates")


# Pydantic models for request/response
class Education(BaseModel):
    institution: str
    degree: str
    field: str
    start_date: str
    end_date: str
    gpa: Optional[float] = None


class Experience(BaseModel):
    company: str
    position: str
    start_date: str
    end_date: str
    description: str


class Skill(BaseModel):
    name: str
    level: str


class Resume(BaseModel):
    full_name: str
    email: str
    phone: str
    address: str
    summary: str
    education: List[Education]
    experience: List[Experience]
    skills: List[Skill]


class SuggestionRequest(BaseModel):
    section: str
    content: str


class SuggestionResponse(BaseModel):
    suggestions: List[str]
    improved_content: Optional[str] = None


# In-memory storage (replace with database in production)
resumes = {}
suggestions_cache: Dict[str, SuggestionResponse] = {}


async def generate_ai_suggestion(section: str, content: str) -> SuggestionResponse:
    """Generate AI suggestions for resume content."""
    try:
        prompt = f"""As a professional resume reviewer, analyze this {section} section of a resume and provide specific suggestions for improvement:

{content}

Please provide:
1. 2-3 specific suggestions for improvement
2. An improved version of the content (if applicable)
Focus on clarity, impact, and professional tone."""

        response = await asyncio.to_thread(
            openai.ChatCompletion.create,
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional resume reviewer with expertise in creating impactful resumes.",
                },
                {"role": "user", "content": prompt},
            ],
        )

        # Parse the AI response
        ai_response = response.choices[0].message.content
        suggestions = []
        improved_content = None

        # Split the response into suggestions and improved content
        parts = ai_response.split("\n\n")
        for part in parts:
            if "suggestion" in part.lower():
                suggestions.extend([s.strip() for s in part.split("\n") if s.strip()])
            elif "improved" in part.lower():
                improved_content = part.split("\n", 1)[1].strip()

        return SuggestionResponse(
            suggestions=suggestions, improved_content=improved_content
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating suggestions: {str(e)}"
        )


@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/api/resume")
async def create_resume(resume: Resume):
    resume_id = str(len(resumes) + 1)
    resumes[resume_id] = resume
    return {"id": resume_id, "message": "Resume created successfully"}


@app.get("/api/resume/{resume_id}")
async def get_resume(resume_id: str):
    if resume_id not in resumes:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resumes[resume_id]


@app.put("/api/resume/{resume_id}")
async def update_resume(resume_id: str, resume: Resume):
    if resume_id not in resumes:
        raise HTTPException(status_code=404, detail="Resume not found")
    resumes[resume_id] = resume
    return {"message": "Resume updated successfully"}


@app.delete("/api/resume/{resume_id}")
async def delete_resume(resume_id: str):
    if resume_id not in resumes:
        raise HTTPException(status_code=404, detail="Resume not found")
    del resumes[resume_id]
    return {"message": "Resume deleted successfully"}


@app.post("/api/suggestions", response_model=SuggestionResponse)
async def get_suggestions(
    request: SuggestionRequest, background_tasks: BackgroundTasks
):
    """Get AI suggestions for a specific section of the resume."""
    cache_key = f"{request.section}:{request.content}"

    if cache_key in suggestions_cache:
        return suggestions_cache[cache_key]

    # Generate suggestions asynchronously
    suggestions = await generate_ai_suggestion(request.section, request.content)

    # Cache the results
    suggestions_cache[cache_key] = suggestions

    return suggestions


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
