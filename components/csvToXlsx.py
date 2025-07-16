import pandas as pd 
import sys

read_file = pd.read_csv(sys.argv[1])
read_file.to_excel('CRA.xlsx', sheet_name='for_encoding', index=False, header=True)
