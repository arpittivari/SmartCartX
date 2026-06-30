import cv2
import os
import shutil
from pyzbar.pyzbar import decode

from .local_vision import vision_model

class SmartScanner:
    def __init__(self):
        self.vision = vision_model
        self.training_path = "captures/training/"
        if not os.path.exists(self.training_path):
            os.makedirs(self.training_path)

    def scan(self, image_path):
        """
        Tries Vision AI first.
        If confidence < 70%, automatically switches to Barcode Mode.
        Returns a unified object: { type: 'vision'|'barcode', id: string, confidence: float }
        """

        # 1. Vision AI
        vision_result = self.vision.predict(image_path)
        confidence = vision_result.get("confidence", 0.0)
        product_id = vision_result.get("label", "")

        if confidence >= 0.70:
            return {
                "type": "vision",
                "id": product_id,
                "confidence": confidence
            }

        # 2. Barcode Mode (Fallback)
        # Load image for barcode scanning
        image = cv2.imread(image_path)
        if image is None:
            print(f"Error: Could not read image at {image_path}")
            return None

        decoded_objects = decode(image)

        if decoded_objects:
            # Assuming the first barcode is the target
            barcode_data = decoded_objects[0].data.decode("utf-8")

            # Data Flywheel: Save the image for training
            self._save_training_data(image_path, barcode_data)

            return {
                "type": "barcode",
                "id": barcode_data,
                "confidence": 1.0
            }

        return None

    def _save_training_data(self, image_path, barcode_id):
        """
        Saves the image to local folder captures/training/ with the barcode ID as filename.
        """
        filename = f"{barcode_id}.jpg"
        target_path = os.path.join(self.training_path, filename)
        try:
            shutil.copy(image_path, target_path)
            # print(f"Saved training data: {target_path}")
        except Exception as e:
            print(f"Error saving training data: {e}")
