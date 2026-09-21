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

# -----------------------------
# Load Validation Model (if exists)
# -----------------------------
import os
import cv2

VALIDATION_MODEL_PATH = "models/tomato_validation_model.keras"
if os.path.exists(VALIDATION_MODEL_PATH):
    validation_model = tf.keras.models.load_model(VALIDATION_MODEL_PATH)
    print("Tomato leaf validation model loaded successfully")
else:
    validation_model = None
    print("Warning: Validation model not found. Using heuristic fallback.")

DISEASE_CONFIDENCE_THRESHOLD = 70.0

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

# Check if model is a pipeline (new model) or a dict with components (old model)
if isinstance(yield_model_data, dict) and "model" in yield_model_data:
    yield_model = yield_model_data["model"]
    yield_features = yield_model_data.get("features", ['Country', 'Crop', 'Year'])
else:
    # New Pipeline model
    yield_model = yield_model_data
    yield_features = ['Country', 'Crop', 'Year']

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
        
        # Check basic image format
        try:
            image = Image.open(io.BytesIO(image_bytes))
            image.verify()  # verify format
            image = Image.open(io.BytesIO(image_bytes)) # reopen after verify
        except Exception as e:
            return {
                "valid_image": False,
                "prediction": None,
                "confidence": 0,
                "status": "invalid_image",
                "message": "The uploaded file is not a valid or supported image."
            }

        # Convert to RGB
        image = image.convert("RGB")

        # -----------------------------
        # Tomato Leaf Validation
        # -----------------------------
        # Resize for models
        resized_image = image.resize((224, 224))
        image_array = np.array(resized_image)
        
        is_tomato_leaf = True
        
        TOMATO_VALIDATION_THRESHOLD = 0.70
        if validation_model:
            # Use trained binary classifier
            val_input = np.expand_dims(image_array, axis=0)
            val_pred = validation_model.predict(val_input)[0][0]
            is_tomato_leaf = val_pred > TOMATO_VALIDATION_THRESHOLD
        else:
            # Heuristic fallback (Green/Yellow/Brown pixel ratio for leaves)
            hsv_image = cv2.cvtColor(image_array, cv2.COLOR_RGB2HSV)
            # Define range for leaf colors (green, yellow, some brown)
            lower_color = np.array([20, 30, 30])
            upper_color = np.array([90, 255, 255])
            mask = cv2.inRange(hsv_image, lower_color, upper_color)
            leaf_ratio = cv2.countNonZero(mask) / (224 * 224)
            print(f"Leaf color pixel ratio: {leaf_ratio:.4f}")
            
            # Require at least 5% of the image to be leaf-colored
            if leaf_ratio < 0.05:
                is_tomato_leaf = False

        if not is_tomato_leaf:
            return {
                "success": True,
                "valid_image": False,
                "is_tomato_leaf": False,
                "prediction": None,
                "confidence": None,
                "status": "invalid_image",
                "message": "⚠️ Please upload a clear tomato leaf image."
            }


        # -----------------------------
        # Disease Prediction
        # -----------------------------
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

        # Confidence Threshold Check
        if confidence < DISEASE_CONFIDENCE_THRESHOLD:
            return {
                "success": True,
                "valid_image": True,
                "is_tomato_leaf": True,
                "prediction": None,
                "confidence": round(confidence, 2),
                "status": "uncertain",
                "message": "⚠️ The image is unclear or outside the supported disease classes. Please upload a clearer tomato leaf image."
            }

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

        status_value = "healthy" if predicted_class == "healthy" else "disease_detected"
        
        msg = "Healthy tomato leaf detected. No disease detected." if predicted_class == "healthy" else f"{predicted_class.replace('_', ' ').title()} detected in the tomato leaf."

        return {
            "success": True,
            "valid_image": True,
            "is_tomato_leaf": True,
            "filename": file.filename,
            "prediction": predicted_class,
            "disease": predicted_class, # keep disease for backward compatibility just in case
            "confidence": round(confidence, 2),
            "display_confidence": f"{round(confidence)}%",
            "status": status_value,
            "message": msg,
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

        Country = data.get("Country", data.get("country", data.get("Area")))
        Crop = data.get("Crop", data.get("crop", data.get("Item")))
        Year = int(data.get("Year", data.get("year")))

        # --------------------------------------
        # 2. Create input DataFrame
        # --------------------------------------

        input_data = pd.DataFrame(
            [[
                Country,
                Crop,
                Year
            ]],
            columns=['Country', 'Crop', 'Year']
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
                "country": Country,
                "crop": Crop,
                "year": Year,

                "yield_kg_per_ha": round(
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
