from flask import Flask, request, jsonify
import json
import requests
from flask.ext.pymongo import PyMongo
from pymongo import MongoClient
from geojson import Feature, Point
import numpy

app = Flask(__name__)


app.config['SERVER_NAME'] = 'cosculluela.es:5000'
app.debug = False

#mongo = PyMongo(app)
client = MongoClient('mongodb://cosculluela.es:27017/')
db = client["100ideas"]


@app.route('/hello', methods=['POST'])
def hello():
   #return jsonify(request.json)
   json_dict = request.get_json()
   return json.dumps(request.json)

@app.route('/mobile', methods=['POST'])
def mobile():
   #return jsonify(request.json)
   #json_dict = request.get_json()
   data = request.get_data()
   parsed = data.split("&")
   print parsed
   filename = './stream/' + 'datos' + '.json'
   with open(filename, 'w') as stream:
        json.dump(Feature(geometry=Point((float(parsed[2].split("=")[1]), float(parsed[3].split("=")[1]))),
                                                    properties={"temperature": float(parsed[4].split("=")[1]),
                                                                "co2" : float(parsed[7].split("=")[1]),
                                                                "noise": float(parsed[6].split("=")[1]),
                                                                "wet" : float(parsed[5].split("=")[1]),
                                                                "co" : float(parsed[8].split("=")[1]),
                                                                "time" : parsed[1].split("=")[1],
                                                                "date" : parsed[0].split("=")[1],
                                                                "lpg" : float(parsed[9].split("=")[1]),
                                                                "calidad" : float(parsed[10].split("=")[1])
                                                                }), stream, indent=2)
   with open(filename) as json_data:
       d = json.load(json_data)
       result = db.realData.insert_one(d)
   #file = open(filename, 'r')
   #readed = file.read()
   #print readed
   #result = db.data.insert_one(readed)
   #print result
   return data


if __name__ == "__main__":
    app.run(host='0.0.0.0')
