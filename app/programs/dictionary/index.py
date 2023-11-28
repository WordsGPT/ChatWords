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
PROGRAM_BACKEND_PORT = os.getenv('PROGRAM_BACKEND_PORT', '3000')
PROGRAM_BACKEND_HOST = os.getenv('PROGRAM_BACKEND_HOST', 'localhost')
PERMANENT_TOKEN = os.getenv('PERMANENT_TOKEN')
PROGRAM_OPENAI_API_KEY = os.getenv('PROGRAM_OPENAI_API_KEY')
PROGRAM_OPENAI_ORGANIZATION = os.getenv('PROGRAM_OPENAI_ORGANIZATION', '')
URL = f'http://{PROGRAM_BACKEND_HOST}:{PROGRAM_BACKEND_PORT}'
COLUMNS = [
    'Do you know the meaning of the word in Spanish?',
    'Is correct word in Spanish?',
    'Is valid word in Spanish?',
    'Is the word in the Dictionary of the Real Academia Española (RAE)?',
    'Tell me briefly the meaning of the word in Spanish',
]

def check_and_create_columns(df, column_names):
    for column_name in column_names:
        if column_name not in df.columns:
            df[column_name] = None

def loop_through(df):
    check_and_create_columns(df, COLUMNS)
    for index in range(len(df)):
        # print(f"{index} of {len(df)}")
        word = df.loc[index, 'Word']
        word_id = df.loc[index, 'id']

        prompt_1_answer = asyncio.run(openai_api.send_message_openai(word, type=1))
        prompt_2_answer = asyncio.run(openai_api.send_message_openai(word, type=2))
        prompt_3_answer = asyncio.run(openai_api.send_message_openai(word, type=3))
        prompt_4_answer = asyncio.run(openai_api.send_message_openai(word, type=4))
        prompt_5_answer = asyncio.run(openai_api.send_message_openai(word, type=5))

        df.loc[index, COLUMNS[0]] = prompt_1_answer
        df.loc[index, COLUMNS[1]] = prompt_2_answer
        df.loc[index, COLUMNS[2]] = prompt_3_answer
        df.loc[index, COLUMNS[3]] = prompt_4_answer
        df.loc[index, COLUMNS[4]] = prompt_5_answer

        result = {
            COLUMNS[0]: prompt_1_answer,
            COLUMNS[1]: prompt_2_answer,
            COLUMNS[2]: prompt_3_answer,
            COLUMNS[3]: prompt_4_answer,
            COLUMNS[4]: prompt_5_answer,
        }
        connector.patch_word_from_api(word_id, result, url=URL, token=PERMANENT_TOKEN)

    return df





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
    loop_through(dataset_df)

    #meaning(dataset_df)
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
    openai_api.authentication(PROGRAM_OPENAI_API_KEY, PROGRAM_OPENAI_ORGANIZATION)
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


