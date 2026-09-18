import pandas as pd
import joblib


# ==========================================
# 1. Load Trained Model
# ==========================================

MODEL_PATH = "models/yield_prediction_model.pkl"

model_data = joblib.load(MODEL_PATH)

model = model_data["model"]
features = model_data["features"]


print("\nYield Prediction Model Loaded Successfully!")


# ==========================================
# 2. Real Agricultural Input
# ==========================================

input_data = {
    "Area": "India",
    "Item": "Wheat",
    "Year": 2013,
    "average_rain_fall_mm_per_year": 800,
    "pesticides_tonnes": 40000,
    "avg_temp": 22.0
}


# ==========================================
# 3. Convert Input to DataFrame
# ==========================================

input_df = pd.DataFrame(
    [input_data],
    columns=features
)


print("\nInput Data")
print("--------------------------------")

print(input_df)


# ==========================================
# 4. Make Prediction
# ==========================================

prediction = model.predict(input_df)

predicted_yield_hg_ha = float(prediction[0])


# ==========================================
# 5. Convert hg/ha to tonnes/ha
# ==========================================

predicted_yield_tonnes_ha = predicted_yield_hg_ha / 10000


# ==========================================
# 6. Display Result
# ==========================================

print("\n================================")
print("YIELD PREDICTION RESULT")
print("================================")

print("Area:", input_data["Area"])
print("Crop:", input_data["Item"])
print("Year:", input_data["Year"])

print(
    f"Predicted Yield: {predicted_yield_hg_ha:.2f} hg/ha"
)

print(
    f"Predicted Yield: {predicted_yield_tonnes_ha:.2f} tonnes/hectare"
)

print("================================")