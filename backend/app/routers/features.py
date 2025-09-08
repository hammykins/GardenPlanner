from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.database import get_db
from app.models.feature import Feature

router = APIRouter()

class FeatureCreate(BaseModel):
    name: str
    boundary: str  # GeoJSON string
    color: str
    garden_id: int
    user_id: Optional[int] = None

class FeatureOut(BaseModel):
    id: int
    name: str
    boundary: str
    color: str
    garden_id: int
    user_id: Optional[int]
    created_at: str

    class Config:
        from_attributes = True

@router.get("/features/", response_model=List[FeatureOut])
def list_features(garden_id: int, db: Session = Depends(get_db)):
    return db.query(Feature).filter(Feature.garden_id == garden_id).all()

@router.post("/features/", response_model=FeatureOut)
def create_feature(feature: FeatureCreate, db: Session = Depends(get_db)):
    # Create feature without user_id for development
    db_feature = Feature(
        name=feature.name,
        boundary=feature.boundary,
        color=feature.color,
        garden_id=feature.garden_id,
        user_id=None  # No user required for development
    )
    db.add(db_feature)
    db.commit()
    db.refresh(db_feature)
    return db_feature

@router.put("/features/{feature_id}", response_model=FeatureOut)
def update_feature(feature_id: int, feature: FeatureCreate, db: Session = Depends(get_db)):
    db_feature = db.query(Feature).filter(Feature.id == feature_id).first()
    if not db_feature:
        raise HTTPException(404, "Feature not found")
    for k, v in feature.dict().items():
        setattr(db_feature, k, v)
    db.commit()
    db.refresh(db_feature)
    return db_feature

@router.delete("/features/{feature_id}")
def delete_feature(feature_id: int, db: Session = Depends(get_db)):
    db_feature = db.query(Feature).filter(Feature.id == feature_id).first()
    if not db_feature:
        raise HTTPException(404, "Feature not found")
    db.delete(db_feature)
    db.commit()
    return {"ok": True}
