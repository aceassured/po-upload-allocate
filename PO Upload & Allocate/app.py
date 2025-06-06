from flask import Flask, render_template, request, jsonify, send_file, url_for, send_from_directory
import os, io
import pdfplumber, qrcode
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def upload_and_allocate():
    return render_template('upload_allocate.html')

@app.route('/distribute')
def distribute_page():
    return render_template('distribution.html')

@app.route('/summary')
def summary_page():
    return render_template('summary.html')

# Serve uploaded PDFs
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/upload', methods=['POST'])
def api_upload():
    f = request.files.get('file')
    if not f or not allowed_file(f.filename):
        return jsonify({'error': 'Invalid file'}), 400

    filename = secure_filename(f.filename)
    path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    f.save(path)

    items = []
    with pdfplumber.open(path) as pdf:
        table = pdf.pages[0].extract_table()
        for row in table[1:]:
            items.append({
                'name': row[0],
                'number': row[1],
                'requested': int(row[2])
            })

    return jsonify({
        'items': items,
        'pdf_url': url_for('uploaded_file', filename=filename)
    })

@app.route('/api/qr', methods=['POST'])
def api_qr():
    data = request.json.get('data')
    buf = io.BytesIO()
    img = qrcode.make(data)
    img.save(buf, format='PNG')
    buf.seek(0)
    return send_file(buf, mimetype='image/png')

if __name__ == '__main__':
    app.run(debug=True)
