import unittest
from unittest.mock import Mock, patch

from bson import ObjectId

from app import create_app
from app.models import review_model


class ReviewDeleteRouteTests(unittest.TestCase):
    def setUp(self):
        self.init_db_patcher = patch("app.init_db")
        self.init_db_patcher.start()
        self.app = create_app()
        self.app.testing = True
        self.client = self.app.test_client()

    def tearDown(self):
        self.init_db_patcher.stop()

    def test_delete_requires_a_positive_user_id(self):
        response = self.client.delete("/reviews/review-id")

        self.assertEqual(response.status_code, 422)
        self.assertIn("user_id", response.json["errors"])

    @patch("app.controllers.review_controller.review_service.delete_review")
    def test_delete_passes_the_selected_user_id(self, delete_review):
        response = self.client.delete("/reviews/review-id?user_id=7")

        self.assertEqual(response.status_code, 200)
        delete_review.assert_called_once_with("review-id", 7)


class ReviewDeleteModelTests(unittest.TestCase):
    @patch("app.models.review_model.get_collection")
    def test_delete_filters_by_review_and_owner(self, get_collection):
        collection = Mock()
        collection.delete_one.return_value.deleted_count = 0
        get_collection.return_value = collection
        review_id = ObjectId()

        deleted = review_model.delete(review_id, 7)

        self.assertFalse(deleted)
        collection.delete_one.assert_called_once_with({
            "_id": review_id,
            "user_id": 7,
        })


if __name__ == "__main__":
    unittest.main()
