import pandas as pd
import joblib


# ---------------------------------------
# 1. Load model
# ---------------------------------------

MODEL_PATH = "models/disease_risk_model.pkl"

model_data = joblib.load(MODEL_PATH)

model = model_data["model"]
features = model_data["features"]


print("\nDisease Risk Model Loaded Successfully!")


# ---------------------------------------
# 2. Farm input
# ---------------------------------------

input_data = {
    "temperature": 25.0,
    "humidity": 85.0,
    "rainfall": 15.0,
    "leaf_wetness": 8.0,
    "crop_age_days": 45
}


# ---------------------------------------
# 3. Convert input to DataFrame
# ---------------------------------------

input_df = pd.DataFrame(
    [input_data],
    columns=features
)


print("\nFarm Conditions")
print("--------------------------------")

print("Temperature:", input_data["temperature"], "°C")
print("Humidity:", input_data["humidity"], "%")
print("Rainfall:", input_data["rainfall"], "mm")
print("Leaf Wetness:", input_data["leaf_wetness"])
print("Crop Age:", input_data["crop_age_days"], "days")


# ---------------------------------------
# 4. Predict risk
# ---------------------------------------

prediction = model.predict(input_df)

risk_level = prediction[0]


# ---------------------------------------
# 5. Get probabilities
# ---------------------------------------

probabilities = model.predict_proba(input_df)[0]

probability_data = list(
    zip(model.classes_, probabilities)
)

probability_data.sort(
    key=lambda x: x[1],
    reverse=True
)


# ---------------------------------------
# 6. Display result
# ---------------------------------------

print("\n================================")
print("DISEASE RISK RESULT")
print("================================")

print("Risk Level:", risk_level)

print("\nRisk Probabilities")

for risk, probability in probability_data:

    print(
        f"{risk}: {probability * 100:.2f}%"
    )

print("================================")