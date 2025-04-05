from flask import Flask, jsonify
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)

@app.route('/api/scan', methods=['POST'])
def mock_scan():
    # Simulate processing delay
    time.sleep(2)
    
    return jsonify({
        "status": "success",
        "message": "Mock scan processed",
        "modelUrl": "models/130.glb",
        "scanId": f"mock_{int(time.time())}",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S")
    })

@app.route('/api/test')
def test_endpoint():
    return jsonify({"message": "Mock API is working!"})

if __name__ == '__main__':
    app.run(port=5001)  # Different port to avoid conflicts