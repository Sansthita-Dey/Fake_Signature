import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Dense, Dropout, BatchNormalization, GlobalAveragePooling2D
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.metrics import Precision, Recall
from sklearn.utils import class_weight
from sklearn.metrics import classification_report
import numpy as np

# =========================
# Image Parameters
# =========================
IMG_SIZE = 128
BATCH_SIZE = 32

# =========================
# Data Augmentation (Signature Safe)
# =========================
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=5,
    zoom_range=0.05,
    width_shift_range=0.05,
    height_shift_range=0.05
)

test_datagen = ImageDataGenerator(rescale=1./255)

# =========================
# Data Generators
# =========================
train_generator = train_datagen.flow_from_directory(
    "train",
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    color_mode='grayscale',
    class_mode='binary',
    shuffle=True
)

test_generator = test_datagen.flow_from_directory(
    "test",
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    color_mode='grayscale',
    class_mode='binary',
    shuffle=False
)

# =========================
# Class Weight Balancing
# =========================
class_weights = class_weight.compute_class_weight(
    class_weight='balanced',
    classes=np.unique(train_generator.classes),
    y=train_generator.classes
)

class_weights_dict = dict(enumerate(class_weights))
print("Class Weights:", class_weights_dict)

# =========================
# Optimized CNN Architecture
# =========================
model = Sequential([
    Conv2D(32, (3,3), activation='relu', input_shape=(IMG_SIZE, IMG_SIZE, 1)),
    BatchNormalization(),
    MaxPooling2D(2,2),

    Conv2D(64, (3,3), activation='relu'),
    BatchNormalization(),
    MaxPooling2D(2,2),

    Conv2D(128, (3,3), activation='relu'),
    BatchNormalization(),
    MaxPooling2D(2,2),

    Conv2D(256, (3,3), activation='relu'),
    BatchNormalization(),
    MaxPooling2D(2,2),

    GlobalAveragePooling2D(),

    Dense(128, activation='relu'),
    BatchNormalization(),
    Dropout(0.5),

    Dense(1, activation='sigmoid')
])

# =========================
# Compile Model
# =========================
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.0005),
    loss='binary_crossentropy',
    metrics=['accuracy', Precision(name="precision"), Recall(name="recall")]
)

model.summary()

# =========================
# Callbacks
# =========================
early_stop = EarlyStopping(
    monitor='val_loss',
    patience=5,
    restore_best_weights=True
)

reduce_lr = ReduceLROnPlateau(
    monitor='val_loss',
    factor=0.5,
    patience=3,
    min_lr=1e-6
)

# =========================
# Train Model
# =========================
history = model.fit(
    train_generator,
    epochs=25,
    validation_data=test_generator,
    callbacks=[early_stop, reduce_lr],
    class_weight=class_weights_dict
)

# =========================
# Evaluate Model (F1 Report)
# =========================
print("\nEvaluating Model...\n")

test_generator.reset()
preds = model.predict(test_generator)
preds = (preds > 0.5).astype(int)

print(classification_report(test_generator.classes, preds))

# =========================
# Save Model
# =========================
model.save("signature_model_final.keras")

print("✅ Final Optimized CNN training complete and model saved.")
