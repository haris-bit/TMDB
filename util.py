import sqlite3
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

def get_latent_dataframe():
    conn = sqlite3.connect('db/latent_features.db')
    # Load the DataFrame from the database
    latent_df = pd.read_sql_query('SELECT * FROM latent_features', conn,index_col='index')
    conn.close()
    return latent_df


def get_similar_movies(movie_name,N=12):
    latent_df = get_latent_dataframe()
    movie_latent = None
    if movie_name in latent_df.index:
        movie_latent = latent_df.loc[movie_name].values.reshape(1, -1)
        similarity_scores = cosine_similarity(movie_latent, latent_df.values)
        # Get the top-N similar movies
        similar_movies_indices = similarity_scores.argsort()[0][-N-1:-1][::-1]  # Exclude the movie itself
        recommended_movies = latent_df.iloc[similar_movies_indices].index.tolist()
        return recommended_movies
    return []



def combine_data():
    import os
    import json
    import pandas as pd
    import sqlite3

    # Establishing SQLite connection
    conn = sqlite3.connect('movie-night.db')

    # Loop over all json files in the directory
    for filename in os.listdir('people_datasets'):# Replace with your directory path
        print(filename)
        if filename.endswith('.json'):
            with open(os.path.join('people_datasets', filename)) as file:  # Replace with your directory path
                data = json.load(file)

            # Convert json data to pandas DataFrame
            df = pd.json_normalize(data)

            # Filtering the data by known_for_department
            actors = df[df['known_for_department'] == 'Acting']
            directors = df[df['known_for_department'] == 'Directing']

            # Selecting necessary columns
            actors = actors[['id', 'name', 'gender', 'popularity', 'profile_path']]
            directors = directors[['id', 'name', 'gender', 'popularity', 'profile_path']]

            # Saving the data into SQLite DB
            actors.to_sql('actor', conn, if_exists='append', index=False)
            conn.commit()
            directors.to_sql('director', conn, if_exists='append', index=False)
            conn.commit()



    # Closing the SQLite connection
    conn.close()


def query_data():
    import sqlite3
    import pandas as pd

    # Establishing SQLite connection
    conn = sqlite3.connect('instance/movie-night.db')

    # Creating a cursor
    cur = conn.cursor()

    # Executing a SQL query to get the first 10 rows from 'actor' and 'director' tables
    cur.execute("SELECT * FROM actor LIMIT 10")
    actors = cur.fetchall()

    cur.execute("SELECT * FROM director LIMIT 10")
    directors = cur.fetchall()

    # Closing the cursor and the connection
    cur.close()
    conn.close()

    # Converting the data to pandas DataFrame and printing
    actors_df = pd.DataFrame(actors, columns=['id', 'name', 'gender', 'popularity', 'profile_path'])
    print("Actors:\n", actors_df)

    directors_df = pd.DataFrame(directors, columns=['id', 'name', 'gender', 'popularity', 'profile_path'])
    print("\nDirectors:\n", directors_df)



#query_data()
combine_data()
