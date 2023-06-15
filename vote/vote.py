import mysql.connector
from flask import Flask, request, jsonify, render_template

import sys
import traceback
import requests

app = Flask(__name__)

# Create a connection to MariaDB
db = mysql.connector.connect(
    host="localhost",
    user="admin",
    password="admin",
    database="votingapp"
)

# Create a cursor object to interact with the database
cursor = db.cursor()

# Add a route to render the index.html file
@app.route('/')
def index():
    return render_template('index.html')

# Modify the register and vote routes to store votes in the database

@app.route('/register', methods=['POST'])
def register():
    registration_data = request.json

    name = registration_data.get('name')
    phone_number = registration_data.get('phoneNumber')
    email = registration_data.get('email')

    # Check if user is already registered
    cursor.execute("SELECT * FROM users WHERE phone_number = %s", (phone_number,))
    if cursor.fetchone():
        return jsonify({'message': 'User with the same phone number has already registered.'}), 400

    # Register the user in the database
    cursor.execute("INSERT INTO users (name, phone_number, email) VALUES (%s, %s, %s)",
                   (name, phone_number, email))
    db.commit()

    return jsonify({'message': 'Registration successful!'})

@app.route('/vote', methods=['POST'])
def vote():
    vote_data = request.json
    print('Received vote_data:', vote_data)

    # Check if the required fields are present in the request data
    if 'candidate' not in vote_data:
        return jsonify({'message': 'Invalid request data. Missing required fields.'}), 400

    candidate = vote_data.get('candidate')

    # Check if user is registered and has not voted
    cursor.execute("SELECT * FROM users WHERE voted = 0 LIMIT 1")
    user = cursor.fetchone()
    if not user:
        return jsonify({'message': 'No eligible users found or all users have already voted.'}), 400

    try:
        # Update vote count for the candidate in the database
        cursor.execute("UPDATE candidates SET vote_count = vote_count + 1 WHERE name = %s", (candidate,))
        db.commit()

        # Mark the user as voted in the database
        cursor.execute("UPDATE users SET voted = 1 WHERE id = %s", (user[0],))
        db.commit()

        # Fetch the updated vote counts from the database
        cursor.execute("SELECT name, vote_count FROM candidates")
        results = cursor.fetchall()
        result_data = {name: vote_count for name, vote_count in results}

        return jsonify({'message': 'Vote recorded successfully!', 'vote_counts': result_data})


    except Exception as e:
        db.rollback()
        print('Error occurred:', str(e))
        return jsonify({'message': 'Error occurred while recording the vote.'}), 500

@app.errorhandler(Exception)
def handle_exception(exc):
    print("Error occurred:")
    print("".join(traceback.format_exception(*sys.exc_info())))
    return "An error occurred", 500

# Add this line to suppress the `/favicon.ico` request
app.config['SUPPRESS_SEND_FILE'] = True

if __name__ == '__main__':
    app.config['DEBUG'] = True
    app.run(port=5000)
