import joblib
import pandas as pd


# ==========================================
# 1. Load Trained Model
# ==========================================

MODEL_PATH = "models/crop_recommendation_model.pkl"

model_data = joblib.load(MODEL_PATH)

model = model_data["model"]
features = model_data["features"]
classes = model_data["classes"]


# ==========================================
# 2. Get Farmer Input
# ==========================================

print("\n===================================")
print("AI CROP RECOMMENDATION")
print("===================================")

N = float(input("Enter Nitrogen (N): "))
P = float(input("Enter Phosphorus (P): "))
K = float(input("Enter Potassium (K): "))

temperature = float(input("Enter Temperature (°C): "))
humidity = float(input("Enter Humidity (%): "))
ph = float(input("Enter Soil pH: "))
rainfall = float(input("Enter Rainfall (mm): "))


# ==========================================
# 3. Create Input Data
# ==========================================

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
    columns=features
)


# ==========================================
# 4. Predict Crop
# ==========================================

prediction = model.predict(input_data)

recommended_crop = prediction[0]


# ==========================================
# 5. Prediction Probabilities
# ==========================================

probabilities = model.predict_proba(input_data)[0]

probability_data = list(
    zip(
        model.classes_,
        probabilities
    )
)

probability_data.sort(
    key=lambda x: x[1],
    reverse=True
)


# ==========================================
# 6. Display Result
# ==========================================

print("\n===================================")
print("CROP RECOMMENDATION RESULT")
print("===================================")

print(f"\nRecommended Crop: {recommended_crop.title()}")

print("\nTop 5 Recommendations:")

for crop, probability in probability_data[:5]:
    print(
        f"{crop.title():15} "
        f"{probability * 100:.2f}%"
    )

print("\n===================================")