import unittest
from unittest.mock import Mock, patch

from app.core.security import hash_password, verify_password
from app.models.user import User
from reset_dev_password import (
    DevPasswordResetError,
    _require_local_reset_opt_in,
    reset_existing_user_password,
)


class TestResetDevPassword(unittest.TestCase):
    def test_resets_existing_user_password_without_changing_account_fields(
        self,
    ) -> None:
        user = User(
            id=7,
            name="Existing User",
            email="user@example.com",
            hashed_password=hash_password("old-password"),
            role="seller",
            is_active=True,
        )
        db = Mock()
        db.query.return_value.filter.return_value.first.return_value = user

        reset_email = reset_existing_user_password(
            db,
            " USER@EXAMPLE.COM ",
            "new-password",
        )

        self.assertEqual(reset_email, "user@example.com")
        self.assertTrue(verify_password("new-password", user.hashed_password))
        self.assertEqual(user.id, 7)
        self.assertEqual(user.email, "user@example.com")
        self.assertEqual(user.role, "seller")
        db.commit.assert_called_once_with()

    def test_missing_user_does_not_commit(self) -> None:
        db = Mock()
        db.query.return_value.filter.return_value.first.return_value = None

        with self.assertRaises(DevPasswordResetError):
            reset_existing_user_password(db, "missing@example.com", "new-password")

        db.commit.assert_not_called()

    def test_short_password_does_not_commit(self) -> None:
        db = Mock()

        with self.assertRaises(DevPasswordResetError):
            reset_existing_user_password(db, "user@example.com", "short")

        db.commit.assert_not_called()

    @patch.dict(
        "os.environ",
        {"ALLOW_DEV_PASSWORD_RESET": "true", "APP_ENV": "production"},
        clear=True,
    )
    def test_production_environment_is_rejected(self) -> None:
        with self.assertRaises(DevPasswordResetError):
            _require_local_reset_opt_in()

    @patch.dict(
        "os.environ",
        {"ALLOW_DEV_PASSWORD_RESET": "true"},
        clear=True,
    )
    def test_missing_environment_is_rejected(self) -> None:
        with self.assertRaises(DevPasswordResetError):
            _require_local_reset_opt_in()


if __name__ == "__main__":
    unittest.main()
