import openai
import json
import asyncio


def authentication(api_key, organization):
    print(api_key)
    print(organization)
    openai.api_key = api_key
    openai.organization = organization
    return


def select_prompt(type, word):
    if type == 1:
        MESSAGE = f'Do you know the meaning of the word "{word}" in Spanish? \
            Please answer yes or no.'
    elif type == 2:
        MESSAGE = f'Is "{word}" a correct word in Spanish? Please answer, \
            yes or no.'
    elif type == 3:
        MESSAGE = f'Is "{word}" a valid word in Spanish? Please answer, \
            yes or no.'
    elif type == 4:
        MESSAGE = f'Is the word "{word}" in the Dictionary of the \
            Real Academia Española (RAE)? Please answer yes or no.'
    elif type == 5:
        MESSAGE = f'Tell me briefly the meaning of the following word in Spanish: {word}'
    else:
        MESSAGE = "ERROR"
    return MESSAGE

async def send_message_openai(word, MODEL="gpt-3.5-turbo", temperature=0, type=0,
                        role="user", timeout=10):
    messages = [
        {"role": role, "content": select_prompt(type, word)},
    ]
    try:
        async with asyncio.timeout(timeout):
            response = await openai.ChatCompletion.acreate(
                model=MODEL,
                messages=messages,
                temperature=temperature,
            )
    except openai.error.Timeout as e:
        # Handle timeout error, e.g. retry or log
        print(f"OpenAI API request timed out: {e}")
        return
    except openai.error.APIError as e:
        # Handle API error, e.g. retry or log
        print(f"OpenAI API returned an API Error: {e}")
        return
    except openai.error.APIConnectionError as e:
        # Handle connection error, e.g. check network or log
        print(f"OpenAI API request failed to connect: {e}")
        return
    except openai.error.InvalidRequestError as e:
        # Handle invalid request error, e.g. validate parameters or log
        print(f"OpenAI API request was invalid: {e}")
        return 
    except openai.error.AuthenticationError as e:
        # Handle authentication error, e.g. check credentials or log
        print(f"OpenAI API request was not authorized: {e}")
        return 
    except openai.error.PermissionError as e:
        # Handle permission error, e.g. check scope or log
        print(f"OpenAI API request was not permitted: {e}")
        return 
    except openai.error.RateLimitError as e:
        # Handle rate limit error, e.g. wait or log
        print(f"OpenAI API request exceeded rate limit: {e}")
        return
    except openai.error.ServiceUnavailableError as e:
        # Handle rate limit error, e.g. wait or log
        print(f"OpenAI API ServiceUnavailableError: {e}")
        return 
    except TimeoutError as e:
        # Handle rate limit error, e.g. wait or log
        print(f"TimeoutError: {e}")
        return 
    return response["choices"][0]["message"]["content"]


async def ask_completion(word, MODEL="text-davinci-003", temperature=0, type=0, 
                         timeout=10):
    prompt = select_prompt(type, word)
    if type == 5:
        max_tokens = 100
    else:
        max_tokens = 4
    try:
        async with asyncio.timeout(timeout):
            response = await openai.Completion.acreate(
                model='text-davinci-002',
                prompt=prompt,
                max_tokens=max_tokens,
                temperature=temperature,
            )
    except openai.error.Timeout as e:
        # Handle timeout error, e.g. retry or log
        print(f"OpenAI API request timed out: {e}")
        return 
    except openai.error.APIError as e:
        # Handle API error, e.g. retry or log
        print(f"OpenAI API returned an API Error: {e}")
        return 
    except openai.error.APIConnectionError as e:
        # Handle connection error, e.g. check network or log
        print(f"OpenAI API request failed to connect: {e}")
        return 
    except openai.error.InvalidRequestError as e:
        # Handle invalid request error, e.g. validate parameters or log
        print(f"OpenAI API request was invalid: {e}")
        return 
    except openai.error.AuthenticationError as e:
        # Handle authentication error, e.g. check credentials or log
        print(f"OpenAI API request was not authorized: {e}")
        return
    except openai.error.PermissionError as e:
        # Handle permission error, e.g. check scope or log
        print(f"OpenAI API request was not permitted: {e}")
        return 
    except openai.error.RateLimitError as e:
        # Handle rate limit error, e.g. wait or log
        print(f"OpenAI API request exceeded rate limit: {e}")
        return 
    except openai.error.ServiceUnavailableError as e:
        # Handle rate limit error, e.g. wait or log
        print(f"OpenAI API ServiceUnavailableError: {e}")
        return 
    except TimeoutError as e:
        # Handle rate limit error, e.g. wait or log
        print(f"TimeoutError: {e}")
        return 
    return response['choices'][0]['text']
