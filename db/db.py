import pandas as pd
import sqlite3
import os


class IMDBdb:

    #create a db for the imbdb:

    def __init__(self) -> None:
        # Connect to the SQLite database
        app_directory = os.path.dirname(os.path.abspath(__file__))
        print(app_directory)

        self.db_name = os.path.join(app_directory, 'imdb.db')

        # path of the tsv file
        self.tsvpath = 'datasets'

        # List of TSV files and corresponding table names
        self.files_and_tables = {
            'title.basics.tsv': 'Titles',
            'title.ratings.tsv': 'Ratings',
            'title.principals.tsv': 'Principals',
            'name.basics.tsv': 'Names'
        }


    # create the db
    def create_db(self):
        conn = sqlite3.connect(self.db_name)
        # Loop through the files and tables
        for file_name, table_name in self.files_and_tables.items():
            # Read the TSV file into a DataFrame
            df = pd.read_csv(os.path.join(self.tsvpath,file_name), sep='\t')

            # Handle '\N' values (you may want to handle these differently depending on the field)
            df.replace('\\N', None, inplace=True)

            # Write the DataFrame to a table in the SQLite database
            df.to_sql(table_name, conn, if_exists='replace', index=False)

        # Don't forget to close the connection when you're done
        conn.close()


    def print_column_names(self,table_name):
        # Connect to the SQLite database
        conn = sqlite3.connect(self.db_name)

        # Create a cursor object
        cursor = conn.cursor()

        # Execute a SQL query to retrieve the column names
        cursor.execute(f"PRAGMA table_info({table_name});")

        # Fetch all the rows from the query
        rows = cursor.fetchall()

        # Close the connection
        conn.close()

        # Print the column names
        for row in rows:
            print(row[1])  # the second item in each row is the column name

    def rename_column(self,table_name,original_name,modified_name):
        # Connect to the SQLite database
        conn = sqlite3.connect(self.db_name)

        # Create a cursor object
        cursor = conn.cursor()

        # Execute a SQL query to rename the column
        cursor.execute(f"""
        ALTER TABLE {table_name}
        RENAME COLUMN "{original_name}" TO "{modified_name}"
        """)

        # Commit the changes
        conn.commit()

        # Close the connection
        conn.close()



    def get_genres(self):
        conn = sqlite3.connect(self.db_name)
        # Create a cursor object
        cursor = conn.cursor()

        # Execute a SQL query to retrieve genres
        cursor.execute("SELECT genres FROM Titles")

        # Fetch all the rows from the query
        rows = cursor.fetchall()

        # Close the connection
        conn.close()


        # Prepare a set to store distinct genres
        distinct_genres = set()


        # Iterate over rows and split genres, add to the set
        for row in rows:
            genres = row[0]
            if genres is not None:  # Check if genres is not None
                genres = genres.split(',')
                distinct_genres.update(genres)


        return list(distinct_genres)



    def get_movies(self,page, movies_per_page):
        # Connect to the SQLite database
        conn = sqlite3.connect(self.db_name)

        # Create a cursor object
        cursor = conn.cursor()

        # Calculate the starting limit for the SQL query
        start = (page - 1) * movies_per_page

        # Execute a SQL query to retrieve movies, sorted by rating
        # The SQL query also includes LIMIT and OFFSET for pagination
        # Also include only titleType movie
        cursor.execute(f"""
        SELECT Titles.*
        FROM Titles
        INNER JOIN Ratings ON Titles.tconst = Ratings.tconst
        WHERE Titles.titleType = 'movie'
        ORDER BY Ratings.averageRating DESC
        LIMIT {start}, {movies_per_page}
        """)

        # Fetch all the rows from the query
        rows = cursor.fetchall()

        # Close the connection
        conn.close()

        # Return the rows
        return rows


    def get_actors(self,page, actors_per_page):
        # Connect to the SQLite database
        conn = sqlite3.connect(self.db_name)

        # Create a cursor object
        cursor = conn.cursor()

        # Calculate the starting limit for the SQL query
        start = (page - 1) * actors_per_page

        # Execute a SQL query to retrieve actors
        # The SQL query also includes LIMIT and OFFSET for pagination
        cursor.execute(f"""
        SELECT DISTINCT Names.primaryName
        FROM Principals
        JOIN Names ON Principals.nconst = Names.nconst
        WHERE category IN ('actor', 'actress')
        LIMIT {start}, {actors_per_page}
        """)

        # Fetch all the rows from the query
        rows = cursor.fetchall()

        # Close the connection
        conn.close()

        # Return the rows
        return rows

    def get_directors(self,page, directors_per_page):
        # Connect to the SQLite database
        conn = sqlite3.connect(self.db_name)

        # Create a cursor object
        cursor = conn.cursor()

        # Calculate the starting limit for the SQL query
        start = (page - 1) * directors_per_page

        # Execute a SQL query to retrieve directors
        # The SQL query also includes LIMIT and OFFSET for pagination
        cursor.execute(f"""
        SELECT DISTINCT Names.primaryName
        FROM Principals
        JOIN Names ON Principals.nconst = Names.nconst
        WHERE category = 'director'
        LIMIT {start}, {directors_per_page}
        """)

        # Fetch all the rows from the query
        rows = cursor.fetchall()

        # Close the connection
        conn.close()

        # Return the rows
        return rows




if __name__=="__main__":
    imdb = IMDBdb()
    genres = imdb.get_genres()
    print(genres)
