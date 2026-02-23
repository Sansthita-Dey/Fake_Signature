from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import uvicorn
from utils.preprocess import preprocess_image

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("🔄 Loading models...")

models = {
    "hindi": tf.keras.models.load_model("models/hindi_best_model.keras"),
    "bengali": tf.keras.models.load_model("models/bengali_best_model.keras"),
}

print("✅ Models loaded successfully.")

@app.post("/predict")
async def predict(file: UploadFile = File(...), language: str = Form(...)):
    if language not in models:
        return {"error": "Unsupported language"}

    contents = await file.read()
    processed_image = preprocess_image(contents, language)

    model = models[language]
    prediction = model.predict(processed_image)[0][0]

    label = "Forged" if prediction > 0.5 else "Genuine"
    confidence = float(prediction if prediction > 0.5 else 1 - prediction)

    return {
        "language": language,
        "prediction": label,
        "confidence": round(confidence * 100, 2)
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)