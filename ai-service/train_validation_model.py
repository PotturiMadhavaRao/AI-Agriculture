import tensorflow as tf
from tensorflow.keras import layers, models
import os

# ==============================
# 1. Configuration
# ==============================

DATASET_DIR = "dataset/validation/train"
MODEL_SAVE_PATH = "models/tomato_validation_model.keras"

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 10

# ==============================
# 2. Check Dataset
# ==============================
if not os.path.exists(DATASET_DIR):
    print(f"Error: Dataset directory {DATASET_DIR} not found.")
    print("Please create the following structure and add images:")
    print("  dataset/validation/train/tomato_leaf/")
    print("  dataset/validation/train/not_tomato_leaf/")
    exit(1)

# ==============================
# 3. Load dataset
# ==============================
dataset = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=True,
    validation_split=0.2,
    subset="training",
    seed=123
)

val_dataset = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False,
    validation_split=0.2,
    subset="validation",
    seed=123
)

class_names = dataset.class_names
print(f"Classes found: {class_names}")
if 'not_tomato_leaf' not in class_names or 'tomato_leaf' not in class_names:
    print("Warning: Expected classes 'tomato_leaf' and 'not_tomato_leaf'")

# ==============================
# 4. Build small CNN model
# ==============================
model = models.Sequential([
    layers.Input(shape=(224, 224, 3)),
    layers.Rescaling(1./255),
    
    layers.Conv2D(16, 3, padding='same', activation='relu'),
    layers.MaxPooling2D(),
    
    layers.Conv2D(32, 3, padding='same', activation='relu'),
    layers.MaxPooling2D(),
    
    layers.Conv2D(64, 3, padding='same', activation='relu'),
    layers.MaxPooling2D(),
    
    layers.Flatten(),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(1, activation='sigmoid') # Binary classification
])

model.compile(
    optimizer='adam',
    loss=tf.keras.losses.BinaryCrossentropy(),
    metrics=['accuracy']
)

model.summary()

# ==============================
# 5. Train Model
# ==============================
early_stopping = tf.keras.callbacks.EarlyStopping(
    monitor="val_loss",
    patience=3,
    restore_best_weights=True
)

os.makedirs("models", exist_ok=True)

print("\nStarting training...\n")
history = model.fit(
    dataset,
    validation_data=val_dataset,
    epochs=EPOCHS,
    callbacks=[early_stopping]
)

# ==============================
# 6. Save Model
# ==============================
model.save(MODEL_SAVE_PATH)
print(f"\nValidation model saved successfully to {MODEL_SAVE_PATH}")
