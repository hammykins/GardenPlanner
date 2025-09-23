from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from app.database import get_db
from app.models.feature import Feature
from app.models.user import User
from app.models.garden import Garden

router = APIRouter()

class FeatureCreate(BaseModel):
    name: str
    boundary: str  # GeoJSON string
    color: str
    garden_id: int
    user_id: int

class FeatureOut(BaseModel):
    id: int
    name: str
    boundary: str
    color: str
    garden_id: int
    user_id: int
    created_at: str

    class Config:
        from_attributes = True

@router.get("/features/", response_model=List[FeatureOut])
def list_features(garden_id: int, db: Session = Depends(get_db)):
    return db.query(Feature).filter(Feature.garden_id == garden_id).all()

@router.post("/features/", response_model=FeatureOut)
def create_feature(feature: FeatureCreate, db: Session = Depends(get_db)):
    db_feature = Feature(**feature.dict())
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
