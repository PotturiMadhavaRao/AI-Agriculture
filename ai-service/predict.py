import tensorflow as tf
# pyrefly: ignore [missing-import]
from tensorflow.keras.utils import load_img, img_to_array
import numpy as np

MODEL_PATH = "models/tomato_disease_model.keras"

# Load trained model
model = tf.keras.models.load_model(MODEL_PATH)

# Class order used during training
class_names = [
    "early_blight",
    "healthy",
    "late_blight"
]

IMAGE_PATH = "test.jpg"

# Load image
img = load_img(
    IMAGE_PATH,
    target_size=(224, 224)
)

# Convert image to array
img_array = img_to_array(img)

# Add batch dimension
img_array = np.expand_dims(img_array, axis=0)

# Predict
predictions = model.predict(img_array)

# Get predicted class
predicted_index = np.argmax(predictions[0])
predicted_class = class_names[predicted_index]

confidence = float(predictions[0][predicted_index]) * 100

print("\nPrediction Result")
print("-------------------------")
print("Disease:", predicted_class)
print(f"Confidence: {confidence:.2f}%")