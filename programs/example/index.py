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


def check_and_create_columns(df, column_names):
    for column_name in column_names:
        if column_name not in df.columns:
            df[column_name] = None


def fix_empty(df):
    # Preparación
    MAX_PROMPT = 5
    for index in range(len(df)):
        print(f"{index} of {len(df)}")
        dataset.write_dataset(df)
        for number_prompt in range(1, MAX_PROMPT):
            for model in ['davinci', 'gpt3']:
                if (isinstance(df.loc[index, f'Prompt_{number_prompt}_{model}'], float) and np.isnan(df.loc[index, f'Prompt_{number_prompt}_{model}'])) or (df.loc[index, f'Prompt_{number_prompt}_{model}'] is None):
                    word = df.loc[index, 'Word']
                    if model == 'davinci':
                        df.loc[index, f'Prompt_{number_prompt}_davinci'] = asyncio.run(openai_api.ask_completion(word, type=number_prompt, timeout=120))
                    elif model == 'gpt3':
                        df.loc[index, f'Prompt_{number_prompt}_gpt3'] = asyncio.run(openai_api.send_message_openai(word, type=number_prompt, timeout=120))
    dataset.write_dataset(df)
    return df 


async def loop_through(df):
    MAX_PROMPT = 5
    temp1 = [f'Prompt_{number_prompt}_gpt3' for number_prompt in range(1, MAX_PROMPT)]
    temp2 = [f'Prompt_{number_prompt}_davinci' for number_prompt in range(1, MAX_PROMPT)]
    check_and_create_columns(df, temp1 + temp2)
    paso = 50
    for inicio, fin in zip(range(0, len(df), paso), range(paso, len(df)+paso, paso)):
        dataset.write_dataset(df)
        for number_prompt in range(1, MAX_PROMPT):
            df.loc[inicio:fin, f'Prompt_{number_prompt}_gpt3'] = await asyncio.gather(*(openai_api.send_message_openai(word, type=number_prompt) for word in df.loc[inicio:fin, 'Word']))
            df.loc[inicio:fin, f'Prompt_{number_prompt}_davinci'] = await asyncio.gather(*(openai_api.ask_completion(word, type=number_prompt) for word in df.loc[inicio:fin, 'Word']))

    dataset.write_dataset(df)
    return df


def binary(df):
    MAX_PROMPT = 5
    temp1 = [f'Prompt_{number_prompt}_gpt3' for number_prompt in range(1, MAX_PROMPT)]
    temp2 = [f'Prompt_{number_prompt}_davinci' for number_prompt in range(1, MAX_PROMPT)]
    columns = temp1 + temp2
    for column in columns:
        df[f'{column}_binario'] = df[column].str.contains('|'.join('yes'), case=False, regex=True)
        df[f'{column}_binario'] = df[f'{column}_binario'].map({True: 1, False: 0})
        dataset.write_dataset(df)


def meaning(df):
    check_and_create_columns(df, ["Meaning_gpt3", "Meaning_davinci"])

    for index in range(len(df)):
        print(f"{index} of {len(df)}")
        dataset.write_dataset(df)
        word = df.loc[index, 'Word']
        df.loc[index, 'Meaning_davinci'] = asyncio.run(openai_api.ask_completion(word, type=5, timeout=120))
        df.loc[index, 'Meaning_gpt3'] = asyncio.run(openai_api.send_message_openai(word, type=5, timeout=120))

    dataset.write_dataset(df)
    return 


def run_experiment(words, model="ChatGPT", version="3.5", temperature="0"):

    dataset_df = dataset.read_words(words)
    dataset_df = asyncio.run(loop_through(dataset_df))
    fix_empty(dataset_df)
    binary(dataset_df)
    meaning(dataset_df)

def stop_experiment_status_from_api(experimentId, url = 'http://localhost:3000'):
    urlStopExperiment = url + '/experiment/stop/'+ str(experimentId)
    try:
        requests.post(urlStopExperiment)
        print("Program marked as error")
    except Exception as e:
        print(e)
        print("Experiment not stopped")

def error_experiment_status_from_api(experimentId, url = 'http://localhost:3000'):
    urlErrorExperiment = url + '/experiment/error/'+ str(experimentId)
    try:
        requests.post(urlErrorExperiment)
        print("Program marked as error")
    except Exception as e:
        print(e)
        print("Experiment not marked as error")

def thread_check_status(experimentId):
    while not stop_event.is_set():
        try:
            experiment = connector.get_experiment_from_api(experimentId)
            if experiment['status'] == 0 or experiment['status'] == 2:
                stop_event.set()
                print("Close program")
                time.sleep(3)
        except Exception as e:
                print(e)
                error_experiment_status_from_api(experimentId)
                stop_event.set()


def start_experiment(experimentId):
    words = connector.get_words_from_api(experimentId)[0]
    openai_api.authentication()
    #run_experiment(words)

    status_thread = threading.Thread(target=thread_check_status, args=(experimentId))
    main_thread = threading.Thread(target=run_experiment(words), args=(experimentId))

    status_thread.start()
    main_thread.start()

    status_thread.join()
    main_thread.join()
    
def start_experiment_delete(experimentId):
    words = connector.get_words_from_api(experimentId)[0]
    openai_api.authentication()
    run_experiment(words)


def main():
    if len(sys.argv) < 2:
        pass
    else:
        experimentId = sys.argv[1]
        start_experiment_delete(experimentId)


if __name__ == "__main__":
    stop_event = threading.Event()
    main()


