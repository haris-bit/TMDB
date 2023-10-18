from extensions import db

class Director(db.Model):
    __bind_key__ = 'movie-night'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    gender = db.Column(db.Integer)
    popularity = db.Column(db.Float)
    profile_path = db.Column(db.String(255))


    @property
    def serialize(self):
        """Return object data in easily serializable format"""
        return {
            'id' : self.id,
            'name': self.name,
            'gender':self.gender,
            'popularity': self.popularity,
                 'profile_path':self.profile_path
            # Add other fields that you want to include
        }
