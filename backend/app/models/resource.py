from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, GetJsonSchemaHandler, ConfigDict
from pydantic_core import CoreSchema
from bson import ObjectId
from enum import Enum

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(
        cls, core_schema: CoreSchema, handler: GetJsonSchemaHandler
    ) -> dict:
        json_schema = handler(core_schema)
        json_schema.update(type="string")
        return json_schema

class ResourceType(str, Enum):
    WASTE = "waste"
    RESOURCE = "resource"

class ResourceCategory(str, Enum):
    HEAT = "heat"
    WATER = "water"
    METAL = "metal"
    PLASTIC = "plastic"
    PAPER = "paper"
    GLASS = "glass"
    ORGANIC = "organic"
    CHEMICAL = "chemical"
    ELECTRICITY = "electricity"
    COMPRESSED_AIR = "compressed_air"
    OTHER = "other"

class ResourceStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MATCHED = "matched"

class ResourceModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str
    company_name: str
    resource_type: ResourceType
    category: ResourceCategory
    title: str
    description: str
    specifications: Dict[str, Any] = {}
    quantity: Optional[str] = None
    unit: Optional[str] = None
    frequency: Optional[str] = None
    availability: Optional[str] = None
    location: str
    coordinates: Optional[Dict[str, float]] = None
    status: ResourceStatus = ResourceStatus.ACTIVE
    embedding: Optional[List[float]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(
        populate_by_name=True,  # was allow_population_by_field_name
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        json_schema_extra={
            "example": {
                "user_id": "507f1f77bcf86cd799439011",
                "company_name": "Eco Industries",
                "resource_type": "waste",
                "category": "heat",
                "title": "Excess Heat from Manufacturing",
                "description": "We produce excess heat from our manufacturing process at 150°C",
                "specifications": {
                    "temperature": "150°C",
                    "continuous": "yes"
                },
                "quantity": "1000",
                "unit": "kW",
                "frequency": "daily",
                "location": "Mumbai, India",
                "status": "active"
            }
        }
    )