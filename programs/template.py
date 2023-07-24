import requests
import pandas as pd
import time

import sys

if len(sys.argv) < 2:
    print('Please call the script as python program.py [experimentNumber]')
else:
    experimentId = sys.argv[1]
    print('Executing experiment ' + experimentId)


def get_experiment_from_api(experimentId):
    urlExperiment = url + '/experiment/'+ str(experimentId)

    try:
        response = requests.get(urlExperiment)

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
    urlWord = url + '/word?experimentId='+ str(experimentId)

    try:
        response = requests.get(urlWord)

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
    urlWord = url + '/word/'+ str(wordId)
    patch_data = {
        'result': result
    }

    try:
        response = requests.patch(urlWord, json=patch_data)
        if response.status_code in (200, 204):
            print('Patch successful.')
        else:
            print(f'Patch failed. Status code: {response.status_code}')

    except requests.exceptions.RequestException as e:
        print(f'An error occurred: {e}')


def calculate_result(row):
    # simulating call to api
    time.sleep(2)
    result = {'result1':'Example of result',
              'result2': 'Example of result 2'}
    patch_word_from_api(row["id"], result)
    return result


url = 'http://localhost:3000'

experiment = get_experiment_from_api(experimentId)
words = get_words_from_api(experimentId)
df = pd.DataFrame(words)

df['result'] = df.apply(calculate_result, axis=1)
print(df)





