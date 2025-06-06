from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime

app = Flask(__name__)
CORS(app)

client = MongoClient("mongodb+srv://root:1234@connection.am6ddsu.mongodb.net/")
db = client["webhook_db"]
collection = db["events"]

@app.route('/webhook', methods=['POST'])
def webhook():
    data = request.json
    action_type = data.get("action")
    author = data.get("sender", {}).get("login", "Unknown")
    timestamp = datetime.utcnow().isoformat()

    from_branch = data.get("pull_request", {}).get("head", {}).get("ref", "")
    to_branch = data.get("pull_request", {}).get("base", {}).get("ref", "")

    event = {
        "action": action_type,
        "author": author,
        "from_branch": from_branch,
        "to_branch": to_branch,
        "timestamp": timestamp
    }

    collection.insert_one(event)
    return '', 204

@app.route('/events', methods=['GET'])
def events():
    data = list(collection.find({}, {'_id': 0}).sort("timestamp", -1).limit(10))
    return jsonify(data)

@app.route('/')
def index():
    return render_template("index.html")

if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 5000))  # Render will inject PORT env var
    app.run(host='0.0.0.0', port=port)

