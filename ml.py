import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Load the datasets
# Load the names with column unique identifer and name
names = pd.read_csv('datasets/name.basics.tsv', sep='\t', usecols=['nconst', 'primaryName'])

# Load the principals with column: category (actor/actress/director), movie title identifier and name unique identifier
principals = pd.read_csv('datasets/title.principals.tsv', sep='\t', usecols=['tconst', 'nconst', 'category'])

# Load the title with column title identifier, movie title, genres and title type (short,video,movie)
movies = pd.read_csv('datasets/title.basics.tsv', sep='\t', usecols=['tconst', 'primaryTitle', 'genres','titleType'])

# Filter movies to include title type movie
movies = movies[movies['titleType']=='movie']

# delete the title type movie
del movies['titleType']

# Merge the dataframes
merged_df = pd.merge(pd.merge(names, principals), movies)

# Group the merged dataframe by movie and aggregate the attributes
aggregated_df = merged_df.groupby('tconst').agg({
    'primaryTitle': 'first',
    'genres': lambda x: ', '.join(x.dropna()) if x.notna().any() else 'Unknown',
    'nconst': lambda x: ', '.join(x),
    'category': lambda x: ', '.join(x),
     'primaryName': lambda x: ', '.join(x)
}).reset_index()

# Combine the features into a single feature vector
aggregated_df['features'] = aggregated_df['primaryTitle'] + ' ' + \
                             aggregated_df['genres'] + ' ' + \
                             aggregated_df['nconst'] + ' ' + \
                            aggregated_df['category'] + ' ' + \
                             aggregated_df['primaryName']


# Create a vectorizer to convert the feature text into a matrix
vectorizer = CountVectorizer()
feature_matrix = vectorizer.fit_transform(aggregated_df['features'].astype(str))

# Calculate the cosine similarity between movies based on the feature matrix
similarity_matrix = cosine_similarity(feature_matrix)


# Recommendation function
def recommend_movies(movie_title, top_n=5):
    movie_indices = aggregated_df.index
    movie_index = aggregated_df[aggregated_df['primaryTitle'] == movie_title].index[0]
    similar_movies = similarity_matrix[movie_index, movie_indices].argsort()[::-1][1:top_n+1]
    recommended_movies = aggregated_df.iloc[similar_movies]['primaryTitle'].tolist()
    return recommended_movies



# Example usage
target_movie = 'Inception'
recommendations = recommend_movies(target_movie)
print(f"Recommended movies for '{target_movie}':")
for movie in recommendations:
    print(movie)
