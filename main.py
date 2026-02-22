from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import tensorflow as tf
import numpy as np
from PIL import Image
import io

# =========================
# Create FastAPI App
# =========================
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Load Trained Model
# =========================
model = tf.keras.models.load_model("signature_model_transfer.keras")

IMG_SIZE = 224

# =========================
# Image Preprocessing
# =========================
def preprocess_image(image: Image.Image):
    image = image.resize((IMG_SIZE, IMG_SIZE))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image

# =========================
# Serve Static Folder
# =========================
app.mount("/static", StaticFiles(directory="static"), name="static")

# =========================
# Serve Frontend
# =========================
@app.get("/")
def serve_frontend():
    return FileResponse("static/index.html")

# =========================
# Prediction Route
# =========================
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")

    processed_image = preprocess_image(image)

    prediction = model.predict(processed_image)[0][0]

    if prediction > 0.5:
        label = "Genuine"
        confidence = float(prediction)
    else:
        label = "Forged"
        confidence = float(1 - prediction)

    return JSONResponse({
        "prediction": label,
        "confidence_percent": round(confidence * 100, 2)
    })