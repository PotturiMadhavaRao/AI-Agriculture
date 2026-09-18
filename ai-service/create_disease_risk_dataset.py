import pandas as pd
import random

random.seed(42)

rows = []

for _ in range(3000):

    temperature = round(random.uniform(15, 35), 1)
    humidity = round(random.uniform(40, 100), 1)
    rainfall = round(random.uniform(0, 50), 1)
    leaf_wetness = round(random.uniform(0, 12), 1)
    crop_age_days = random.randint(15, 120)

    # Initial risk score based on environmental conditions.
    # This is a prototype labeling rule, not field-observation data.
    score = 0

    if humidity >= 80:
        score += 2
    elif humidity >= 65:
        score += 1

    if temperature >= 20 and temperature <= 30:
        score += 1

    if rainfall >= 10:
        score += 1

    if leaf_wetness >= 6:
        score += 2
    elif leaf_wetness >= 3:
        score += 1

    if crop_age_days >= 30:
        score += 1

    # Assign risk level
    if score >= 6:
        risk_level = "High"
    elif score >= 3:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    # Assign a disease category for higher-risk conditions
    if risk_level == "High":
        if humidity >= 85 and leaf_wetness >= 6:
            disease = "Late Blight"
        else:
            disease = "Early Blight"

    elif risk_level == "Medium":
        disease = "Early Blight"

    else:
        disease = "Low Disease Risk"

    rows.append([
        temperature,
        humidity,
        rainfall,
        leaf_wetness,
        crop_age_days,
        disease,
        risk_level
    ])


columns = [
    "temperature",
    "humidity",
    "rainfall",
    "leaf_wetness",
    "crop_age_days",
    "disease",
    "risk_level"
]

df = pd.DataFrame(rows, columns=columns)

output_path = "dataset/disease_risk/disease_risk.csv"

df.to_csv(output_path, index=False)

print("Disease risk dataset created successfully!")
print("Dataset shape:", df.shape)

print("\nRisk distribution:")
print(df["risk_level"].value_counts())

print("\nDisease distribution:")
print(df["disease"].value_counts())

print("\nFirst 5 rows:")
print(df.head())