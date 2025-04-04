# Resume Builder

A modern web application for creating and managing professional resumes.Built with FastAPI
Port it to react or vue

## Features

- Create and edit professional resumes
- Real-time preview of your resume
- Add multiple education entries
- Add multiple work experiences
- Add skills with proficiency levels
- Responsive design that works on all devices
- Save and manage multiple resumes

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd resume-builder
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install the required packages:
```bash
pip install -r requirements.txt
```

## Running the Application

1. Start the FastAPI server:
```bash
python main.py
```

2. Open your web browser and navigate to:
```
http://localhost:8000
```

## API Endpoints

- `POST /api/resume` - Create a new resume
- `GET /api/resume/{resume_id}` - Get a specific resume
- `PUT /api/resume/{resume_id}` - Update a specific resume
- `DELETE /api/resume/{resume_id}` - Delete a specific resume

## Project Structure

```
resume-builder/
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
├── static/             # Static files (CSS, JS)
│   └── js/
│       └── main.js     # Frontend JavaScript
└── templates/          # HTML templates
    └── index.html      # Main application template
```
