import pandas as pd

FILE_PATH = "dataset/yield_prediction/yield_df.csv"

df = pd.read_csv(FILE_PATH)

print("\nDataset Shape")
print("----------------")
print(df.shape)

print("\nColumns")
print("----------------")
print(df.columns.tolist())

print("\nFirst 5 Rows")
print("----------------")
print(df.head())

print("\nData Types")
print("----------------")
print(df.dtypes)

print("\nMissing Values")
print("----------------")
print(df.isnull().sum())

print("\nDuplicate Rows")
print("----------------")
print(df.duplicated().sum())

print("\nDataset Information")
print("----------------")
print(df.info())
