import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# ==========================================
# 1. Load Dataset
# ==========================================

FILE_PATH = "dataset/yield_prediction/yield_df.csv"

df = pd.read_csv(FILE_PATH)

print("\nDataset loaded successfully")
print("Original shape:", df.shape)


# ==========================================
# 2. Remove Unnecessary Column
# ==========================================

if "Unnamed: 0" in df.columns:
    df = df.drop(columns=["Unnamed: 0"])


# ==========================================
# 3. Define Features and Target
# ==========================================

features = [
    "Area",
    "Item",
    "Year",
    "average_rain_fall_mm_per_year",
    "pesticides_tonnes",
    "avg_temp"
]

target = "hg/ha_yield"

X = df[features]
y = df[target]


print("\nFeatures:")
print(features)

print("\nTarget:")
print(target)


# ==========================================
# 4. Split Dataset
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)

print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))


# ==========================================
# 5. Define Categorical and Numerical Columns
# ==========================================

categorical_features = [
    "Area",
    "Item"
]

numerical_features = [
    "Year",
    "average_rain_fall_mm_per_year",
    "pesticides_tonnes",
    "avg_temp"
]


# ==========================================
# 6. Preprocessing
# ==========================================

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(
                handle_unknown="ignore"
            ),
            categorical_features
        ),
        (
            "numerical",
            "passthrough",
            numerical_features
        )
    ]
)


# ==========================================
# 7. Create Random Forest Model
# ==========================================

model = RandomForestRegressor(
    n_estimators=200,
    random_state=42,
    n_jobs=-1
)


# ==========================================
# 8. Create Complete Pipeline
# ==========================================

pipeline = Pipeline(
    steps=[
        (
            "preprocessor",
            preprocessor
        ),
        (
            "model",
            model
        )
    ]
)


# ==========================================
# 9. Train Model
# ==========================================

print("\nTraining model...")
print("Please wait...")

pipeline.fit(
    X_train,
    y_train
)

print("Model training completed!")


# ==========================================
# 10. Make Predictions
# ==========================================

predictions = pipeline.predict(X_test)


# ==========================================
# 11. Evaluate Model
# ==========================================

mae = mean_absolute_error(
    y_test,
    predictions
)

mse = mean_squared_error(
    y_test,
    predictions
)

rmse = mse ** 0.5

r2 = r2_score(
    y_test,
    predictions
)


print("\n================================")
print("MODEL EVALUATION")
print("================================")

print(f"MAE  : {mae:.2f}")
print(f"RMSE : {rmse:.2f}")
print(f"R²   : {r2:.4f}")


# ==========================================
# 12. Save Model
# ==========================================

MODEL_PATH = "models/yield_prediction_model.pkl"

joblib.dump(
    {
        "model": pipeline,
        "features": features,
        "target": target
    },
    MODEL_PATH
)

print("\nModel saved successfully!")
print(MODEL_PATH)