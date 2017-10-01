from flask import Flask, jsonify
from flask import render_template
import json, requests

app = Flask(__name__)


@app.route('/')
def hello():
    return render_template('index.html')

@app.route('/temperatures_proxy')
def temperatures_proxy():
    resp = requests.get('http://cosculluela.es:28017/100ideas/data/?limit=-50000').json()
    return jsonify(resp)

if __name__ == '__main__':
    app.run(debug=True, use_reloader=True)
