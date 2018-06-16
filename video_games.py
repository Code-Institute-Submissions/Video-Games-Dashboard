from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json
import os

app = Flask(__name__)

# connection settings
MONGO_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
DBS_NAME = os.getenv('MONGO_DB_NAME', 'videoGames')
COLLECTION_NAME = 'projects'

# connection settings
#MONGODB_HOST = 'localhost'
#MONGODB_PORT = 27017
#DBS_NAME = 'videoGames'
#COLLECTION_NAME = 'projects'

# Route to display charts
@app.route("/")
def index():
    return render_template("main.html")


@app.route("/about")
def about():
    return render_template("about.html")


# routing to the database
@app.route("/videoGames/projects")
def games_projects():
    """
    A Flask view to serve the project data from
    MongoDB in JSON format.
    """

    # A constant that defines the record fields that we wish to retrieve.
    FIELDS = {'_id': False,
              'name': True,
              'platform': True,
              'year': True,
              'genre': True,
              'publisher': True,
              'NA_sales': True,
              'EU_sales': True,
              'JP_sales': True,
              'other_sales': True,
              'global_sales': True,
              'critic_score': True,
              'critic_count': True,
              'user_score': True,
              'user_count': True,
              'developer': True,
              'rating': True}

    # Open a connection to MongoDB using a with statement such that the
    # connection will be closed as soon as we exit the with statement
    # The MONGO_URI connection is required when hosted using a remote mongo db
    with MongoClient(MONGO_URI) as connection:
        collection = connection[DBS_NAME][COLLECTION_NAME]
        projects = collection.find(projection=FIELDS, limit=20000)
        return json.dumps(list(projects))


if __name__ == "__main__":
    app.run(debug=True)
