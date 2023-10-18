from datetime import datetime
from extensions import db

class Watched(db.Model):
    __tablename__ = 'watched'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    movie_id = db.Column(db.Integer, db.ForeignKey('movies.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='user_watched_movies', overlaps="watched_movies,user_watched_movies")
    movie = db.relationship('Movie', backref='watched_movie_by', overlaps="watched_by,movie_watched_by")
