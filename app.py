from flask import Flask, render_template, request
import os

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/offers')
def offers():
    return render_template('offers.html')


@app.route('/upload', methods=['POST'])
def upload_file():

    file = request.files.get('file')

    if file and file.filename != '':
        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)

        return "File uploaded successfully!"

    return "No file selected!"


if __name__ == '__main__':
    app.run(debug=True, port=5001)