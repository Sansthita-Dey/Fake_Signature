import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

# =========================
# Configuration
# =========================
IMG_SIZE = 128
BATCH_SIZE = 32

test_dir = "datasets/bengali/test"
model_path = "models/bengali_best_model.keras"

# =========================
# Load Model
# =========================
print("🔄 Loading model...")
model = tf.keras.models.load_model(model_path)
print("✅ Model loaded successfully.")

# =========================
# Test Generator
# =========================
test_datagen = ImageDataGenerator(rescale=1./255)

test_generator = test_datagen.flow_from_directory(
    test_dir,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    color_mode='grayscale',
    class_mode='binary',
    shuffle=False
)

# =========================
# Evaluate Model
# =========================
print("\n🔄 Evaluating model...")

results = model.evaluate(test_generator)

test_loss = results[0]
test_acc = results[1]
test_precision = results[2]
test_recall = results[3]

print("\n============================")
print("📊 Evaluation Results")
print("============================")

print(f"✅ Test Loss: {test_loss:.4f}")
print(f"✅ Test Accuracy: {test_acc * 100:.2f}%")
print(f"✅ Test Precision: {test_precision:.4f}")
print(f"✅ Test Recall: {test_recall:.4f}")

# =========================
# Confusion Matrix & Report
# =========================
predictions = model.predict(test_generator)
y_pred = (predictions > 0.5).astype(int).flatten()
y_true = test_generator.classes

print("\n📌 Confusion Matrix:")
print(confusion_matrix(y_true, y_pred))

print("\n📌 Classification Report:")
print(classification_report(y_true, y_pred))

print("\n🎯 Evaluation Complete.")