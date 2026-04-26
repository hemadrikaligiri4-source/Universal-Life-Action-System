from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn
from ai_engine import ULASEngine

app = FastAPI(title="ULAS - Universal Life Action System")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Engine with environment key
import os
from dotenv import load_dotenv
load_dotenv()

API_KEY = os.getenv("OPENROUTER_API_KEY")
engine = ULASEngine(API_KEY)

class AnalysisRequest(BaseModel):
    sector: str
    query: str

@app.post("/api/analyze")
async def analyze_request(req: AnalysisRequest):
    try:
        result = engine.analyze(req.sector, req.query)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Mount frontend relative to this file
import os
script_dir = os.path.dirname(os.path.realpath(__file__))
frontend_dir = os.path.join(script_dir, "../frontend")
app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")

if __name__ == "__main__":
    # Use PORT from environment (required for Render) or fallback to 8000
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
