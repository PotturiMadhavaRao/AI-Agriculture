import pandas as pd
import os
import glob

data_dir = r"D:\bala\AI-Agriculture\datasets\faostat_crops"
csv_files = glob.glob(os.path.join(data_dir, "*.csv"))

print(f"Found {len(csv_files)} CSV files.")

for file in csv_files:
    df = pd.read_csv(file)
    print(f"\n--- {os.path.basename(file)} ---")
    print(f"Rows: {df.shape[0]}, Cols: {df.shape[1]}")
    print(f"Columns: {list(df.columns)}")
    
    if 'Item' in df.columns:
        print(f"Crops/Items: {df['Item'].unique()}")
    
    if 'Year' in df.columns:
        print(f"Years: {df['Year'].min()} - {df['Year'].max()}")
        
    if 'Element' in df.columns:
        print(f"Elements: {df['Element'].unique()}")
        
    if 'Unit' in df.columns:
        print(f"Units: {df['Unit'].unique()}")
