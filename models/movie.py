from extensions import db


class Movie(db.Model):
    __tablename__ = 'movies'

    id = db.Column(db.Integer, primary_key=True)
    watched_by = db.relationship('Watched', backref='watched_movie', lazy=True, overlaps="watched_by,movie_watched_by")
    name = db.Column(db.String(256), nullable=False)
    ratings = db.relationship('Rating', backref='rated_movie', lazy=True, overlaps="rated_movie,movie_ratings")

