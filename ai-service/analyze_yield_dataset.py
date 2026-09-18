import pandas as pd

FILE_PATH = "dataset/yield_prediction/yield_df.csv"

df = pd.read_csv(FILE_PATH)

# Remove unnecessary index column
df = df.drop(columns=["Unnamed: 0"])

print("\nDataset Shape")
print("----------------")
print(df.shape)

print("\nColumns")
print("----------------")
print(df.columns.tolist())

print("\nUnique Areas")
print("----------------")
print(df["Area"].nunique())

print(df["Area"].unique())

print("\nUnique Crops")
print("----------------")
print(df["Item"].nunique())

print(df["Item"].unique())

print("\nYear Range")
print("----------------")
print(df["Year"].min(), "to", df["Year"].max())

print("\nYield Statistics")
print("----------------")
print(df["hg/ha_yield"].describe())

print("\nRainfall Statistics")
print("----------------")
print(df["average_rain_fall_mm_per_year"].describe())

print("\nPesticide Statistics")
print("----------------")
print(df["pesticides_tonnes"].describe())

print("\nTemperature Statistics")
print("----------------")
print(df["avg_temp"].describe())

print("\nDataset Sample")
print("----------------")
print(df.head())