import pandas as pd

parquet_path = '/Users/christian/dev/my-prime/my-prime-rl/prime-rl/work/swe-grep-env/src/grep_dataset_2_v3.parquet'

# Load the parquet file
df = pd.read_parquet(parquet_path)

# Print each column of the first row with vertical spacing
print("=" * 80)
print("FIRST ROW DATA")
print("=" * 80)

for column in df.columns:
    print(f"\n{column}:")
    print("-" * 80)
    print(df.iloc[0][column])
    print()

# Print summary statistics
print("\n" + "=" * 80)
print("DATASET SUMMARY")
print("=" * 80)
print(f"\nTotal rows: {len(df)}")
print(f"Total columns: {len(df.columns)}")
print(f"\nColumn names: {', '.join(df.columns)}")

