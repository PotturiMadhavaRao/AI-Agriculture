import os
import glob
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

def main():
    print("=== FAOSTAT Yield Prediction Model Training ===")
    
    data_dir = r"D:\bala\AI-Agriculture\datasets\faostat_crops"
    csv_files = glob.glob(os.path.join(data_dir, "*.csv"))
    print(f"Found {len(csv_files)} CSV files.")
    
    # 1. Merge all CSV files
    dfs = []
    for file in csv_files:
        try:
            df = pd.read_csv(file)
            dfs.append(df)
        except Exception as e:
            print(f"Error reading {file}: {e}")
            
    if not dfs:
        print("No valid CSV files found.")
        return
        
    raw_data = pd.concat(dfs, ignore_index=True)
    print(f"Total rows before cleaning: {len(raw_data)}")
    
    # Keep only relevant columns
    # ['faostat', 'm49 code', 'Country', 'Item Code', 'Item', 'Year', 'Yield (kg/ha)', 'Yield (kg/ha) flag', 'Production (tonnes)', 'Production (tonnes) flag', 'Area harvested (ha)', 'Area harvested (ha) flag']
    cols_to_keep = ['Country', 'Item', 'Year', 'Yield (kg/ha)']
    
    # Check if all columns exist
    missing_cols = [c for c in cols_to_keep if c not in raw_data.columns]
    if missing_cols:
        print(f"Error: Missing columns: {missing_cols}")
        return
        
    data = raw_data[cols_to_keep].copy()
    data.rename(columns={'Item': 'Crop', 'Yield (kg/ha)': 'Yield'}, inplace=True)
    
    # Drop rows with missing values
    initial_rows = len(data)
    data = data.dropna()
    print(f"Dropped {initial_rows - len(data)} rows with missing values.")
    
    # Drop duplicate records (Country, Crop, Year) keeping first
    initial_rows = len(data)
    data = data.drop_duplicates(subset=['Country', 'Crop', 'Year'], keep='first')
    print(f"Dropped {initial_rows - len(data)} duplicate rows.")
    
    # Drop negative/zero yields
    initial_rows = len(data)
    data = data[data['Yield'] > 0]
    print(f"Dropped {initial_rows - len(data)} rows with invalid yield (<=0).")
    
    # Map crop names to match our project standard
    crop_mapping = {
        'Maize (corn)': 'Maize',
        'Soya beans': 'Soybean',
        'Plantains and cooking bananas': 'Plantain',
        'Cassava leaves': 'Cassava', # Assuming we map leaves to Cassava for this example, though it might be distinct
        'Sweet potatoes': 'Sweet Potato',
        'Rice': 'Rice',
        'Wheat': 'Wheat',
        'Sorghum': 'Sorghum',
        'Potatoes': 'Potato',
        'Yams': 'Yams'
    }
    
    # Only keep mapped crops, replace names
    data['Crop'] = data['Crop'].map(crop_mapping).fillna(data['Crop'])
    
    # Ensure all crops are standard strings
    data['Crop'] = data['Crop'].str.title()
    
    print(f"Unique Countries: {len(data['Country'].unique())}")
    print(f"Unique Crops: {data['Crop'].unique()}")
    print(f"Years: {data['Year'].min()} - {data['Year'].max()}")
    print(f"Total valid rows after cleaning: {len(data)}")
    
    # 2. Train/Validation/Test Split (Chronological)
    # Train: < 2015, Val: 2015-2019, Test: >= 2020
    train_data = data[data['Year'] < 2015]
    val_data = data[(data['Year'] >= 2015) & (data['Year'] < 2020)]
    test_data = data[data['Year'] >= 2020]
    
    # If no data post 2020, use 80-10-10 split based on sorted years
    if len(test_data) < 100 or len(val_data) < 100:
        print("Not enough recent data for hard cutoff, falling back to percentile chronological split.")
        data = data.sort_values(by='Year')
        train_idx = int(len(data) * 0.8)
        val_idx = int(len(data) * 0.9)
        train_data = data.iloc[:train_idx]
        val_data = data.iloc[train_idx:val_idx]
        test_data = data.iloc[val_idx:]
        
    print(f"Train rows: {len(train_data)}")
    print(f"Validation rows: {len(val_data)}")
    print(f"Test rows: {len(test_data)}")
    
    # Features: Country, Crop, Year
    X_train = train_data[['Country', 'Crop', 'Year']]
    y_train = train_data['Yield']
    
    X_val = val_data[['Country', 'Crop', 'Year']]
    y_val = val_data['Yield']
    
    X_test = test_data[['Country', 'Crop', 'Year']]
    y_test = test_data['Yield']
    
    # 3. Model Training
    # Preprocessor: One-hot encode Country and Crop, passthrough Year
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), ['Country', 'Crop'])
        ],
        remainder='passthrough'
    )
    
    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=50, random_state=42, n_jobs=-1)) # Reduced estimators for speed
    ])
    
    print("Training model (Random Forest)...")
    model.fit(X_train, y_train)
    
    # 4. Evaluation
    print("\n--- Validation Performance ---")
    y_val_pred = model.predict(X_val)
    print(f"MAE:  {mean_absolute_error(y_val, y_val_pred):.2f}")
    print(f"RMSE: {np.sqrt(mean_squared_error(y_val, y_val_pred)):.2f}")
    print(f"R²:   {r2_score(y_val, y_val_pred):.4f}")
    
    print("\n--- Test Performance ---")
    y_test_pred = model.predict(X_test)
    print(f"MAE:  {mean_absolute_error(y_test, y_test_pred):.2f}")
    print(f"RMSE: {np.sqrt(mean_squared_error(y_test, y_test_pred)):.2f}")
    print(f"R²:   {r2_score(y_test, y_test_pred):.4f}")
    
    # 5. Output 10 Examples
    print("\n--- 10 Sample Test Predictions ---")
    sample = test_data.sample(10, random_state=42)
    sample_pred = model.predict(sample[['Country', 'Crop', 'Year']])
    
    for i, (_, row) in enumerate(sample.iterrows()):
        actual = row['Yield']
        predicted = sample_pred[i]
        error = abs(actual - predicted)
        print(f"Country: {row['Country']:<15} | Crop: {row['Crop']:<15} | Year: {row['Year']} | "
              f"Actual: {actual:>8.0f} | Predicted: {predicted:>8.0f} | Error: {error:>8.0f}")
              
    # 6. Save Model
    # Save combined dataset
    combined_path = os.path.join(r"D:\bala\AI-Agriculture\dataset\yield_prediction", "yield_faostat_combined.csv")
    os.makedirs(os.path.dirname(combined_path), exist_ok=True)
    data.to_csv(combined_path, index=False)
    print(f"\nSaved combined dataset to {combined_path}")
    
    model_path = r"D:\bala\AI-Agriculture\ai-service\models\yield_prediction_model.pkl"
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    joblib.dump(model, model_path)
    print(f"Saved pipeline (preprocessor + model) to {model_path}")
    
    print("\nTraining completed successfully.")

if __name__ == "__main__":
    main()
