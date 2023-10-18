from extensions import db
from datetime import datetime

class Recommendation(db.Model):
    __tablename__ = 'recommendations'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    movie_id = db.Column(db.Integer, db.ForeignKey('movies.id'), nullable=False)
    rating = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='recommendations_u')
    #movie = db.relationship('Movie', backref='recommendations_m')

    def __repr__(self):
        return f"<Recommendation {self.id}>"
