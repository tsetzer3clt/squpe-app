
# Create the backend/main.py file content
main_py_content = '''"""
Squpe Backend API - Main Application File
This is the FastAPI backend that powers your Campaign and Go Live features.
"""

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timedelta
from enum import Enum
import uvicorn

# Initialize FastAPI app
app = FastAPI(
    title="Squpe API",
    description="Social Impact Platform Backend API",
    version="1.0.0"
)

# CORS middleware - allows your mobile app to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your mobile app's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# DATA MODELS (What your API expects to receive)
# ============================================================================

class CampaignCategory(str, Enum):
    """Campaign categories"""
    INVESTIGATION = "investigation"
    ENVIRONMENT = "environment"
    SOCIAL_JUSTICE = "social_justice"
    EDUCATION = "education"
    HEALTHCARE = "healthcare"
    COMMUNITY = "community"
    OTHER = "other"


class CampaignCreate(BaseModel):
    """Model for creating a new campaign - matches your UI!"""
    title: str = Field(..., min_length=1, max_length=100, description="Campaign title")
    description: str = Field(..., min_length=10, max_length=5000, description="Campaign description")
    goal_amount: float = Field(..., gt=0, description="Funding goal in dollars")
    duration_days: int = Field(..., gt=0, le=365, description="Campaign duration in days")
    category: CampaignCategory = Field(..., description="Campaign category")
    tags: List[str] = Field(default=[], description="Campaign tags")
    image_url: Optional[str] = Field(None, description="Campaign hero image URL")
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Investigation: Corporate Corruption",
                "description": "Investigating environmental violations by major corporations...",
                "goal_amount": 50000.00,
                "duration_days": 30,
                "category": "investigation",
                "tags": ["investigation", "environment", "corruption"],
                "image_url": "https://example.com/image.jpg"
            }
        }


class LiveStreamCategory(str, Enum):
    """Live stream categories"""
    NEWS = "news"
    EDUCATION = "education"
    ENTERTAINMENT = "entertainment"
    ACTIVISM = "activism"
    COMMUNITY = "community"
    OTHER = "other"


class LiveStreamCreate(BaseModel):
    """Model for starting a live stream - matches your Go Live UI!"""
    title: str = Field(..., min_length=1, max_length=100, description="Stream title")
    category: LiveStreamCategory = Field(..., description="Stream category")
    description: Optional[str] = Field(None, max_length=500, description="Stream description")
    is_public: bool = Field(True, description="Is stream public or private")
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Breaking: Community Town Hall Meeting",
                "category": "news",
                "description": "Live coverage of the town hall discussion",
                "is_public": True
            }
        }


class CampaignResponse(BaseModel):
    """What the API returns after creating a campaign"""
    id: str
    title: str
    description: str
    goal_amount: float
    raised_amount: float
    duration_days: int
    category: str
    tags: List[str]
    status: str
    created_at: datetime
    end_date: datetime
    creator_id: str
    image_url: Optional[str]
    supporters_count: int
    share_url: str


class LiveStreamResponse(BaseModel):
    """What the API returns after starting a live stream"""
    id: str
    title: str
    category: str
    description: Optional[str]
    status: str
    stream_url: str
    rtmp_url: str
    stream_key: str
    viewer_count: int
    started_at: datetime
    creator_id: str
    chat_enabled: bool


# ============================================================================
# MOCK DATABASE (In production, this would be PostgreSQL)
# ============================================================================

# Temporary storage - in real app, this would be a database
campaigns_db = {}
livestreams_db = {}


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_current_user():
    """
    Mock authentication - returns a fake user
    In production, this would verify JWT tokens and return real user data
    """
    return {
        "id": "user_12345",
        "username": "demo_user",
        "email": "demo@squpe.app"
    }


def generate_id(prefix: str) -> str:
    """Generate a unique ID"""
    import uuid
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


# ============================================================================
# API ENDPOINTS - CAMPAIGNS (Matches your Campaign Creation UI)
# ============================================================================

@app.post("/api/campaigns", response_model=CampaignResponse, status_code=201)
async def create_campaign(
    campaign: CampaignCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new crowdfunding campaign
    This endpoint is called when user taps "Launch Campaign" in your UI
    """
    
    # Generate unique campaign ID
    campaign_id = generate_id("campaign")
    
    # Calculate end date
    end_date = datetime.now() + timedelta(days=campaign.duration_days)
    
    # Create campaign object
    new_campaign = {
        "id": campaign_id,
        "title": campaign.title,
        "description": campaign.description,
        "goal_amount": campaign.goal_amount,
        "raised_amount": 0.0,
        "duration_days": campaign.duration_days,
        "category": campaign.category.value,
        "tags": campaign.tags,
        "status": "active",
        "created_at": datetime.now(),
        "end_date": end_date,
        "creator_id": current_user["id"],
        "image_url": campaign.image_url,
        "supporters_count": 0,
        "share_url": f"https://squpe.app/campaigns/{campaign_id}"
    }
    
    # Save to "database"
    campaigns_db[campaign_id] = new_campaign
    
    return CampaignResponse(**new_campaign)


@app.get("/api/campaigns/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(campaign_id: str):
    """Get a specific campaign by ID"""
    
    if campaign_id not in campaigns_db:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    return CampaignResponse(**campaigns_db[campaign_id])


@app.get("/api/campaigns", response_model=List[CampaignResponse])
async def list_campaigns(
    category: Optional[CampaignCategory] = None,
    status: Optional[str] = "active",
    limit: int = 20,
    offset: int = 0
):
    """
    List all campaigns with optional filtering
    Used for the Explore feed and user profiles
    """
    
    campaigns = list(campaigns_db.values())
    
    # Filter by category if specified
    if category:
        campaigns = [c for c in campaigns if c["category"] == category.value]
    
    # Filter by status if specified
    if status:
        campaigns = [c for c in campaigns if c["status"] == status]
    
    # Sort by created_at (newest first)
    campaigns.sort(key=lambda x: x["created_at"], reverse=True)
    
    # Apply pagination
    campaigns = campaigns[offset:offset + limit]
    
    return [CampaignResponse(**c) for c in campaigns]


@app.post("/api/campaigns/{campaign_id}/donate")
async def donate_to_campaign(
    campaign_id: str,
    amount: float,
    current_user: dict = Depends(get_current_user)
):
    """
    Process a donation to a campaign
    In production, this would integrate with Stripe
    """
    
    if campaign_id not in campaigns_db:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Donation amount must be positive")
    
    campaign = campaigns_db[campaign_id]
    
    # Update campaign totals
    campaign["raised_amount"] += amount
    campaign["supporters_count"] += 1
    
    return {
        "success": True,
        "message": f"Successfully donated ${amount:.2f}",
        "campaign_id": campaign_id,
        "new_total": campaign["raised_amount"],
        "transaction_id": generate_id("txn")
    }


# ============================================================================
# API ENDPOINTS - LIVE STREAMING (Matches your Go Live UI)
# ============================================================================

@app.post("/api/livestreams", response_model=LiveStreamResponse, status_code=201)
async def start_livestream(
    stream: LiveStreamCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Start a new live stream
    This endpoint is called when user taps "Go Live" in your UI
    """
    
    # Generate unique stream ID
    stream_id = generate_id("stream")
    stream_key = generate_id("key")
    
    # Create livestream object
    new_stream = {
        "id": stream_id,
        "title": stream.title,
        "category": stream.category.value,
        "description": stream.description,
        "status": "live",
        "stream_url": f"https://stream.squpe.app/live/{stream_id}",
        "rtmp_url": f"rtmp://stream.squpe.app/live",
        "stream_key": stream_key,
        "viewer_count": 0,
        "started_at": datetime.now(),
        "creator_id": current_user["id"],
        "chat_enabled": True,
        "is_public": stream.is_public
    }
    
    # Save to "database"
    livestreams_db[stream_id] = new_stream
    
    return LiveStreamResponse(**new_stream)


@app.get("/api/livestreams/{stream_id}", response_model=LiveStreamResponse)
async def get_livestream(stream_id: str):
    """Get a specific livestream by ID"""
    
    if stream_id not in livestreams_db:
        raise HTTPException(status_code=404, detail="Livestream not found")
    
    return LiveStreamResponse(**livestreams_db[stream_id])


@app.get("/api/livestreams", response_model=List[LiveStreamResponse])
async def list_livestreams(
    status: str = "live",
    category: Optional[LiveStreamCategory] = None,
    limit: int = 20
):
    """
    List all live streams
    Used for the Live feed
    """
    
    streams = list(livestreams_db.values())
    
    # Filter by status
    streams = [s for s in streams if s["status"] == status]
    
    # Filter by category if specified
    if category:
        streams = [s for s in streams if s["category"] == category.value]
    
    # Sort by viewer count (most popular first)
    streams.sort(key=lambda x: x["viewer_count"], reverse=True)
    
    # Apply limit
    streams = streams[:limit]
    
    return [LiveStreamResponse(**s) for s in streams]


@app.post("/api/livestreams/{stream_id}/end")
async def end_livestream(
    stream_id: str,
    current_user: dict = Depends(get_current_user)
):
    """End a live stream"""
    
    if stream_id not in livestreams_db:
        raise HTTPException(status_code=404, detail="Livestream not found")
    
    stream = livestreams_db[stream_id]
    
    # Verify user owns this stream
    if stream["creator_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to end this stream")
    
    # Update status
    stream["status"] = "ended"
    stream["ended_at"] = datetime.now()
    
    return {
        "success": True,
        "message": "Livestream ended successfully",
        "stream_id": stream_id,
        "duration_minutes": int((stream["ended_at"] - stream["started_at"]).total_seconds() / 60),
        "peak_viewers": stream["viewer_count"]
    }


@app.post("/api/livestreams/{stream_id}/viewers")
async def update_viewer_count(stream_id: str, count: int):
    """Update viewer count for a stream (called by streaming server)"""
    
    if stream_id not in livestreams_db:
        raise HTTPException(status_code=404, detail="Livestream not found")
    
    livestreams_db[stream_id]["viewer_count"] = count
    
    return {"success": True, "viewer_count": count}


# ============================================================================
# UTILITY ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """API root - health check"""
    return {
        "message": "Squpe API is running!",
        "version": "1.0.0",
        "status": "healthy",
        "endpoints": {
            "docs": "/docs",
            "campaigns": "/api/campaigns",
            "livestreams": "/api/livestreams"
        }
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "campaigns_count": len(campaigns_db),
        "livestreams_active": len([s for s in livestreams_db.values() if s["status"] == "live"])
    }


@app.get("/api/stats")
async def get_stats():
    """Get platform statistics"""
    
    total_raised = sum(c["raised_amount"] for c in campaigns_db.values())
    active_campaigns = len([c for c in campaigns_db.values() if c["status"] == "active"])
    live_streams = len([s for s in livestreams_db.values() if s["status"] == "live"])
    
    return {
        "total_campaigns": len(campaigns_db),
        "active_campaigns": active_campaigns,
        "total_raised": total_raised,
        "live_streams": live_streams,
        "total_supporters": sum(c["supporters_count"] for c in campaigns_db.values())
    }


# ============================================================================
# RUN THE SERVER
# ============================================================================

if __name__ == "__main__":
    print("🚀 Starting Squpe API Server...")
    print("📝 API Documentation: http://localhost:8000/docs")
    print("🏥 Health Check: http://localhost:8000/api/health")
    print("📊 Stats: http://localhost:8000/api/stats")
    print()
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
'''

print(main_py_content)
print("\n" + "="*80)
print("✅ FILE CREATED: backend/main.py")
print("="*80)

