from flask import Flask, jsonify
from flask import render_template
import json, requests

app = Flask(__name__)


@app.route('/')
def hello():
    return render_template('index.html')

@app.route('/temperatures_proxy/<int:limit>')
def temperatures_proxy(limit):
    resp = requests.get('http://cosculluela.es:28017/100ideas/trayectoryData/?limit=-' + str(limit)).json()
    return jsonify(resp)

if __name__ == '__main__':
    app.run(debug=True, use_reloader=True)
