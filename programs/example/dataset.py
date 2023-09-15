import pandas as pd


def read_words(words):
    df = pd.DataFrame(words)
    df['Word'] = df['name']
    return df


def read_dataset(archivo='Words'):
    palabras_df = pd.read_excel(f'./datasets/{archivo}.xlsx')
    return palabras_df


def write_dataset(df, archivo='output'):
    df.to_excel(f'../programs/{archivo}.xlsx', index=False)
