import os
import requests
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from PyQt6.QtCore import QThread, pyqtSignal

class UploadAgent(QThread):
    def __init__(self, device_token, api_url):
        super().__init__()
        self.device_token = device_token
        self.api_url = api_url # e.g., "http://localhost:5000/api/v1/fleet/upload-training-data"
        self.training_path = "captures/training/"
        self.running = True

    def run(self):
        """
        Background thread that checks the captures/training/ folder.
        If Wi-Fi is available (implicit by connection success), upload images.
        Delete local files after successful upload.
        """
        while self.running:
            self.check_and_upload()
            # QThread.sleep is static, but here we can use time.sleep or self.msleep if inheriting
            self.msleep(60000) # Check every minute

    def check_and_upload(self):
        if not os.path.exists(self.training_path):
            return

        files = [f for f in os.listdir(self.training_path) if f.endswith('.jpg') or f.endswith('.png')]

        if not files:
            return

        print(f"Found {len(files)} files to upload.")

        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = {
                executor.submit(self.upload_file, os.path.join(self.training_path, filename), filename): filename
                for filename in files
            }
            for future in as_completed(futures):
                filename = futures[future]
                try:
                    future.result()
                except Exception as e:
                    print(f"Failed to upload {filename}: {e}")

    def upload_file(self, file_path, filename):
        headers = {
            "x-device-token": self.device_token
        }

        # Determine product ID from filename (assuming filename is "barcode.jpg")
        product_id = os.path.splitext(filename)[0]

        with open(file_path, 'rb') as f:
            files = {'file': (filename, f, 'image/jpeg')}
            data = {'product_id': product_id}

            response = requests.post(
                self.api_url,
                headers=headers,
                files=files,
                data=data,
                timeout=10
            )

        if response.status_code == 200 or response.status_code == 201:
            print(f"Successfully uploaded {filename}")
            os.remove(file_path)
        else:
            print(f"Upload failed for {filename}: {response.status_code} - {response.text}")

    def stop(self):
        self.running = False
