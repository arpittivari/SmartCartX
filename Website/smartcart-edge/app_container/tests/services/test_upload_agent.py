import unittest
from unittest.mock import patch, MagicMock
import os
import sys

# Ensure src is in the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src')))

from services.upload_agent import UploadAgent

class TestUploadAgent(unittest.TestCase):
    def setUp(self):
        # We mock QApplication or QThread components if needed, but UploadAgent inherits QThread
        # which might require a QCoreApplication instance in some contexts, but check_and_upload
        # is just a normal method, so it should be fine.
        self.agent = UploadAgent("dummy_token", "http://dummy.url")

    @patch('services.upload_agent.os.path.exists')
    @patch('services.upload_agent.os.listdir')
    @patch.object(UploadAgent, 'upload_file')
    def test_check_and_upload_directory_not_exists(self, mock_upload_file, mock_listdir, mock_exists):
        """Test that check_and_upload returns early if training_path does not exist."""
        mock_exists.return_value = False

        self.agent.check_and_upload()

        # Verify exists was called with the correct path
        mock_exists.assert_called_once_with(self.agent.training_path)

        # Verify it returns before calling listdir or upload_file
        mock_listdir.assert_not_called()
        mock_upload_file.assert_not_called()

    @patch('services.upload_agent.os.path.exists')
    @patch('services.upload_agent.os.listdir')
    @patch.object(UploadAgent, 'upload_file')
    def test_check_and_upload_no_files(self, mock_upload_file, mock_listdir, mock_exists):
        """Test that check_and_upload returns early if no matching files are found."""
        mock_exists.return_value = True
        mock_listdir.return_value = ['not_an_image.txt', 'document.pdf']

        self.agent.check_and_upload()

        # Verify exists was called
        mock_exists.assert_called_once_with(self.agent.training_path)
        # Verify listdir was called
        mock_listdir.assert_called_once_with(self.agent.training_path)
        # Verify upload_file was not called
        mock_upload_file.assert_not_called()

if __name__ == '__main__':
    unittest.main()
