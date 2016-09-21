# encoding: utf-8

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from flask_security import Security
from flask_bootstrap import Bootstrap
from flask_basicauth import BasicAuth
from werkzeug.contrib.cache import MemcachedCache


app = Flask(__name__)
app.config.from_pyfile('../config.py')

# Bootstrap
bootstrap = Bootstrap(app)

# Cache
cache = MemcachedCache(['127.0.0.1:11211'])

# SimpleAuth
basic_auth = BasicAuth(app)

#Mail
mail = Mail(app)

db = SQLAlchemy(app)
from models import *
from forms import *

import sources
app.config['REGION_DATA'] = {}
for region_id, region_data in app.config['REGIONS'].iteritems():
  if 'parent' in region_data:
    app.config['REGION_DATA'][region_data['parent']]['children'][region_id] = region_data
  else:
    app.config['REGION_DATA'][region_id] = region_data
    app.config['REGION_DATA'][region_id]['children'] = {}
import webapp.views