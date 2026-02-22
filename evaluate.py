import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix

IMG_SIZE = 224
BATCH_SIZE = 32

# ===============================
# Load Saved Model
# ===============================
model = tf.keras.models.load_model("signature_model_transfer.keras")

# ===============================
# Prepare Test Data
# ===============================
test_datagen = ImageDataGenerator(rescale=1./255)

test_generator = test_datagen.flow_from_directory(
    "test",  # your test folder name
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode="binary",
    shuffle=False
)

# ===============================
# Evaluate
# ===============================
print("\nEvaluating on Test Set...")
test_loss, test_acc = model.evaluate(test_generator)

print("\nTest Loss:", test_loss)
print("Test Accuracy:", test_acc)

# ===============================
# Confusion Matrix
# ===============================
predictions = model.predict(test_generator)
y_pred = (predictions > 0.5).astype(int).flatten()
y_true = test_generator.classes

print("\nConfusion Matrix:")
print(confusion_matrix(y_true, y_pred))

print("\nClassification Report:")
print(classification_report(y_true, y_pred, target_names=["Forged", "Genuine"]))