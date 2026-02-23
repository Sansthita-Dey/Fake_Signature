import os
import random
import shutil

random.seed(42)

BASE_DATASET_DIR = "datasets"
LANGUAGES = ["hindi", "bengali"]

SPLIT_RATIO = {
    "train": 0.7,
    "val": 0.15,
    "test": 0.15
}

for lang in LANGUAGES:
    print(f"\n🔄 Processing {lang.upper()} dataset...")

    source_dir = os.path.join(BASE_DATASET_DIR, lang, "original")

    for category in ["genuine", "forged"]:
        category_path = os.path.join(source_dir, category)
        images = os.listdir(category_path)
        random.shuffle(images)

        total = len(images)
        train_end = int(total * SPLIT_RATIO["train"])
        val_end = train_end + int(total * SPLIT_RATIO["val"])

        splits = {
            "train": images[:train_end],
            "val": images[train_end:val_end],
            "test": images[val_end:]
        }

        for split_name, split_images in splits.items():
            split_folder = os.path.join(BASE_DATASET_DIR, lang, split_name, category)
            os.makedirs(split_folder, exist_ok=True)

            for img in split_images:
                shutil.copy(
                    os.path.join(category_path, img),
                    os.path.join(split_folder, img)
                )

    print(f"✅ {lang.upper()} split completed.")

print("\n🎯 All datasets split successfully.")