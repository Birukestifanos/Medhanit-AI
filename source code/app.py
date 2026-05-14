from fastapi import FastAPI, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from typing import List, Optional
import datetime
import numpy as np
import pandas as pd
import pickle
import re
import difflib
import json
from dotenv import load_dotenv
import os
import jwt

# ✅ Initialize app and env
app = FastAPI()
env_path = "C:/Users/natty/Documents/medical/backend/.env"
load_dotenv(env_path)

jwt_secret = os.getenv("JWT_SECRET")
if not jwt_secret:
    raise RuntimeError("JWT_SECRET is not set in environment variables")
print("🔐 Loaded JWT_SECRET:", "Set")
print("🔐 JWT_SECRET length:", len(jwt_secret))
print("🔐 Loaded .env from:", env_path)

# 🔐 Load MongoDB URI and connect
mongo_uri = os.getenv("MONGO_URI")
print("🔐 Loaded MongoDB URI:", bool(mongo_uri))
try:
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    client.server_info()  # Test connection
    db = client["medanit"]
    prediction_logs = db["predictionlogs"]
    users_collection = db["users"]
    print("✅ [FastAPI] MongoDB connected successfully")
except Exception as e:
    print(f"❌ [FastAPI] MongoDB connection failed: {str(e)}")
    raise Exception(f"MongoDB connection failed: {str(e)}")

# 🔓 Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,  # Still safe even without cookies
    allow_methods=["*"],
    allow_headers=["*"],  # Includes Authorization
)

# 📊 Load datasets
base_path = "datasets/"
symptoms_df = pd.read_csv(os.path.join(base_path, "symtoms_df.csv"), names=["ID", "Disease", "Symptom_1", "Symptom_2", "Symptom_3", "Symptom_4"])
description = pd.read_csv(os.path.join(base_path, "description.csv"))
precautions = pd.read_csv(os.path.join(base_path, "precautions_df.csv"))
medications = pd.read_csv(os.path.join(base_path, "medications.csv"))
diets = pd.read_csv(os.path.join(base_path, "diets.csv"))
workout = pd.read_csv(os.path.join(base_path, "workout_df.csv"))

# 🧠 Load model + mapping
model = pickle.load(open("models/svc.pkl", "rb"))
reverse_disease_index = pickle.load(open("models/disease_mapping.pkl", "rb"))

# 🔍 Build symptom dictionary
def clean_symptom(val):
    if pd.isna(val): return None
    val = str(val).strip().lower()
    val = re.sub(r'[^a-zA-Z0-9_ ]', '', val)
    return val.replace(" ", "_")

all_symptoms = set()
for col in ["Symptom_1", "Symptom_2", "Symptom_3", "Symptom_4"]:
    all_symptoms.update(symptoms_df[col].dropna().apply(clean_symptom).unique())
symptoms_dict = {sym: idx for idx, sym in enumerate(sorted(all_symptoms))}

# 🔐 JWT dependency: Only from Authorization header
async def get_token(authorization: Optional[str] = Header(None)):
    """
    Extract JWT from Authorization header only.
    """
    print("🔍 [FastAPI] Looking for token in Authorization header")
    if not authorization or not authorization.startswith("Bearer "):
        print("❌ [FastAPI] Missing or invalid Authorization header")
        raise HTTPException(status_code=401, detail="Authorization header missing or invalid")
    token = authorization.split(" ")[1]
    print("🔐 [FastAPI] Token extracted from Bearer header")
    return token

# 🔐 Verify JWT and get current user
async def get_current_user(token: str = Depends(get_token)):
    print("🔍 [FastAPI] Verifying token:", token[:20] + "..." if len(token) > 20 else token)
    try:
        payload = jwt.decode(token, jwt_secret, algorithms=["HS256"])
        print("🔐 [FastAPI] Decoded payload:", payload)
        user_id: str = payload.get("userId")
        role: str = payload.get("role")
        if not user_id or not role:
            print("❌ [FastAPI] Invalid token payload")
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return {"userId": user_id, "role": role}
    except jwt.ExpiredSignatureError:
        print("🔐 [FastAPI] Token expired")
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        print("🔐 [FastAPI] Invalid token:", str(e))
        raise HTTPException(status_code=401, detail="Invalid token")

# 🔐 Test token endpoint
@app.post("/test-token")
async def test_token(token: str = Depends(get_token)):
    try:
        payload = jwt.decode(token, jwt_secret, algorithms=["HS256"])
        print("🔐 [FastAPI] Test token valid:", payload)
        return {"message": "Token valid", "payload": payload}
    except jwt.ExpiredSignatureError:
        return {"error": "Token expired"}
    except jwt.InvalidTokenError:
        return {"error": "Invalid token"}

# 📦 GET /me - Fetch current user data
class UserResponse(BaseModel):
    id: str
    fullName: str
    email: str
    role: str
    active: bool

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_data(user: dict = Depends(get_current_user)):
    try:
        print(f"🔍 [FastAPI] Fetching user data for userId: {user['userId']}")
        user_data = users_collection.find_one({"_id": user["userId"]})
        if not user:
            print(f"❌ [FastAPI] User not found: {user['userId']}")
            raise HTTPException(status_code=404, detail="User not found")

        formatted_user = {
            "id": str(user_data["_id"]),
            "fullName": user_data.get("fullName", "Unknown"),
            "email": user_data.get("email", "Unknown"),
            "role": user_data.get("role", "Unknown"),
            "active": user_data.get("active", False)
        }
        print(f"✅ [FastAPI] User data fetched: {formatted_user}")
        return formatted_user
    except Exception as e:
        print(f"❌ [FastAPI] Error fetching user  {str(e)}")
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

# 📦 Metadata helpers
def safe_text(val):
    if pd.isna(val) or val is None or str(val).lower() in ["nan", "none", ""]:
        return ""
    return str(val)

def parse_field(field) -> List[str]:
    """Parse a field to a list, handling JSON strings, nested JSON, arrays, or single values."""
    if not field:
        return []
    try:
        if isinstance(field, list):
            if len(field) == 1 and isinstance(field[0], str) and field[0].startswith('[') and field[0].endswith(']'):
                return json.loads(field[0])
            return field
        if isinstance(field, str):
            if field.startswith('[') and field.endswith(']'):
                return json.loads(field)
            return [re.sub(r"^['\"]|['\"]$", "", item.strip()) for item in field.split(",")]
        return [str(field)]
    except json.JSONDecodeError as e:
        print(f"⚠️ [FastAPI] JSON decode error in parse_field: {str(e)}, input: {field}")
        return [re.sub(r"^['\"]|['\"]$", "", item.strip()) for item in str(field).split(",")]

def sanitize_document(doc):
    """Recursively sanitize NaN and invalid values in a document."""
    if isinstance(doc, dict):
        return {k: sanitize_document(v) for k, v in doc.items()}
    elif isinstance(doc, list):
        return [sanitize_document(item) for item in doc]
    elif isinstance(doc, float) and (np.isnan(doc) or np.isinf(doc)):
        return ""
    elif str(doc).lower() in ["nan", "none"]:
        return ""
    return doc

def helper(disease):
    try:
        desc = description.query("Disease == @disease")["Description"].values
        meds = medications.query("Disease == @disease")["Medication"].values
        diet = diets.query("Disease == @disease")["Diet"].values
        wrk = workout.query("disease == @disease")["workout"].values
        prec = precautions.query("Disease == @disease")[["Precaution_1", "Precaution_2", "Precaution_3", "Precaution_4"]].values

        medication_list = parse_field(safe_text(meds[0]) if len(meds) else "")
        diet_list = parse_field(safe_text(diet[0]) if len(diet) else "")
        workout_list = parse_field(safe_text(wrk[0]) if len(wrk) else "No workout info")
        return (
            safe_text(desc[0]) if len(desc) else "No description available",
            [safe_text(p) for p in prec[0].tolist() if p and not pd.isna(p)] if len(prec) else [],
            medication_list,
            diet_list,
            workout_list
        )
    except Exception as e:
        print(f"❌ [FastAPI] Error in helper for disease {disease}: {str(e)}")
        return "No description available", [], [], [], ["No workout info"]

# 🔍 Prediction endpoint
class SymptomRequest(BaseModel):
    symptoms: List[str]
    patientId: str

@app.post("/predict")
async def predict_disease(request: SymptomRequest, user: dict = Depends(get_current_user)):
    print("🔍 Received Request Body:", request.dict())
    input_vector = np.zeros(len(symptoms_dict))
    unknowns = []
    for symptom in request.symptoms:
        cleaned = clean_symptom(symptom)
        if cleaned in symptoms_dict:
            input_vector[symptoms_dict[cleaned]] = 1
        else:
            match = difflib.get_close_matches(cleaned, symptoms_dict.keys(), n=1, cutoff=0.6)
            if match:
                input_vector[symptoms_dict[match[0]]] = 1
                print(f"🔍 Fuzzy match: '{cleaned}' → '{match[0]}'")
            else:
                unknowns.append(symptom)
    if unknowns:
        print("⚠️ Unknown symptoms:", unknowns)

    probabilities = model.predict_proba([input_vector])[0]
    top_indices = np.argsort(probabilities)[::-1][:5]
    top_predictions = [
        {"disease": reverse_disease_index[idx], "confidence": float(probabilities[idx])}
        for idx in top_indices
    ]
    top_disease = top_predictions[0]["disease"]
    description, precautions, medication, diet, workout = helper(top_disease)

    log_entry = {
        "patientId": request.patientId,
        "staffId": user["userId"],
        "disease": top_disease,
        "symptoms": request.symptoms,
        "description": description,
        "precautions": precautions,
        "medication": medication,
        "diet": diet,
        "workout": workout,
        "createdAt": datetime.datetime.now(datetime.timezone.utc)
    }

    try:
        result = prediction_logs.insert_one(log_entry)
        log_entry["_id"] = str(result.inserted_id)
        print("✅ [FastAPI] Log entry inserted:", log_entry["_id"])
    except Exception as e:
        print(f"❌ [FastAPI] Error inserting log entry: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save prediction: {str(e)}")

    return {"top_predictions": top_predictions, "metadata": log_entry}

# ✅ GET /predictions - Fetch all prediction logs
class PredictionLogResponse(BaseModel):
    _id: str
    patientId: str
    staffId: str
    disease: str
    symptoms: List[str]
    description: str
    precautions: List[str]
    medication: List[str]
    diet: List[str]
    workout: List[str]
    createdAt: datetime.datetime

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, float) and (np.isnan(obj) or np.isinf(obj)):
            return ""
        if isinstance(obj, datetime.datetime):
            return obj.isoformat()
        return super().default(obj)

@app.get("/predictions")
async def get_predictions(
    page: int = 1,
    limit: int = 10,
    user: dict = Depends(get_current_user)
):
    try:
        print(f"🔍 [FastAPI] Fetching predictions: page={page}, limit={limit}")
        if page < 1:
            raise HTTPException(status_code=400, detail="Page must be >= 1")
        if limit < 1 or limit > 100:
            raise HTTPException(status_code=400, detail="Limit must be between 1 and 100")

        skip = (page - 1) * limit
        total = prediction_logs.count_documents({})
        total_pages = (total + limit - 1) // limit

        cursor = prediction_logs.find().sort("createdAt", -1).skip(skip).limit(limit)
        logs = []

        for log in cursor:
            try:
                sanitized_log = sanitize_document(log)
                formatted_log = {
                    "_id": str(sanitized_log.get("_id", "")),
                    "patientId": safe_text(sanitized_log.get("patientId", "N/A")),
                    "staffId": safe_text(sanitized_log.get("staffId", "Unknown")),
                    "disease": safe_text(sanitized_log.get("disease", "Unknown")),
                    "symptoms": sanitized_log.get("symptoms", []) if isinstance(sanitized_log.get("symptoms"), list) else [],
                    "description": safe_text(sanitized_log.get("description", "No description available")),
                    "precautions": sanitized_log.get("precautions", []) if isinstance(sanitized_log.get("precautions"), list) else [],
                    "medication": parse_field(sanitized_log.get("medication", [])),
                    "diet": parse_field(sanitized_log.get("diet", [])),
                    "workout": parse_field(sanitized_log.get("workout", [])),
                    "createdAt": sanitized_log.get("createdAt", datetime.datetime.now(datetime.timezone.utc))
                }
                if not isinstance(formatted_log["createdAt"], datetime.datetime):
                    formatted_log["createdAt"] = datetime.datetime.now(datetime.timezone.utc)
                logs.append(formatted_log)
            except Exception as e:
                print(f"❌ [FastAPI] Error processing log: {str(e)}")
                continue

        print(f"✅ [FastAPI] Fetched {len(logs)} predictions for page {page}")
        return {
            "predictions": logs,
            "pagination": {
                "totalItems": total,
                "totalPages": total_pages,
                "currentPage": page
            }
        }
    except Exception as e:
        print(f"❌ [FastAPI] Error in /predictions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

# 📦 Cleanup script for existing documents
@app.on_event("startup")
async def cleanup_prediction_logs():
    try:
        print("🧹 [FastAPI] Starting cleanup of predictionlogs")
        cursor = prediction_logs.find()
        for doc in cursor:
            update_needed = False
            updates = {}
            for field in doc:
                if field == "_id":
                    continue
                sanitized_value = sanitize_document(doc[field])
                if field in ["medication", "diet", "workout"]:
                    sanitized_value = parse_field(sanitized_value)
                if field == "createdAt" and not isinstance(sanitized_value, datetime.datetime):
                    sanitized_value = datetime.datetime.now(datetime.timezone.utc)
                if sanitized_value != doc[field]:
                    updates[field] = sanitized_value
                    update_needed = True
            if update_needed:
                prediction_logs.update_one({"_id": doc["_id"]}, {"$set": updates})
                print(f"✅ [FastAPI] Cleaned document {doc['_id']}")
        print("✅ [FastAPI] Cleanup completed")
    except Exception as e:
        print(f"❌ [FastAPI] Error during cleanup: {str(e)}")

# 📦 Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy"}