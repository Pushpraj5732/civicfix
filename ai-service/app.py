from flask import Flask, request, jsonify
import numpy as np
import os
import sys

app = Flask(__name__)

# Try to load TensorFlow models
models = {}

def load_models():
    """Load ML models if TensorFlow is available."""
    try:
        os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
        import tensorflow as tf
        
        base_path = os.path.join(os.path.dirname(__file__), '..', 'ML_Model')
        
        garbage_model_path = os.path.join(base_path, 'garbage_detector', 'garbage_detector_model.h5')
        if os.path.exists(garbage_model_path):
            models['garbage'] = tf.keras.models.load_model(garbage_model_path)
            print(f'✅ Loaded garbage detector model')
        
        pothole_model_path = os.path.join(base_path, 'pothole_detector', 'pothole_detector_model.h5')
        if os.path.exists(pothole_model_path):
            models['pothole'] = tf.keras.models.load_model(pothole_model_path)
            print(f'✅ Loaded pothole detector model')
            
    except ImportError:
        print('⚠️  TensorFlow not installed. AI service will use mock predictions.')
    except Exception as e:
        print(f'⚠️  Error loading models: {e}')


def predict_with_model(image_path, issue_type):
    """Run prediction using the appropriate model."""
    try:
        import tensorflow as tf
        from PIL import Image
        
        # Determine which model to use
        if issue_type in ['GARBAGE']:
            model = models.get('garbage')
            detected = 'garbage'
        elif issue_type in ['ROAD']:
            model = models.get('pothole')
            detected = 'pothole'
        else:
            # For DRAINAGE and STREET_LIGHT, auto-approve
            return {
                'isReal': True,
                'confidence': 0.95,
                'detectedIssue': issue_type.lower()
            }
        
        if not model:
            return {
                'isReal': True,
                'confidence': 0.90,
                'detectedIssue': detected
            }
        
        # Preprocess image
        img = Image.open(image_path).convert('RGB')
        img = img.resize((224, 224))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        # Predict
        prediction = model.predict(img_array, verbose=0)
        confidence = float(prediction[0][0])
        
        # For binary classification: > 0.5 means positive (issue detected)
        is_real = confidence > 0.5
        
        return {
            'isReal': is_real,
            'confidence': confidence if is_real else 1 - confidence,
            'detectedIssue': detected if is_real else 'clean'
        }
        
    except Exception as e:
        print(f'Prediction error: {e}')
        return {
            'isReal': True,
            'confidence': 0.85,
            'detectedIssue': issue_type.lower()
        }


@app.route('/analyze', methods=['POST'])
def analyze():
    """Analyze an uploaded complaint image."""
    data = request.get_json()
    
    if not data or 'imagePath' not in data:
        return jsonify({'error': 'imagePath is required'}), 400
    
    image_path = data['imagePath']
    issue_type = data.get('issueType', 'GARBAGE')
    
    if not os.path.exists(image_path):
        return jsonify({'error': f'Image not found: {image_path}'}), 404
    
    if models:
        result = predict_with_model(image_path, issue_type)
    else:
        # Mock prediction when models aren't loaded
        result = {
            'isReal': True,
            'confidence': 0.92,
            'detectedIssue': issue_type.lower()
        }
    
    return jsonify(result)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'modelsLoaded': list(models.keys())
    })


if __name__ == '__main__':
    load_models()
    print('🤖 AI Service starting on port 5001...')
    app.run(host='0.0.0.0', port=5001, debug=False)
