import pandas as pd

DATASET_PATH = "dataset/crop_recommendation/Crop_recommendation.csv"

# Load dataset
df = pd.read_csv(DATASET_PATH)

print("\n==============================")
print("CROP RECOMMENDATION DATASET")
print("==============================")

# Dataset size
print("\nDataset Shape:")
print(df.shape)

# Column names
print("\nColumns:")
print(df.columns.tolist())

# Missing values
print("\nMissing Values:")
print(df.isnull().sum())

# Duplicate rows
print("\nDuplicate Rows:")
print(df.duplicated().sum())

# Data types
print("\nData Types:")
print(df.dtypes)

# Number of crop classes
print("\nNumber of Crop Classes:")
print(df["label"].nunique())

# Crop names
print("\nCrop Classes:")
print(sorted(df["label"].unique()))

# Number of samples for each crop
print("\nSamples per Crop:")
print(df["label"].value_counts().sort_index())

# Basic statistics
print("\nFeature Statistics:")
print(df.describe())

print("\nDataset validation completed!")
