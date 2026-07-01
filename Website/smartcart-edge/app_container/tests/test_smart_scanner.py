import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import unittest
from unittest.mock import patch, MagicMock
from src.core.smart_scanner import SmartScanner

class TestSmartScanner(unittest.TestCase):
    def setUp(self):
        # Prevent the __init__ method from actually creating directories during tests
        with patch('os.makedirs'):
            self.scanner = SmartScanner()

    @patch('src.core.smart_scanner.cv2.imread')
    @patch('src.core.smart_scanner.decode')
    @patch('src.core.smart_scanner.vision_model.predict')
    @patch('src.core.smart_scanner.SmartScanner._save_training_data')
    def test_scan_fallback_to_barcode_success(self, mock_save_training, mock_predict, mock_decode, mock_imread):
        """Test that scan falls back to barcode when vision confidence is low (<0.7)."""
        # Setup: Vision model returns low confidence
        mock_predict.return_value = {"confidence": 0.65, "label": "unknown"}

        # Setup: Barcode decoding succeeds
        mock_imread.return_value = "dummy_image_data"
        mock_decoded_obj = MagicMock()
        mock_decoded_obj.data.decode.return_value = "123456789012"
        mock_decode.return_value = [mock_decoded_obj]

        result = self.scanner.scan("dummy/path.jpg")

        # Verify: Returns barcode result
        self.assertEqual(result, {
            "type": "barcode",
            "id": "123456789012",
            "confidence": 1.0
        })

        # Verify: Core functions were called with correct arguments
        mock_predict.assert_called_once_with("dummy/path.jpg")
        mock_imread.assert_called_once_with("dummy/path.jpg")
        mock_decode.assert_called_once_with("dummy_image_data")
        mock_save_training.assert_called_once_with("dummy/path.jpg", "123456789012")

    @patch('src.core.smart_scanner.cv2.imread')
    @patch('src.core.smart_scanner.decode')
    @patch('src.core.smart_scanner.vision_model.predict')
    @patch('src.core.smart_scanner.SmartScanner._save_training_data')
    def test_scan_vision_success(self, mock_save_training, mock_predict, mock_decode, mock_imread):
        """Test that scan returns vision result when confidence is high (>=0.7)."""
        # Setup: Vision model returns high confidence
        mock_predict.return_value = {"confidence": 0.85, "label": "apple"}

        result = self.scanner.scan("dummy/path.jpg")

        # Verify: Returns vision result
        self.assertEqual(result, {
            "type": "vision",
            "id": "apple",
            "confidence": 0.85
        })

        # Verify: Barcode decoding shouldn't be called
        mock_predict.assert_called_once_with("dummy/path.jpg")
        mock_imread.assert_not_called()
        mock_decode.assert_not_called()
        mock_save_training.assert_not_called()

    @patch('src.core.smart_scanner.cv2.imread')
    @patch('src.core.smart_scanner.decode')
    @patch('src.core.smart_scanner.vision_model.predict')
    @patch('src.core.smart_scanner.SmartScanner._save_training_data')
    def test_scan_fallback_barcode_not_found(self, mock_save_training, mock_predict, mock_decode, mock_imread):
        """Test when vision confidence is low and no barcode is found."""
        # Setup: Vision model returns low confidence
        mock_predict.return_value = {"confidence": 0.50, "label": "unknown"}

        # Setup: Barcode decoding fails (returns empty list)
        mock_imread.return_value = "dummy_image_data"
        mock_decode.return_value = []

        result = self.scanner.scan("dummy/path.jpg")

        # Verify: Returns None when both fail
        self.assertIsNone(result)

        mock_predict.assert_called_once_with("dummy/path.jpg")
        mock_imread.assert_called_once_with("dummy/path.jpg")
        mock_decode.assert_called_once_with("dummy_image_data")
        mock_save_training.assert_not_called()

    @patch('src.core.smart_scanner.cv2.imread')
    @patch('src.core.smart_scanner.decode')
    @patch('src.core.smart_scanner.vision_model.predict')
    def test_scan_fallback_image_read_fails(self, mock_predict, mock_decode, mock_imread):
        """Test when vision confidence is low and image cannot be read for barcode."""
        # Setup: Vision model returns low confidence
        mock_predict.return_value = {"confidence": 0.40, "label": "unknown"}

        # Setup: cv2.imread fails
        mock_imread.return_value = None

        result = self.scanner.scan("dummy/path.jpg")

        # Verify: Returns None
        self.assertIsNone(result)

        mock_predict.assert_called_once_with("dummy/path.jpg")
        mock_imread.assert_called_once_with("dummy/path.jpg")
        mock_decode.assert_not_called()

if __name__ == '__main__':
    unittest.main()
