import requests


def get_experiment_from_api(experimentId, url = 'http://localhost:3000'):
    urlExperiment = url + '/experiment/' + str(experimentId)

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
    

def get_words_from_api(experimentId, url = 'http://localhost:3000'):
    urlWord = url + '/word?experimentId='+ str(experimentId)+'&withResult=false'

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
    

def patch_word_from_api(wordId, result, url = 'http://localhost:3000'):
    urlWord = url + '/word/' + str(wordId)
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
