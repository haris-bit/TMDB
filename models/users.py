from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from extensions import db


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    watched_movies = db.relationship('Watched', backref='watcher', lazy=True, overlaps="watched_movies,user_watched_movies")
    ratings = db.relationship('Rating', backref='rater', lazy=True, overlaps="ratings,user_ratings")

    recommendations = db.relationship('Recommendation', backref='recommends', lazy=True)


    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)
