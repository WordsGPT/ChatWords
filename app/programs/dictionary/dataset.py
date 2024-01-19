import pandas as pd


def read_words(words):
    df = pd.DataFrame(words)
    df['Word'] = df['name']
    return df

