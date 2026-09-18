import os
import shutil
import random

SOURCE_DIR = "dataset/tomato"
OUTPUT_DIR = "dataset/tomato_split"

classes = [
    "healthy",
    "early_blight",
    "late_blight"
]

train_ratio = 0.8

for class_name in classes:

    source_folder = os.path.join(SOURCE_DIR, class_name)

    train_folder = os.path.join(
        OUTPUT_DIR, "train", class_name
    )

    val_folder = os.path.join(
        OUTPUT_DIR, "val", class_name
    )

    os.makedirs(train_folder, exist_ok=True)
    os.makedirs(val_folder, exist_ok=True)

    images = [
        file for file in os.listdir(source_folder)
        if file.lower().endswith(
            (".jpg", ".jpeg", ".png")
        )
    ]

    random.shuffle(images)

    train_count = int(len(images) * train_ratio)

    train_images = images[:train_count]
    val_images = images[train_count:]

    for image in train_images:
        shutil.copy2(
            os.path.join(source_folder, image),
            os.path.join(train_folder, image)
        )

    for image in val_images:
        shutil.copy2(
            os.path.join(source_folder, image),
            os.path.join(val_folder, image)
        )

    print(f"\n{class_name}")
    print(f"Total: {len(images)}")
    print(f"Training: {len(train_images)}")
    print(f"Validation: {len(val_images)}")

print("\nDataset splitting completed!")