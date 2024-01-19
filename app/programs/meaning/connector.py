import requests

def addHeaders(token):
    return {'Authorization': f'Bearer {token}'}

def get_experiment_from_api(experimentId, url, token):
    urlExperiment = url + '/experiment/' + str(experimentId)

    try:
        response = requests.get(urlExperiment, addHeaders(token))

        if response.status_code == 200:
            data = response.json()
            return data
        else:
            print(f"Failed to fetch data. Status code: {response.status_code}")
            return None

    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        return None
    

def get_words_from_api(experimentId, url, token):
    urlWord = url + '/word?experimentId='+ str(experimentId)+'&withResult=false'

    try:
        response = requests.get(urlWord, headers=addHeaders(token))

        if response.status_code == 200:
            data = response.json()
            return data
        else:
            print(f"Failed to fetch data. Status code: {response.status_code}")
            return None

    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        return None
    

def patch_word_from_api(wordId, result, url, token):
    urlWord = url + '/word/' + str(wordId)
    print(urlWord)
    patch_data = {
        'result': result
    }
    print(patch_data)

    try:
        response = requests.patch(urlWord, json=patch_data, headers=addHeaders(token))
        if response.status_code in (200, 204):
            print('Patch successful.')
        else:
            print(f'Patch failed. Status code: {response.status_code}')

    except requests.exceptions.RequestException as e:
        print(f'An error occurred: {e}')

def stop_experiment_status_from_api(experimentId, url, token):
    urlStopExperiment = url + '/experiment/stop/'+ str(experimentId)
    try:
        requests.post(urlStopExperiment, headers=addHeaders(token))
        print("Program marked as error")
    except Exception as e:
        print(e)
        print("Experiment not stopped")
        

def error_experiment_status_from_api(experimentId, url, token):
    urlErrorExperiment = url + '/experiment/error/'+ str(experimentId)
    try:
        requests.post(urlErrorExperiment, headers=addHeaders(token))
        print("Program marked as error")
    except Exception as e:
        print(e)
        print("Experiment not marked as error")