from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import random
import json
from datetime import datetime

app = FastAPI(title="Kochi Metro AI Dashboard API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class Trainset(BaseModel):
    id: int
    name: str
    fitness_status: str
    job_cards_open: int
    branding_hours: int
    mileage_km: int
    cleaning_status: str
    stabling_position: int
    status: str

class OptimizationRequest(BaseModel):
    target_ready: int = 15
    target_standby: int = 5
    target_maintenance: int = 5

class OptimizationResponse(BaseModel):
    optimized_trainsets: List[Trainset]
    summary: Dict[str, Any]
    optimization_score: float

# Sample data for 25 trainsets
def generate_sample_trainsets() -> List[Trainset]:
    trainsets = []
    fitness_options = ["Valid", "Expired", "Pending"]
    cleaning_options = ["Complete", "In Progress", "Pending"]
    status_options = ["Ready", "Standby", "Maintenance"]
    
    for i in range(1, 26):
        trainset = Trainset(
            id=i,
            name=f"Rake {i:02d}",
            fitness_status=random.choice(fitness_options),
            job_cards_open=random.randint(0, 5),
            branding_hours=random.randint(50, 300),
            mileage_km=random.randint(50000, 120000),
            cleaning_status=random.choice(cleaning_options),
            stabling_position=random.randint(1, 10),
            status=random.choice(status_options)
        )
        trainsets.append(trainset)
    
    return trainsets

# Global variable to store current trainsets
current_trainsets = generate_sample_trainsets()

@app.get("/")
async def root():
    return {"message": "Kochi Metro AI Dashboard API", "version": "1.0.0"}

@app.get("/trainsets", response_model=List[Trainset])
async def get_trainsets():
    """Get all 25 trainsets with their current status"""
    return current_trainsets

@app.post("/optimize", response_model=OptimizationResponse)
async def optimize_fleet(request: OptimizationRequest = OptimizationRequest()):
    """
    Run AI optimization to determine optimal train induction status
    This is where the ML model would be integrated in the future
    """
    global current_trainsets
    
    try:
        # Create a copy of current trainsets for optimization
        trainsets_to_optimize = [trainset.model_copy() for trainset in current_trainsets]
        
        # AI/ML Optimization Logic (Placeholder for future ML model)
        # Current implementation uses a scoring algorithm
        def calculate_optimization_score(trainset: Trainset) -> float:
            """
            Calculate optimization score for each trainset
            Higher score = better candidate for Ready status
            
            Future ML model would replace this logic with:
            - Supervised learning on historical data
            - Unsupervised clustering for maintenance patterns
            - Time series forecasting for predictive maintenance
            """
            score = 0.0
            
            # Fitness status scoring
            if trainset.fitness_status == "Valid":
                score += 3.0
            elif trainset.fitness_status == "Pending":
                score += 1.5
            else:  # Expired
                score += 0.0
            
            # Job cards scoring (fewer open jobs = better)
            score += max(0, 2.0 - (trainset.job_cards_open * 0.5))
            
            # Branding hours scoring (more hours = better utilization)
            score += min(2.0, trainset.branding_hours / 150.0)
            
            # Mileage scoring (moderate mileage preferred)
            if 60000 <= trainset.mileage_km <= 100000:
                score += 1.5
            elif trainset.mileage_km < 60000:
                score += 1.0
            else:
                score += 0.5
            
            # Cleaning status scoring
            if trainset.cleaning_status == "Complete":
                score += 2.0
            elif trainset.cleaning_status == "In Progress":
                score += 1.0
            else:
                score += 0.0
            
            # Add some randomness to simulate real-world uncertainty
            score += random.uniform(-0.2, 0.2)
            
            return score
        
        # Calculate scores for all trainsets
        scored_trainsets = []
        for trainset in trainsets_to_optimize:
            score = calculate_optimization_score(trainset)
            scored_trainsets.append((trainset, score))
        
        # Sort by score (descending)
        scored_trainsets.sort(key=lambda x: x[1], reverse=True)
        
        # Assign statuses based on optimization
        for i, (trainset, score) in enumerate(scored_trainsets):
            if i < request.target_ready:
                trainset.status = "Ready"
            elif i < request.target_ready + request.target_standby:
                trainset.status = "Standby"
            else:
                trainset.status = "Maintenance"
        
        # Update global state
        current_trainsets = [trainset for trainset, _ in scored_trainsets]
        
        # Calculate summary statistics
        status_counts = {"Ready": 0, "Standby": 0, "Maintenance": 0}
        for trainset in current_trainsets:
            status_counts[trainset.status] += 1
        
        # Calculate average optimization score
        avg_score = sum(score for _, score in scored_trainsets) / len(scored_trainsets)
        
        return OptimizationResponse(
            optimized_trainsets=current_trainsets,
            summary={
                "total_trainsets": len(current_trainsets),
                "status_distribution": status_counts,
                "optimization_timestamp": datetime.now().isoformat(),
                "target_distribution": {
                    "ready": request.target_ready,
                    "standby": request.target_standby,
                    "maintenance": request.target_maintenance
                }
            },
            optimization_score=avg_score
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

