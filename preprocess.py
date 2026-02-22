import os
import cv2
import random
import shutil

BASE_PATH = "dataset"
PROCESSED_PATH = "processed"
TRAIN_PATH = "train"
TEST_PATH = "test"

IMG_SIZE = 128
random.seed(42)

def preprocess_image(img_path):
    img = cv2.imread(img_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    img = cv2.GaussianBlur(img, (3, 3), 0)
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    return img


# =========================
# Clear old folders
# =========================
for folder in ["processed", "train", "test"]:
    if os.path.exists(folder):
        shutil.rmtree(folder)

# Recreate structure
for folder in [
    "processed/genuine", "processed/forged",
    "train/genuine", "train/forged",
    "test/genuine", "test/forged"
]:
    os.makedirs(folder, exist_ok=True)


# =========================
# Preprocess and Save
# =========================
writer_ids = set()

for category in ["genuine", "forged"]:
    category_path = os.path.join(BASE_PATH, category)
    files = os.listdir(category_path)

    for file in files:
        writer_id = file.split("-")[2]   # Extract writer ID
        writer_ids.add(writer_id)

        img_path = os.path.join(category_path, file)
        img = preprocess_image(img_path)

        save_path = os.path.join(PROCESSED_PATH, category, file)
        cv2.imwrite(save_path, img)

print("✅ Preprocessing complete.")

# =========================
# Writer-wise Split
# =========================
writer_ids = list(writer_ids)
random.shuffle(writer_ids)

split = int(0.8 * len(writer_ids))
train_writers = set(writer_ids[:split])
test_writers = set(writer_ids[split:])

for category in ["genuine", "forged"]:
    category_path = os.path.join(PROCESSED_PATH, category)
    files = os.listdir(category_path)

    for file in files:
        writer_id = file.split("-")[2]

        if writer_id in train_writers:
            shutil.copy(
                os.path.join(category_path, file),
                os.path.join(TRAIN_PATH, category, file)
            )
        else:
            shutil.copy(
                os.path.join(category_path, file),
                os.path.join(TEST_PATH, category, file)
            )

print("✅ Writer-wise Train/Test split done.")
