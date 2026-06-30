import sys
import time
from PyQt6.QtCore import QCoreApplication, QTimer
# In a real GUI app, we would import QApplication and Main Window classes
# For this headless simulation or service, QCoreApplication is sufficient for the event loop (QThread)

from .core.app_logic import AppLogic
from .services.upload_agent import UploadAgent

# Mock Hardware Trigger (Keyboard or Signal)
# In production, this would be an interrupt from the ESP32 bridge or button press
class MockHardwareLoop:
    def __init__(self, app_logic):
        self.app_logic = app_logic
        self.timer = QTimer()
        self.timer.timeout.connect(self.simulate_scan)
        self.scan_count = 0

    def start(self):
        self.timer.start(10000) # Simulate a scan every 10 seconds

    def simulate_scan(self):
        self.scan_count += 1
        # Determine a mock image path
        # In real life, this comes from the camera
        image_path = f"captures/scan_{self.scan_count}.jpg"
        # We need a file to exist for the scanner to work?
        # The scanner uses cv2.imread. If file doesn't exist it returns None.
        # Let's just log the trigger for now.
        print(f"HARDWARE: Triggering scan for {image_path}")

        # We invoke the logic
        success = self.app_logic.handle_scan(image_path)
        if success:
            print("HARDWARE: Green Light - Item Added")
        else:
            print("HARDWARE: Red Light - Scan Failed / Verification Failed")

def main():
    print("🚀 Starting SmartCart Edge (v4.0)...")
    app = QCoreApplication(sys.argv)

    # 1. Initialize Core Logic
    app_logic = AppLogic()

    # 2. Initialize Background Services (Data Flywheel)
    # Token would normally come from provisioning file
    DEVICE_TOKEN = "provisioned_token_123"
    API_URL = "http://localhost:5000/api/v1/fleet/upload-training-data"

    upload_agent = UploadAgent(DEVICE_TOKEN, API_URL)
    upload_agent.start()
    print("✅ Upload Agent started (Background Thread)")

    # 3. Start Hardware Loop
    hw_loop = MockHardwareLoop(app_logic)
    hw_loop.start()
    print("✅ Hardware Loop started")

    # 4. Enter Event Loop
    try:
        sys.exit(app.exec())
    except KeyboardInterrupt:
        print("🛑 Shutting down...")
        upload_agent.stop()
        upload_agent.wait()

if __name__ == "__main__":
    main()
