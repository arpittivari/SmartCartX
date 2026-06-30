import sys
import os
from PyQt6.QtCore import QObject, pyqtSignal

class AppLogic(QObject):
    def __init__(self):
        super().__init__()
        self.smart_scanner = None
        self.weight_sensor = None
        # Initialize components locally to avoid circular imports if any
        from .smart_scanner import SmartScanner
        from ..hardware.esp_bridge import weight_sensor
        self.smart_scanner = SmartScanner()
        self.weight_sensor = weight_sensor
        self.cart_items = []

    def handle_scan(self, image_path):
        """
        Process a scanned image.
        1. Call SmartScanner.
        2. If product identified, verify against Weight Sensor.
        3. Add to cart if (Vision Match OR Barcode Match) AND (Weight Match).
        """
        print(f"Processing scan: {image_path}")

        scan_result = self.smart_scanner.scan(image_path)

        if not scan_result:
            print("No product identified.")
            return False

        product_id = scan_result['id']
        scan_type = scan_result['type']
        confidence = scan_result['confidence']

        print(f"Identified product: {product_id} via {scan_type} (Confidence: {confidence})")

        # Verify Weight
        # In a real scenario, we would need the expected weight of the product from a database.
        # Here we assume weight_sensor.verify_product checks if the *change* in weight matches *something* valid
        # or we pass the product_id to it if it had a lookup table.
        # The prompt says: "verify it against the **Weight Sensor** (use `hardware/esp_bridge.py`)."
        # I'll assume verify_product takes the product_id or just validates stability.
        # But logic requires "Weight Match".
        # I'll modify the mock to accept product_id for semantic correctness.

        is_weight_ok = self.weight_sensor.verify_product(product_id)

        if is_weight_ok:
            self.add_to_cart(product_id)
            return True
        else:
            print("Weight verification failed.")
            return False

    def add_to_cart(self, product_id):
        print(f"Adding {product_id} to cart.")
        self.cart_items.append(product_id)
        # Here we would also trigger UI updates and MQTT messages
