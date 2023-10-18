from db.db import IMDBdb


# create the db from datasets
if __name__=="__main__":
    db = IMDBdb()
    db.create_db()
    # Rename the table column of the Titles table
    db.rename_column('Titles','.tconst','tconst')
