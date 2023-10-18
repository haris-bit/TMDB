from flask import Flask,render_template,session,request,flash,redirect,url_for,jsonify
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from models.users import User
from models.movie import Movie
from models.watched import Watched
from models.rating import Rating
from models.actors import Actor
from models.directors import Director
from models.recommendation import Recommendation
from flask_sqlalchemy import SQLAlchemy
from extensions import db,login_manager
import random
import os
import json
import requests
from sqlalchemy import desc
from oauthlib.oauth2 import WebApplicationClient
from requests_oauthlib import OAuth2Session
from requests.exceptions import HTTPError
import requests_oauthlib
import flask
app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY") or os.urandom(24)

#Load the google client library
google_client:dict = json.load(open('mac_google.json',mode='r'))["web"]

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///movies.db'  # Change this line to your database path

app.config['SQLALCHEMY_BINDS'] = {
    'movie-night': 'sqlite:///movie-night.db',
}

#Remove in production
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

# Configuration
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", google_client.get("client_id"))
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", google_client.get("client_secret"))


# Domain name for the application
URL = 'https://12fa-59-97-43-192.ngrok-free.app'
APP_ID="999780847730978"
APP_SECRET_KEY="18c9038548953107dec1502f764739cf"

#Add this in the redirect URL in the facebook account
# {URL}/login/facebooklogin/callback


# Configuration
FACEBOOK_CLIENT_ID = os.environ.get("FACEBOOK_CLIENT_ID", APP_ID)
FACEBOOK_CLIENT_SECRET = os.environ.get("FACEBOOK_CLIENT_SECRET", APP_SECRET_KEY)
FACEBOOK_DISCOVERY_URL = "https://graph.facebook.com/v11.0/.well-known/openid-configuration"
FACEBOOK_AUTHORIZATION_BASE_URL = 'https://www.facebook.com/dialog/oauth'
FACEBOOK_TOKEN_URL = 'https://graph.facebook.com/oauth/access_token'
FB_SCOPE = ["email"]

GOOGLE_DISCOVERY_URL = (
    "https://accounts.google.com/.well-known/openid-configuration"
)

db.init_app(app)
login_manager.init_app(app)

client = WebApplicationClient(GOOGLE_CLIENT_ID)



@app.route("/login/facebooklogin")
def facebooklogin():
    facebook = OAuth2Session(FACEBOOK_CLIENT_ID, redirect_uri=URL + "/login/facebooklogin/callback",
                             scope=["public_profile", "email"])
    authorization_url, state = facebook.authorization_url(FACEBOOK_AUTHORIZATION_BASE_URL)

    # State is used to prevent CSRF, keep this for later.
    session['oauth_state'] = state
    return redirect(authorization_url)

#https://12fa-59-97-43-192.ngrok-free.app/l/login/facebooklogin/callback
@app.route("/login/facebooklogin/callback")
def facebook_callback():
    facebook = requests_oauthlib.OAuth2Session(
        FACEBOOK_CLIENT_ID, scope=FB_SCOPE, redirect_uri=URL + "/login/facebooklogin/callback"
    )

    # we need to apply a fix for Facebook here
    facebook = facebook_compliance_fix(facebook)

    facebook.fetch_token(
        FACEBOOK_TOKEN_URL,
        client_secret=FACEBOOK_CLIENT_SECRET,
        authorization_response=flask.request.url,
    )

    # Fetch a protected resource, i.e. user profile, via Graph API

    facebook_user_data = facebook.get(
        "https://graph.facebook.com/me?fields=id,name,email,picture{url}"
    ).json()

    email = facebook_user_data["email"]
    name = facebook_user_data["name"]
    picture_url = facebook_user_data.get("picture", {}).get("data", {}).get("url")

    if facebook_user_data.get("email"):
        unique_id = facebook_user_data["id"]
        users_email = facebook_user_data["email"]
        users_name = facebook_user_data["name"]
        user = User.query.filter_by(email=users_email).first()

        # User Already registered
        if user:
            login_user(user)
        else:
            new_user = User(email=users_email)
            new_user.set_password(unique_id)
            db.session.add(new_user)
            db.session.commit()
            user = new_user

        login_user(user)
        return redirect(url_for('movie_list'))

    else:
        return "User email not available or not verified by Facebook.", 400

def get_google_provider_cfg():
    return requests.get(GOOGLE_DISCOVERY_URL).json()


@app.route('/get-watch-providers')
def get_watch_providers():
    providers = json.load(fp=open('static/json/usa_watch_provider.json'))
    return jsonify({"results":providers})


@app.route('/success-facebook')
def success_facebook():
    return jsonify({"success":True})

@app.route("/login/googlelogin")
def googlelogin():
    print(request.base_url)
    # Find out what URL to hit for Google login
    google_provider_cfg = get_google_provider_cfg()
    authorization_endpoint = google_provider_cfg["authorization_endpoint"]

    # Use library to construct the request for Google login and provide
    # scopes that let you retrieve user's profile from Google
    request_uri = client.prepare_request_uri(
        authorization_endpoint,
        redirect_uri=request.base_url + "/callback",
        scope=["openid", "email", "profile"],
    )
    return redirect(request_uri)

@app.route("/login/googlelogin/callback")
def callback():
    # Get authorization code Google sent back to you
    code = request.args.get("code")

    google_provider_cfg = get_google_provider_cfg()
    token_endpoint = google_provider_cfg["token_endpoint"]

    token_url, headers, body = client.prepare_token_request(
        token_endpoint,
        authorization_response=request.url,
        redirect_url=request.base_url,
        code=code
    )
    token_response = requests.post(
        token_url,
        headers=headers,
        data=body,
        auth=(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET),
    )

    client.parse_request_body_response(json.dumps(token_response.json()))

    userinfo_endpoint = google_provider_cfg["userinfo_endpoint"]
    uri, headers, body = client.add_token(userinfo_endpoint)
    userinfo_response = requests.get(uri, headers=headers, data=body)

    if userinfo_response.json().get("email_verified"):
        unique_id = userinfo_response.json()["sub"]
        users_email = userinfo_response.json()["email"]
        picture = userinfo_response.json()["picture"]
        users_name = userinfo_response.json()["given_name"]
        print(userinfo_response.json())
        user = User.query.filter_by(email=users_email).first()

        # User Already registered
        if user:
            login_user(user)
        else:
            new_user = User(email=users_email)
            #add_recommendation(movie_ids=movie_ids,user=new_user)
            new_user.set_password(unique_id)
            db.session.add(new_user)
            db.session.commit()
            user = new_user

        login_user(user)
        return redirect(url_for('movie_list'))

    else:
        return "User email not available or not verified by Google.", 400


@login_manager.user_loader
def load_user(user_id):
    if user_id is not None:
        return User.query.get(int(user_id))
    else:
        return None

@app.route('/select-actor')
def select_actor():
    return render_template('select-actor.html')

@app.route('/select-movie')
def select_movie():
    return render_template('select-movie.html')

@app.route('/select-director')
def select_director():
    return render_template('select-director.html')


@app.route('/select-length')
def select_length():
    return render_template('select-length.html')

@app.route('/select-recentness')
def select_recent():
    return render_template('select-recent.html')

@app.route('/select-characteristics')
def select_characteristics():
    return render_template('select-characteristics.html')


# API endpoint to fetch and search actor data
@app.route('/actor')
def get_actors():
    print("GETTING ACTOR")
    #query = db.session.query(Actor)
    #actors = query.all()
    #print(actors)
    page = request.args.get('page', 1, type=int)
    name = request.args.get('name', default=None, type=str)
    sortby = request.args.get('sortby','alpha')

    print(page)
    print(name)



    #query = db.session.query(Actor).filter(Actor.popularity >= 1).order_by(Actor.name)
    query = db.session.query(Actor).filter(Actor.popularity > 42).filter(Actor.profile_path != "").filter(Actor.profile_path.isnot(None)).order_by(Actor.name,Actor.popularity.desc())
    #if sortby=='alpha':
    #    query = db.session.query(Actor).filter(Actor.profile_path != "").filter(Actor.profile_path.isnot(None)).order_by(Actor.name)
    #else:
    #    query = db.session.query(Actor).filter(Actor.profile_path != "").filter(Actor.profile_path.isnot(None)).order_by(desc(Actor.popularity))


    #filter(Actor.popularity >= 1)

    if name:
        query = db.session.query(Actor).filter(Actor.name.like(f"%{name}%")).filter(Actor.profile_path != "").filter(Actor.profile_path.isnot(None))

    pagination = query.paginate(page=page, per_page=20)
    actors = pagination.items

    print(actors)

    if not actors:
        return jsonify({"results": [], "total_pages": pagination.pages})


    return jsonify({"results": [a.serialize for a in actors], "total_pages": pagination.pages})



# API endpoint to fetch and search director data
@app.route('/director', methods=['GET'])
def get_directors():
    __bind_key__ = 'movie-night'
    page = request.args.get('page', 1, type=int)
    name = request.args.get('name', default=None, type=str)
    sortby = request.args.get('sortby','alpha')

    query = db.session.query(Director).filter(Director.popularity >=8.5).filter(Director.profile_path != "").filter(Director.profile_path.isnot(None)).order_by(Director.name,Director.popularity.desc())

    #if sortby=='alpha':
    #    query = db.session.query(Director).filter(Director.profile_path != "").filter(Director.profile_path.isnot(None)).order_by(Director.name)
    #else:
    #    query = db.session.query(Director).filter(Director.profile_path != "").filter(Director.profile_path.isnot(None)).order_by(desc(Director.popularity))

    if name:
        query = db.session.query(Director).filter(Director.name.like(f"%{name}%")).filter(Director.profile_path != "").filter(Director.profile_path.isnot(None))

    pagination = query.paginate(page=page, per_page=10)
    directors = pagination.items

    return {"results": [d.serialize for d in directors], "total_pages": pagination.pages}


@app.route('/movie-description/<movie_id>')
def movie_description(movie_id):
    movie_is_watched = False
    if current_user.is_authenticated:
        movie_is_watched = Watched.query.filter_by(user_id=current_user.id, movie_id=movie_id).first() is not None
    return render_template('movie-description.html', movie_is_watched=movie_is_watched)



@app.route('/get-movie-rating/<int:movie_id>')
@login_required
def get_movie_rating(movie_id):
    ratings = Rating.query.filter_by(movie_id=movie_id).all()
    user_rating = Rating.query.filter_by(movie_id=movie_id, user_id=current_user.id).first()
    if ratings:
        average_rating = sum([rating.rating for rating in ratings]) / len(ratings)
        return jsonify({'average_rating': average_rating, 'votes': len(ratings), 'user_rating': user_rating.rating if user_rating else None})
    else:
        return jsonify({'average_rating': None, 'votes': 0, 'user_rating': user_rating.rating if user_rating else None})


@app.route('/watch-list')
@login_required
def watch_list():
    user = User.query.get(current_user.id)
    watched_movies = user.watched_movies
    watched_movie_ids = [watched.movie_id for watched in watched_movies]
    return render_template('watch-list.html', movie_ids=watched_movie_ids)


@app.route('/mark-as-watched', methods=['POST'])
@login_required
def mark_movie_as_watched():
    movie_id = request.json.get('movieId')
    movie_name = request.json.get('movieName') # assume you send the movie name as well
    movie = Movie.query.get(movie_id)

    if not movie:
        movie = Movie(id=movie_id, name=movie_name)
        db.session.add(movie)

    watched = Watched(user=current_user, movie=movie)
    db.session.add(watched)
    db.session.commit()

    return jsonify({"message": "Movie marked as watched"}), 200


# Submit the user rating
@app.route('/submit-rating', methods=['POST'])
@login_required
def submit_rating():
    data = request.json
    movie_id = data.get('movieId')
    rating = data.get('rating')

    # Perform validation, authorization, and any additional checks as needed

    # Create a new Rating object and save it to the database
    new_rating = Rating(user_id=current_user.id, movie_id=movie_id, rating=rating)
    db.session.add(new_rating)
    db.session.commit()

    return jsonify({'message': 'Rating submitted successfully'})


@app.route('/post-recommendations', methods=['POST'])
@login_required
def post_recommendations():
    user = User.query.get(current_user.id)
    if user:
        movie_ids = request.form.get('movie_ids')  # Assuming the movie IDs are sent as an array in the 'movie_ids' field

        recommendations_added = 0  # Counter for tracking the number of recommendations added

        for movie_id in movie_ids:
            existing_recommendation = Recommendation.query.filter_by(user=user, movie_id=movie_id).first()
            if existing_recommendation:
                continue  # Skip adding the recommendation if it already exists for the user

            recommendation = Recommendation(user=user, movie_id=movie_id)
            db.session.add(recommendation)
            recommendations_added += 1

        if recommendations_added > 0:
            db.session.commit()
            return jsonify({'message': f'{recommendations_added} recommendations added successfully'})
        else:
            return jsonify({'message': 'No new recommendations added'})

    return jsonify({'message': 'User not found'})



def add_recommendation(user,movie_ids):
    recommendations_added = 0  # Counter for tracking the number of recommendations added

    for movie_id in movie_ids:
        existing_recommendation = Recommendation.query.filter_by(user=user, movie_id=movie_id).first()
        if existing_recommendation:
            continue  # Skip adding the recommendation if it already exists for the user

        recommendation = Recommendation(user=user, movie_id=movie_id)
        db.session.add(recommendation)
        recommendations_added += 1

    if recommendations_added > 0:
        db.session.commit()
        return jsonify({'message': f'{recommendations_added} recommendations added successfully'})
    else:
        return jsonify({'message': 'No new recommendations added'})


@app.route('/get-recommended-movie', methods=['GET'])
@login_required
def get_recommended_movie():
    user = User.query.get(current_user.id)
    if user:
        recommendation_ids = [recommendation.movie_id for recommendation in user.recommendations]
        if recommendation_ids:
            random_movie_id = random.choice(recommendation_ids)
            return jsonify({'random_movie_id': random_movie_id})

    return jsonify({'message': 'No recommendations found for the user'})



@app.route('/unmark-as-watched', methods=['POST'])
@login_required
def unmark_movie_as_watched():
    movie_id = request.json.get('movieId')
    movie = Movie.query.get(movie_id)

    # Find the `Watched` record for this user and movie
    watched = Watched.query.filter_by(user_id=current_user.id, movie_id=movie.id).first()

    if watched:
        # If a record exists, delete it
        db.session.delete(watched)
        db.session.commit()
        return jsonify(success=True)
    else:
        # If no record exists, return an error
        return jsonify(error="Movie not found in user's watched list"), 404


@app.route('/signup', methods=['GET','POST'])
def signup():
    if current_user.is_authenticated:
        return redirect(url_for('movie_list'))

    if request.method == 'POST':
        email = request.json.get('email')

        password = request.json.get('password')

        movie_ids = request.json.get('movies')

        user = User.query.filter_by(email=email).first()


        print(movie_ids)

        print(email)

        print(password)

        if user:  # if a user is found, we want to redirect back to signup page so user can try again
            flash('Email address already exists')
            return jsonify({"success":False,"error":"Email Already exists"})

        new_user = User(email=email)
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        #Add recommendation for the movies
        add_recommendation(movie_ids=movie_ids,user=new_user)

        login_user(new_user)
        return jsonify({"success":True})

    return render_template('sign-up.html')


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    print(data)

    movie_ids = data.get('movies')

    if not data:
        return jsonify({'success': False, 'error': 'No data received'})

    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()



    if user and user.check_password(password):
        #Add recommendation for the movies
        add_recommendation(movie_ids=movie_ids,user=user)
        login_user(user)
        return jsonify({'success': True})

    return jsonify({'success': False, 'error': 'Invalid username or password'})

@app.route('/loading')
def loading_reccommendation():
    return render_template('loading_recommendation.html')

@app.route('/')
def index():
    #if current_user.is_authenticated:
    #    return redirect(url_for('movie_list'))
    return render_template('index.html')



@app.route('/movie-list')
def movie_list():
    watched_movie_ids=[]
    recommendation_ids= []
    if current_user.is_authenticated:
        user = User.query.get(current_user.id)
        watched_movies = user.watched_movies
        watched_movie_ids = [watched.movie_id for watched in watched_movies]
        recommendation_ids = [recommendation.movie_id for recommendation in user.recommendations]
        print("AUTHENTICATED USER")
        print(recommendation_ids)
        pass
    return render_template('movie-list.html',movie_ids=watched_movie_ids,movie_rids=recommendation_ids)


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))



if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True,host='0.0.0.0',port=8080)
