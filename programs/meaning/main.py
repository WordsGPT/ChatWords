import connector
import sys
import wrapper


def start_experiment(experimentId):
    experiment = connector.get_experiment_from_api(experimentId)
    words = connector.get_words_from_api(experimentId)
    print(words)
    #wrapper.run_experiment(words)


def main():
    if len(sys.argv) < 2:
        pass
    else:
        experimentId = sys.argv[1]
        print(sys.argv)
        start_experiment(experimentId)


if __name__ == "__main__":
    main()
