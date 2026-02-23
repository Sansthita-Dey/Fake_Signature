import tensorflow as tf
import numpy as np
import random
import os
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras import layers, models
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping

# =========================
# 1️⃣ Set Seed for Reproducibility
# =========================
SEED = 42

random.seed(SEED)
np.random.seed(SEED)
tf.random.set_seed(SEED)
os.environ['PYTHONHASHSEED'] = str(SEED)

tf.config.experimental.enable_op_determinism()

# =========================
# 2️⃣ Configuration
# =========================
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 15

train_dir = "datasets/hindi/train"

# Create models folder if not exists
os.makedirs("models", exist_ok=True)

# =========================
# 3️⃣ Data Generator
# =========================
train_datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2
)

train_generator = train_datagen.flow_from_directory(
    train_dir,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='binary',
    subset='training',
    shuffle=True,
    seed=SEED
)

val_generator = train_datagen.flow_from_directory(
    train_dir,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='binary',
    subset='validation',
    shuffle=False,
    seed=SEED
)

# =========================
# 4️⃣ Transfer Learning Model
# =========================
base_model = tf.keras.applications.MobileNetV2(
    input_shape=(IMG_SIZE, IMG_SIZE, 3),
    include_top=False,
    weights='imagenet'
)

base_model.trainable = False

model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(1, activation='sigmoid')
])

# =========================
# 5️⃣ Compile Model
# =========================
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
    loss='binary_crossentropy',
    metrics=['accuracy']
)

# =========================
# 6️⃣ Callbacks (IMPORTANT)
# =========================
checkpoint = ModelCheckpoint(
    "models/hindi_best_model.keras",
    monitor="val_accuracy",
    save_best_only=True,
    mode="max",
    verbose=1
)

early_stop = EarlyStopping(
    monitor="val_loss",
    patience=5,
    restore_best_weights=True,
    verbose=1
)

# =========================
# 7️⃣ Train Model
# =========================
history = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=EPOCHS,
    callbacks=[checkpoint, early_stop]
)

# =========================
# 8️⃣ Save Final Model (Optional Backup)
# =========================
model.save("models/hindi_final_model.keras")

print("✅ Hindi model training complete.")
print("🏆 Best model saved as: models/hindi_best_model.keras")