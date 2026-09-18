import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report


# ==========================================
# 1. Load Dataset
# ==========================================

DATASET_PATH = "dataset/crop_recommendation/Crop_recommendation.csv"

df = pd.read_csv(DATASET_PATH)

print("\n===================================")
print("CROP RECOMMENDATION MODEL TRAINING")
print("===================================")

print("\nDataset Shape:")
print(df.shape)


# ==========================================
# 2. Separate Features and Target
# ==========================================

features = [
    "N",
    "P",
    "K",
    "temperature",
    "humidity",
    "ph",
    "rainfall"
]

target = "label"

X = df[features]
y = df[target]

print("\nFeatures:")
print(features)

print("\nNumber of Crop Classes:")
print(y.nunique())


# ==========================================
# 3. Split Dataset
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\nTraining Samples:")
print(len(X_train))

print("\nTesting Samples:")
print(len(X_test))


# ==========================================
# 4. Create Random Forest Model
# ==========================================

model = RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    n_jobs=-1
)


# ==========================================
# 5. Train Model
# ==========================================

print("\nTraining model...\n")

model.fit(X_train, y_train)

print("Training completed!")


# ==========================================
# 6. Make Predictions
# ==========================================

y_pred = model.predict(X_test)


# ==========================================
# 7. Evaluate Model
# ==========================================

accuracy = accuracy_score(y_test, y_pred)

print("\n===================================")
print("MODEL EVALUATION")
print("===================================")

print(f"\nAccuracy: {accuracy * 100:.2f}%")

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        y_pred
    )
)


# ==========================================
# 8. Save Model
# ==========================================

MODEL_PATH = "models/crop_recommendation_model.pkl"

joblib.dump(
    {
        "model": model,
        "features": features,
        "classes": sorted(y.unique())
    },
    MODEL_PATH
)

print("\n===================================")
print("MODEL SAVED")
print("===================================")

print(f"\nModel location:")
print(MODEL_PATH)

print("\nCrop recommendation model training completed!")