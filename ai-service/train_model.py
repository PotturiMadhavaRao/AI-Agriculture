import tensorflow as tf
from tensorflow.keras import layers, models
# pyrefly: ignore [missing-import]
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
import os

# ==============================
# 1. Configuration
# ==============================

DATASET_DIR = "dataset/tomato_split"

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 10

# ==============================
# 2. Load training dataset
# ==============================

train_dataset = tf.keras.utils.image_dataset_from_directory(
    os.path.join(DATASET_DIR, "train"),
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=True
)

# ==============================
# 3. Load validation dataset
# ==============================

validation_dataset = tf.keras.utils.image_dataset_from_directory(
    os.path.join(DATASET_DIR, "val"),
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)

# ==============================
# 4. Get class names
# ==============================

class_names = train_dataset.class_names

print("\nClasses:")
print(class_names)

# ==============================
# 5. Improve dataset performance
# ==============================

AUTOTUNE = tf.data.AUTOTUNE

train_dataset = train_dataset.prefetch(
    buffer_size=AUTOTUNE
)

validation_dataset = validation_dataset.prefetch(
    buffer_size=AUTOTUNE
)

# ==============================
# 6. Load MobileNetV2
# ==============================

base_model = MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights="imagenet"
)

# Freeze the pretrained model

base_model.trainable = False

# ==============================
# 7. Build our model
# ==============================

model = models.Sequential([
    
    layers.Input(shape=(224, 224, 3)),

    layers.Rescaling(
        1.0 / 127.5,
        offset=-1
    ),

    base_model,

    layers.GlobalAveragePooling2D(),

    layers.Dropout(0.2),

    layers.Dense(
        len(class_names),
        activation="softmax"
    )
])

# ==============================
# 8. Compile model
# ==============================

model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

# ==============================
# 9. Display model
# ==============================

model.summary()

# ==============================
# 10. Create models directory
# ==============================

os.makedirs("models", exist_ok=True)

# ==============================
# 11. Callbacks
# ==============================

early_stopping = EarlyStopping(
    monitor="val_loss",
    patience=3,
    restore_best_weights=True
)

checkpoint = ModelCheckpoint(
    "models/tomato_disease_model.keras",
    monitor="val_accuracy",
    save_best_only=True
)

# ==============================
# 12. Train model
# ==============================

print("\nStarting training...\n")

history = model.fit(
    train_dataset,
    validation_data=validation_dataset,
    epochs=EPOCHS,
    callbacks=[
        early_stopping,
        checkpoint
    ]
)

# ==============================
# 13. Evaluate model
# ==============================

print("\nEvaluating model...\n")

loss, accuracy = model.evaluate(
    validation_dataset
)

print(f"\nValidation Accuracy: {accuracy * 100:.2f}%")
print(f"Validation Loss: {loss:.4f}")

print("\nTraining completed!")