import unittest

import sys
import os

# Add app_container directory to path so absolute imports like `src.core...` work

from unittest.mock import patch
import sys
import os

# Add the parent directory to sys.path so we can import src

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.core.app_logic import AppLogic

class TestAppLogic(unittest.TestCase):

    def setUp(self):
        self.app_logic = AppLogic()

    def test_add_to_cart(self):
        # Arrange
        initial_count = len(self.app_logic.cart_items)
        product_id = "test_product_123"

        # Act
        self.app_logic.add_to_cart(product_id)

        # Assert
        self.assertEqual(len(self.app_logic.cart_items), initial_count + 1)
        self.assertIn(product_id, self.app_logic.cart_items)
        self.assertEqual(self.app_logic.cart_items[-1], product_id)

    def test_handle_scan_invalid_image(self):
        app_logic = AppLogic()

        # Mock the scan method to return None
        with patch.object(app_logic.smart_scanner, 'scan', return_value=None):
            result = app_logic.handle_scan("invalid_path.jpg")

            # Verify the result is False
            self.assertFalse(result)

            # Verify no items were added to the cart
            self.assertEqual(len(app_logic.cart_items), 0)


if __name__ == '__main__':
    unittest.main()
