from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi import Request
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from datetime import datetime

app = FastAPI(title="Resume Builder API")

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


# In-memory storage (replace with database in production)
resumes = {}


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


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
