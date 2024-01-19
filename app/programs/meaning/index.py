import pandas as pd
import openai_api
import dataset
import requests
import time
import asyncio
import numpy as np
import connector
import sys
import threading
import os
from dotenv import load_dotenv


load_dotenv('../../.env')
BACKEND_PORT = os.getenv('BACKEND_PORT', '3000')
BACKEND_HOST = os.getenv('BACKEND_HOST', 'localhost')
PERMANENT_TOKEN = os.getenv('PERMANENT_TOKEN', 'permanentTokenExample')
URL = f'http://{BACKEND_HOST}:{BACKEND_PORT}'

def check_and_create_columns(df, column_names):
    for column_name in column_names:
        if column_name not in df.columns:
            df[column_name] = None

async def loop_through(df):
    MAX_PROMPT = 5
    temp1 = [f'Prompt_{number_prompt}_gpt3' for number_prompt in range(1, MAX_PROMPT)]
    temp2 = [f'Prompt_{number_prompt}_davinci' for number_prompt in range(1, MAX_PROMPT)]
    check_and_create_columns(df, temp1 + temp2)
    paso = 50
    for inicio, fin in zip(range(0, len(df), paso), range(paso, len(df)+paso, paso)):
        for number_prompt in range(1, MAX_PROMPT):
            df.loc[inicio:fin, f'Prompt_{number_prompt}_gpt3'] = await asyncio.gather(*(openai_api.send_message_openai(word, type=number_prompt) for word in df.loc[inicio:fin, 'Word']))
            df.loc[inicio:fin, f'Prompt_{number_prompt}_davinci'] = await asyncio.gather(*(openai_api.ask_completion(word, type=number_prompt) for word in df.loc[inicio:fin, 'Word']))

    return df


def fix_empty(df):
    # Preparación
    MAX_PROMPT = 5
    for index in range(len(df)):
        print(f"{index} of {len(df)}")
        for number_prompt in range(1, MAX_PROMPT):
            for model in ['davinci', 'gpt3']:
                if (isinstance(df.loc[index, f'Prompt_{number_prompt}_{model}'], float) and np.isnan(df.loc[index, f'Prompt_{number_prompt}_{model}'])) or (df.loc[index, f'Prompt_{number_prompt}_{model}'] is None):
                    word = df.loc[index, 'Word']
                    if model == 'davinci':
                        df.loc[index, f'Prompt_{number_prompt}_davinci'] = asyncio.run(openai_api.ask_completion(word, type=number_prompt, timeout=120))
                    elif model == 'gpt3':
                        df.loc[index, f'Prompt_{number_prompt}_gpt3'] = asyncio.run(openai_api.send_message_openai(word, type=number_prompt, timeout=120))
    return df 


def binary(df):
    MAX_PROMPT = 5
    temp1 = [f'Prompt_{number_prompt}_gpt3' for number_prompt in range(1, MAX_PROMPT)]
    temp2 = [f'Prompt_{number_prompt}_davinci' for number_prompt in range(1, MAX_PROMPT)]
    columns = temp1 + temp2
    for column in columns:
        df[f'{column}_binario'] = df[column].str.contains('|'.join('yes'), case=False, regex=True)
        df[f'{column}_binario'] = df[f'{column}_binario'].map({True: 1, False: 0})


def meaning(df):
    check_and_create_columns(df, ["Meaning_gpt3", "Meaning_davinci"])

    for index in range(len(df)):
        # print(f"{index} of {len(df)}")
        word = df.loc[index, 'Word']
        word_id = df.loc[index, 'id']
        meaning_davinci = asyncio.run(openai_api.ask_completion(word, type=5, timeout=120))
        print(meaning_davinci)
        meaning_gpt3 = asyncio.run(openai_api.send_message_openai(word, type=5, timeout=120))
        print(meaning_gpt3)
        df.loc[index, 'Meaning_davinci'] = meaning_davinci
        df.loc[index, 'Meaning_gpt3'] = meaning_gpt3
        result = {'Translation davinci': meaning_davinci,
                    'Meaning gpt3': meaning_gpt3}
        connector.patch_word_from_api(word_id, result, url=URL, token=PERMANENT_TOKEN)

    return 


def run_experiment(experimentId, words, model="ChatGPT", version="3.5", temperature="0"):

    dataset_df = dataset.read_words(words)
    dataset_df = asyncio.run(loop_through(dataset_df))
    
    # fix_empty(dataset_df)
    # binary(dataset_df)
    meaning(dataset_df)
    connector.stop_experiment_status_from_api(experimentId, url=URL, token=PERMANENT_TOKEN)   



def thread_check_status(experimentId):
    while not stop_event.is_set():
        try:
            experiment = connector.get_experiment_from_api(experimentId, url=URL, token=PERMANENT_TOKEN)
            if experiment['status'] == 0 or experiment['status'] == 2:
                stop_event.set()
                print("Close program")
                time.sleep(3)
        except Exception as e:
                print(e)
                connector.error_experiment_status_from_api(experimentId, url=URL, token=PERMANENT_TOKEN)
                stop_event.set()


def start_experiment(experimentId):
    words = connector.get_words_from_api(experimentId, url=URL, token=PERMANENT_TOKEN)[0]
    status_thread = threading.Thread(target=thread_check_status, args=(experimentId))
    main_thread = threading.Thread(target=run_experiment(experimentId, words), args=(experimentId))

    status_thread.start()
    main_thread.start()

    status_thread.join()
    main_thread.join()
    
def start_experiment_delete(experimentId):
    words = connector.get_words_from_api(experimentId, url=URL, token=PERMANENT_TOKEN)[0]
    openai_api.authentication()
    run_experiment(experimentId, words)


def main():
    if len(sys.argv) < 2:
        pass
    else:
        experimentId = sys.argv[1]
        start_experiment_delete(experimentId)


if __name__ == "__main__":
    stop_event = threading.Event()
    main()


