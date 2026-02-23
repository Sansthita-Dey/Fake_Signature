import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

# =========================
# Configuration
# =========================
IMG_SIZE = 224
BATCH_SIZE = 32

test_dir = "datasets/hindi/test"
model_path = "models/hindi_best_model.keras"

# =========================
# Load Model
# =========================
print("🔄 Loading model...")
model = tf.keras.models.load_model(model_path)
print("✅ Model loaded successfully.")

# =========================
# Test Data Generator
# =========================
test_datagen = ImageDataGenerator(rescale=1./255)

test_generator = test_datagen.flow_from_directory(
    test_dir,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='binary',
    shuffle=False
)

# =========================
# Make Predictions
# =========================
print("🔄 Evaluating model...")

predictions = model.predict(test_generator)
y_pred = (predictions > 0.5).astype(int).flatten()
y_true = test_generator.classes

# =========================
# Evaluation Metrics
# =========================
accuracy = accuracy_score(y_true, y_pred)

print("\n============================")
print("📊 Evaluation Results")
print("============================")

print(f"✅ Test Accuracy: {accuracy * 100:.2f}%\n")

print("📌 Classification Report:")
print(classification_report(y_true, y_pred))

print("📌 Confusion Matrix:")
print(confusion_matrix(y_true, y_pred))

print("\n🎯 Evaluation Complete.")