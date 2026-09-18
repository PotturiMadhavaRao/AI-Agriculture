from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import tensorflow as tf
import numpy as np
import io
import joblib
import pandas as pd

app = FastAPI(
    title="AI Agriculture Service",
    description="AI service for agricultural disease detection",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Load trained model
# -----------------------------

MODEL_PATH = "models/tomato_disease_model.keras"

model = tf.keras.models.load_model(MODEL_PATH)

class_names = [
    "early_blight",
    "healthy",
    "late_blight"
]


# ==========================================
# Crop Recommendation Model
# ==========================================

CROP_MODEL_PATH = "models/crop_recommendation_model.pkl"

crop_model_data = joblib.load(CROP_MODEL_PATH)

crop_model = crop_model_data["model"]

crop_features = crop_model_data["features"]

crop_classes = crop_model_data["classes"]

print("Crop recommendation model loaded successfully")

# ==========================================
# Yield Prediction Model
# ==========================================

YIELD_MODEL_PATH = "models/yield_prediction_model.pkl"


yield_model_data = joblib.load(YIELD_MODEL_PATH)

yield_model = yield_model_data["model"]
yield_features = yield_model_data["features"]
yield_target = yield_model_data["target"]

print("Yield prediction model loaded successfully")

# ---------------------------------------
# Disease Risk Prediction Model
# ---------------------------------------

DISEASE_RISK_MODEL_PATH = "models/disease_risk_model.pkl"

disease_risk_model_data = joblib.load(
    DISEASE_RISK_MODEL_PATH
)

disease_risk_model = disease_risk_model_data["model"]

disease_risk_features = disease_risk_model_data["features"]

disease_risk_classes = disease_risk_model_data["classes"]

print("Disease risk prediction model loaded successfully")

# -----------------------------
# Disease information
# -----------------------------

disease_information = {

    "early_blight": {
        "name": "Early Blight",
        "cause": "Fungal infection",

        "symptoms": [
            "Brown spots on leaves",
            "Yellowing of leaves",
            "Concentric ring patterns",
            "Premature leaf drop"
        ],

        "favorable_conditions": [
            "Warm temperature",
            "High humidity",
            "Wet foliage"
        ],

        "prevention": [
            "Remove infected plant material",
            "Maintain proper plant spacing",
            "Avoid overhead irrigation",
            "Practice crop rotation"
        ],

        "management": [
            "Remove severely infected leaves",
            "Improve air circulation around plants",
            "Avoid keeping foliage wet for long periods",
            "Maintain good field sanitation"
        ]
    },

    "healthy": {
        "name": "Healthy Tomato Plant",
        "cause": "No disease detected",

        "symptoms": [],

        "favorable_conditions": [],

        "prevention": [
            "Maintain proper irrigation",
            "Provide adequate sunlight",
            "Monitor plants regularly",
            "Maintain field sanitation"
        ],

        "management": [
            "Continue regular crop monitoring",
            "Maintain appropriate irrigation and nutrition"
        ]
    },

    "late_blight": {
        "name": "Late Blight",
        "cause": "Fungal-like pathogen infection",

        "symptoms": [
            "Dark lesions on leaves",
            "Rapid browning of foliage",
            "Leaf damage under favorable conditions"
        ],

        "favorable_conditions": [
            "Cool conditions",
            "High humidity",
            "Prolonged leaf wetness"
        ],

        "prevention": [
            "Remove infected plant material",
            "Maintain good air circulation",
            "Avoid unnecessary leaf wetness",
            "Monitor crops regularly"
        ],

        "management": [
            "Remove severely infected plant material",
            "Maintain field sanitation",
            "Follow locally approved agricultural disease-management guidance"
        ]
    }
}


# -----------------------------
# Home
# -----------------------------

@app.get("/")
def home():
    return {
        "message": "AI Agriculture Service is running"
    }


# -----------------------------
# Health check
# -----------------------------

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model": "tomato_disease_model"
    }


# -----------------------------
# Disease prediction
# -----------------------------

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    try:

        # Read uploaded image
        image_bytes = await file.read()

        # Open image
        image = Image.open(
            io.BytesIO(image_bytes)
        )

        # Convert to RGB
        image = image.convert("RGB")

        # Resize image
        image = image.resize((224, 224))

        # Convert to NumPy array
        image_array = np.array(image)

        # Add batch dimension
        image_array = np.expand_dims(
            image_array,
            axis=0
        )

        # Model prediction
        predictions = model.predict(
            image_array
        )

        # Find highest probability
        predicted_index = np.argmax(
            predictions[0]
        )

        predicted_class = class_names[
            predicted_index
        ]

        confidence = float(
            predictions[0][predicted_index]
        ) * 100

        # Get disease information
        info = disease_information.get(
            predicted_class,
            {
                "name": predicted_class,
                "cause": "Information not available",
                "symptoms": [],
                "favorable_conditions": [],
                "prevention": [],
                "management": []
            }
        )

        return {
            "success": True,
            "filename": file.filename,
            "disease": predicted_class,
            "confidence": round(confidence, 2),
            "information": info
        }

    except Exception as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


# ==========================================
# Crop Recommendation API
# ==========================================

@app.post("/recommend-crop")
async def recommend_crop(data: dict):

    try:

        # Get input values
        N = float(data["N"])
        P = float(data["P"])
        K = float(data["K"])

        temperature = float(data["temperature"])
        humidity = float(data["humidity"])

        ph = float(data["ph"])
        rainfall = float(data["rainfall"])


        # Create input dataframe
        input_data = pd.DataFrame(
            [[
                N,
                P,
                K,
                temperature,
                humidity,
                ph,
                rainfall
            ]],
            columns=crop_features
        )


        # Predict crop
        prediction = crop_model.predict(input_data)

        recommended_crop = prediction[0]


        # Get probabilities
        probabilities = crop_model.predict_proba(input_data)[0]


        # Combine crop names and probabilities
        probability_data = list(
            zip(
                crop_model.classes_,
                probabilities
            )
        )


        # Sort highest probability first
        probability_data.sort(
            key=lambda x: x[1],
            reverse=True
        )


        # Top 5 crops
        top_crops = []

        for crop, probability in probability_data[:5]:

            top_crops.append({
                "crop": crop,
                "confidence": round(
                    float(probability) * 100,
                    2
                )
            })


        return {
            "success": True,

            "recommended_crop": recommended_crop,

            "confidence": round(
                float(probabilities[
                    list(crop_model.classes_).index(
                        recommended_crop
                    )
                ]) * 100,
                2
            ),

            "top_recommendations": top_crops
        }


    except Exception as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


# ==========================================
# Yield Prediction API
# ==========================================

@app.post("/predict-yield")
async def predict_yield(data: dict):

    try:

        # --------------------------------------
        # 1. Get input values
        # --------------------------------------

        Area = data["Area"]
        Item = data["Item"]

        Year = int(data["Year"])

        average_rain_fall_mm_per_year = float(
            data["average_rain_fall_mm_per_year"]
        )

        pesticides_tonnes = float(
            data["pesticides_tonnes"]
        )

        avg_temp = float(
            data["avg_temp"]
        )


        # --------------------------------------
        # 2. Create input DataFrame
        # --------------------------------------

        input_data = pd.DataFrame(
            [[
                Area,
                Item,
                Year,
                average_rain_fall_mm_per_year,
                pesticides_tonnes,
                avg_temp
            ]],
            columns=yield_features
        )


        # --------------------------------------
        # 3. Predict yield
        # --------------------------------------

        prediction = yield_model.predict(input_data)

        predicted_yield_hg_ha = float(
            prediction[0]
        )


        # --------------------------------------
        # 4. Convert hg/ha to tonnes/hectare
        # --------------------------------------

        predicted_yield_tonnes_ha = (
            predicted_yield_hg_ha / 10000
        )


        # --------------------------------------
        # 5. Return response
        # --------------------------------------

        return {
            "success": True,

            "prediction": {
                "area": Area,
                "crop": Item,
                "year": Year,

                "yield_hg_per_ha": round(
                    predicted_yield_hg_ha,
                    2
                ),

                "yield_tonnes_per_ha": round(
                    predicted_yield_tonnes_ha,
                    2
                )
            }
        }


    except KeyError as error:

        raise HTTPException(
            status_code=400,
            detail=f"Missing required field: {error.args[0]}"
        )


    except Exception as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


# ---------------------------------------
# Disease Risk Prediction API
# ---------------------------------------

@app.post("/predict-disease-risk")
async def predict_disease_risk(data: dict):

    try:

        temperature = float(
            data["temperature"]
        )

        humidity = float(
            data["humidity"]
        )

        rainfall = float(
            data["rainfall"]
        )

        leaf_wetness = float(
            data["leaf_wetness"]
        )

        crop_age_days = int(
            data["crop_age_days"]
        )


        # Create input DataFrame

        input_data = pd.DataFrame(
            [[
                temperature,
                humidity,
                rainfall,
                leaf_wetness,
                crop_age_days
            ]],
            columns=disease_risk_features
        )


        # Predict risk

        prediction = disease_risk_model.predict(
            input_data
        )

        risk_level = prediction[0]


        # Get probabilities

        probabilities = (
            disease_risk_model.predict_proba(
                input_data
            )[0]
        )


        probability_data = list(
            zip(
                disease_risk_model.classes_,
                probabilities
            )
        )


        probability_data.sort(
            key=lambda x: x[1],
            reverse=True
        )


        risk_probabilities = []

        for risk, probability in probability_data:

            risk_probabilities.append({
                "risk": risk,
                "confidence": round(
                    float(probability) * 100,
                    2
                )
            })


        return {

            "success": True,

            "risk_level": risk_level,

            "confidence": round(
                float(
                    probabilities[
                        list(
                            disease_risk_model.classes_
                        ).index(risk_level)
                    ]
                ) * 100,
                2
            ),

            "risk_probabilities":
                risk_probabilities,

            "conditions": {

                "temperature":
                    temperature,

                "humidity":
                    humidity,

                "rainfall":
                    rainfall,

                "leaf_wetness":
                    leaf_wetness,

                "crop_age_days":
                    crop_age_days
            }
        }


    except KeyError as error:

        raise HTTPException(
            status_code=400,
            detail=f"Missing required field: {error.args[0]}"
        )


    except Exception as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )
