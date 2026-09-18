import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report


# ---------------------------------------
# 1. Load dataset
# ---------------------------------------

FILE_PATH = "dataset/disease_risk/disease_risk.csv"

df = pd.read_csv(FILE_PATH)

print("\nDataset Loaded")
print("-------------------------")
print("Shape:", df.shape)


# ---------------------------------------
# 2. Select features
# ---------------------------------------

features = [
    "temperature",
    "humidity",
    "rainfall",
    "leaf_wetness",
    "crop_age_days"
]

target = "risk_level"

X = df[features]
y = df[target]


# ---------------------------------------
# 3. Split dataset
# ---------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\nTraining Samples:", len(X_train))
print("Testing Samples:", len(X_test))


# ---------------------------------------
# 4. Create Random Forest model
# ---------------------------------------

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    n_jobs=-1
)


# ---------------------------------------
# 5. Train model
# ---------------------------------------

print("\nTraining disease risk model...")

model.fit(X_train, y_train)

print("Training completed!")


# ---------------------------------------
# 6. Test model
# ---------------------------------------

predictions = model.predict(X_test)

accuracy = accuracy_score(
    y_test,
    predictions
)

print("\nModel Accuracy")
print("-------------------------")
print(f"{accuracy * 100:.2f}%")


# ---------------------------------------
# 7. Classification report
# ---------------------------------------

print("\nClassification Report")
print("-------------------------")

print(
    classification_report(
        y_test,
        predictions
    )
)


# ---------------------------------------
# 8. Save model
# ---------------------------------------

MODEL_PATH = "models/disease_risk_model.pkl"

joblib.dump(
    {
        "model": model,
        "features": features,
        "classes": model.classes_
    },
    MODEL_PATH
)

print("\nModel saved successfully!")
print(MODEL_PATH)