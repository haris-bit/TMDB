import requests
import json
import time
import os
import argparse
import urllib.request

# Initialize the parser
parser = argparse.ArgumentParser(description="Scraping TMDB")

# Add the 'type' command line argument
parser.add_argument('--type', type=str, required=True, choices=['person', 'movie','download-genre'],
                    help='Specify whether to perform persons scraping or movies scraping')

args = parser.parse_args()


API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1ODljOWJlMTkxYWUwN2VlZjk0YTgwNmQ1N2E1YTExNiIsInN1YiI6IjY0Nzk1YmM1MGUyOWEyMDBiZjFkZjEyMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Myu-8IC9IvWsw9SMBdkGRmme1mgdzSWmbrasn7nWoFY"
def get_person_detail(id):
    url = f"https://api.themoviedb.org/3/person/{id}?language=en-US"
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    response = requests.get(url, headers=headers)
    print(f"person id {id} {response.status_code} {response.reason}")

    if response.status_code!=200:
        return None

    print(response.headers['content-type'])

    if not response.headers['content-type'].startswith('application/json'):
        print(f'Error: response from id {id} is not JSON. Response content: {response.content}')
        return None

    return response.json()


def get_movie_detail(id):
    url = f"https://api.themoviedb.org/3/movie/{id}?language=en-US"
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    response = requests.get(url, headers=headers)
    print(f"movie id {id} {response.status_code} {response.reason}")

    if response.status_code!=200:
        return None

    print(response.headers['content-type'])

    if not response.headers['content-type'].startswith('application/json'):
        print(f'Error: response from id {id} is not JSON. Response content: {response.content}')
        return None

    return response.json()



def start_persons_scrapping():
    personids = json.load(open('tmdb_datasets/person_ids_05_15_2023.json', 'r'))

    try:
        with open('done.txt', 'r') as f:
            done_ids = {int(line.strip()) for line in f}
    except FileNotFoundError:
        done_ids = set()

    # Define a directory for the files
    directory = "people_data_files"
    # Create the directory if it doesn't exist
    os.makedirs(directory, exist_ok=True)

    # Limit for entries per file
    entries_per_file = 100000
    file_count = 1

    # Open the first output file
    f_data = open(f"{directory}/peopledata_{file_count}.json", 'w')
    # Start the first JSON array
    f_data.write('[\n')

    count = 0
    for person_obj in personids:
        try:
            if person_obj['id'] in done_ids:
                continue


            data = get_person_detail(person_obj['id'])

            time.sleep(0.02)
            if data is None:
                continue

            dataobj = {}
            dataobj.update(person_obj)
            dataobj.update(data)

            # Write the data object to the current file, followed by a comma
            f_data.write(json.dumps(dataobj) + ',\n')

            count += 1

            with open('done.txt', 'a') as fp:
                fp.write(str(person_obj['id']) + "\n")
            done_ids.add(person_obj['id'])

            # If we've reached the limit for the current file, start a new one
            if count % entries_per_file == 0:
                # End the current JSON array
                f_data.seek(f_data.tell() - 2, os.SEEK_SET)  # Go back 2 characters to overwrite the trailing comma
                f_data.write('\n]\n')
                f_data.close()

                # Increment the file count
                file_count += 1

                # Open the next output file
                f_data = open(f"{directory}/peopledata_{file_count}.json", 'w')

                # Start the next JSON array
                f_data.write('[\n')

        except Exception as e:
            print(f"Error: {str(e)} for person id {person_obj['id']}")
            with open('notdone.txt', 'a') as fp:
                fp.write(str(person_obj['id']) + "\n")

    # End the last JSON array
    f_data.seek(f_data.tell() - 2, os.SEEK_SET)  # Go back 2 characters to overwrite the trailing comma
    f_data.write('\n]\n')
    f_data.close()


def start_movies_scrapping():
    movieids = json.load(open('tmdb_datasets/movie_ids_05_15_2023.json', 'r'))

    try:
        with open('movie_done.txt', 'r') as f:
            done_ids = {int(line.strip()) for line in f}
    except FileNotFoundError:
        done_ids = set()

    # Define a directory for the files
    directory = "movie_data_files"
    # Create the directory if it doesn't exist
    os.makedirs(directory, exist_ok=True)

    # Limit for entries per file
    entries_per_file = 100000
    file_count = 1

    # Open the first output file
    f_data = open(f"{directory}/moviedata_{file_count}.json", 'w')
    # Start the first JSON array
    f_data.write('[\n')

    count = 0
    for movie_obj in movieids:
        try:
            if movie_obj['id'] in done_ids:
                continue


            data = get_movie_detail(movie_obj['id'])

            time.sleep(0.02)
            if data is None:
                continue

            dataobj = {}
            dataobj.update(movie_obj)
            dataobj.update(data)

            # Write the data object to the current file, followed by a comma
            f_data.write(json.dumps(dataobj) + ',\n')

            count += 1

            with open('movie_done.txt', 'a') as fp:
                fp.write(str(movie_obj['id']) + "\n")
            done_ids.add(movie_obj['id'])

            # If we've reached the limit for the current file, start a new one
            if count % entries_per_file == 0:
                # End the current JSON array
                f_data.seek(f_data.tell() - 2, os.SEEK_SET)  # Go back 2 characters to overwrite the trailing comma
                f_data.write('\n]\n')
                f_data.close()

                # Increment the file count
                file_count += 1

                # Open the next output file
                f_data = open(f"{directory}/moviedata_{file_count}.json", 'w')

                # Start the next JSON array
                f_data.write('[\n')

        except Exception as e:
            print(f"Error: {str(e)} for movie id {movie_obj['id']}")
            with open('movienotdone.txt', 'a') as fp:
                fp.write(str(movie_obj['id']) + "\n")

    # End the last JSON array
    f_data.seek(f_data.tell() - 2, os.SEEK_SET)  # Go back 2 characters to overwrite the trailing comma
    f_data.write('\n]\n')
    f_data.close()


# Function to get a list of all genres
def get_genres():

    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    response = requests.get(f"https://api.themoviedb.org/3/genre/movie/list?language=en",headers=headers)
    return response.json()['genres']

# Function to get a list of popular movies for a genre
def get_popular_movies(genre_id):
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    response = requests.get(f"https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&with_genres={genre_id}",headers=headers)
    return response.json()['results']

# Function to download an image
def download_image(url, path):
    urllib.request.urlretrieve(url, path)


def download_genre():
    # Get the list of all genres
    genres = get_genres()
    movies_id = []

    # For each genre, get a list of popular movies, and download an image for one of the movies
    for genre in genres:
        movies = get_popular_movies(genre['id'])
        if movies:
            # Get the poster image for the first movie in the list
            for movie in movies:
                #Add the movie id

                if movie['id'] in movies_id:
                    continue

                movies_id.append(movie['id'])

                poster_path = movie['poster_path']
                # The images are available at image.tmdb.org, at several different sizes. Here we're using the "original" size.
                image_url = f"https://image.tmdb.org/t/p/original{poster_path}"

                os.makedirs('genres',exist_ok=True)
                # Define the path to save the image
                path = os.path.join("genres", f"genre-{genre['id']}.jpg")
                # Download the image
                download_image(image_url, path)
                break


if __name__=="__main__":
    if args.type == 'person':
        start_persons_scrapping()
    elif args.type == 'movie':
        start_movies_scrapping()
    elif args.type == 'download-genre':
        download_genre()
