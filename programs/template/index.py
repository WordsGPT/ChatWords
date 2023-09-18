import requests
import pandas as pd
import time
import threading
import os
from dotenv import load_dotenv

import sys

'''
Experiment status:
0: stopped
1: running
2: error
'''

load_dotenv('../../.env')

BACKEND_PORT = os.getenv('BACKEND_PORT', '3000')
BACKEND_HOST = os.getenv('BACKEND_HOST', 'localhost')
PERMANENT_TOKEN = os.getenv('PERMANENT_TOKEN', 'permanentTokenExample')
URL = f'http://{BACKEND_HOST}:{BACKEND_PORT}'
stop_event = threading.Event()



if len(sys.argv) < 2:
    print('Please call the script as python program.py [experimentNumber]')
else:
    experimentId = sys.argv[1]
    print('Executing experiment ' + experimentId)

def addHeaders():
    return {'Authorization': f'Bearer {PERMANENT_TOKEN}'}


def get_experiment_from_api(experimentId):
    urlExperiment = URL + '/experiment/'+ str(experimentId)

    try:
        response = requests.get(urlExperiment, headers = addHeaders())

        if response.status_code == 200:
            data = response.json()
            return data
        else:
            print(f"Failed to fetch data. Status code: {response.status_code}")
            return None

    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        return None
    

def get_words_from_api(experimentId):
    urlWord = URL + '/word?experimentId='+ str(experimentId)+'&withResult=false'

    try:
        response = requests.get(urlWord, headers = addHeaders())

        if response.status_code == 200:
            data = response.json()
            return data
        else:
            print(f"Failed to fetch data. Status code: {response.status_code}")
            return None

    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        return None
    
def patch_word_from_api(wordId, result):
    urlWord = URL + '/word/'+ str(wordId)
    patch_data = {
        'result': result
    }

    try:
        response = requests.patch(urlWord, json=patch_data, headers = addHeaders())
        if response.status_code in (200, 204):
            print('Patch successful.')
        else:
            print(f'Patch failed. Status code: {response.status_code}')

    except requests.exceptions.RequestException as e:
        print(f'An error occurred: {e}')

def stop_experiment_status_from_api(experimentId):
    urlStopExperiment = URL + '/experiment/stop/'+ str(experimentId)
    try:
        requests.post(urlStopExperiment, headers = addHeaders())
        print("Program marked as error")
    except Exception as e:
        print(e)
        print("Experiment not stopped")

def error_experiment_status_from_api(experimentId):
    urlErrorExperiment = URL + '/experiment/error/'+ str(experimentId)
    try:
        requests.post(urlErrorExperiment, headers = addHeaders())
        print("Program marked as error")
    except Exception as e:
        print(e)
        print("Experiment not marked as error")

def thread_check_status(experimentId):
    while not stop_event.is_set():
        try:
            experiment = get_experiment_from_api(experimentId)
            if experiment['status'] == 0 or experiment['status'] == 2:
                stop_event.set()
                print("Close program")
                time.sleep(3)
        except Exception as e:
                print(e)
                error_experiment_status_from_api(experimentId)
                stop_event.set()


def thread_main_program(experimentId):
    def calculate_result(row):
        if not stop_event.is_set():
            # simulating call to api
            time.sleep(2)
            result = {'result1':'Example of result',
                    'result2': 'Example of result 2'}
            patch_word_from_api(row["id"], result)
            return result
        else:
            raise StopIteration()

    experiment = get_experiment_from_api(experimentId)
    words = get_words_from_api(experimentId)[0]
    df = pd.DataFrame(words)
    try:
        df['result'] = df.apply(calculate_result, axis=1)
    except StopIteration:
        print("Program stopped")
    except Exception as e:
        print(e)
        error_experiment_status_from_api(experimentId)

    finally:
        stop_event.set()
    stop_experiment_status_from_api(experimentId)    
    print(df)

status_thread = threading.Thread(target=thread_check_status, args=(experimentId))
main_thread = threading.Thread(target=thread_main_program, args=(experimentId))

status_thread.start()
main_thread.start()

status_thread.join()
main_thread.join()

print("Both threads have finished.")


