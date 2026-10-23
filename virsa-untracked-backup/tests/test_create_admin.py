import unittest
from unittest.mock import Mock, patch

from create_admin import (
    AdminPromotionError,
    _require_local_promotion_opt_in,
    promote_existing_user,
)
from app.models.user import User


class TestCreateAdmin(unittest.TestCase):
    def test_promotes_existing_user_without_changing_password(self) -> None:
        user = User(
            name="Existing User",
            email="admin@example.com",
            hashed_password="existing-hash",
            role="customer",
            is_active=True,
        )
        db = Mock()
        db.query.return_value.filter.return_value.first.return_value = user

        promoted_email = promote_existing_user(db, " ADMIN@EXAMPLE.COM ")

        self.assertEqual(promoted_email, "admin@example.com")
        self.assertEqual(user.role, "admin")
        self.assertEqual(user.hashed_password, "existing-hash")
        db.commit.assert_called_once_with()

    def test_missing_user_does_not_commit(self) -> None:
        db = Mock()
        db.query.return_value.filter.return_value.first.return_value = None

        with self.assertRaises(AdminPromotionError):
            promote_existing_user(db, "missing@example.com")

        db.commit.assert_not_called()

    @patch.dict(
        "os.environ",
        {"ALLOW_ADMIN_PROMOTION": "true", "APP_ENV": "production"},
        clear=True,
    )
    def test_production_environment_is_rejected(self) -> None:
        with self.assertRaises(AdminPromotionError):
            _require_local_promotion_opt_in()

    @patch.dict(
        "os.environ",
        {"ALLOW_ADMIN_PROMOTION": "true"},
        clear=True,
    )
    def test_missing_environment_is_rejected(self) -> None:
        with self.assertRaises(AdminPromotionError):
            _require_local_promotion_opt_in()


if __name__ == "__main__":
    unittest.main()
