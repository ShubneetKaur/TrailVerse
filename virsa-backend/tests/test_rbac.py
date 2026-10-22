import unittest

from fastapi import HTTPException

from app.api.routes.auth import register
from app.dependencies import get_current_user, require_role
from app.models.user import User
from app.schemas.auth import UserRegister


class FakeDatabase:
    def __init__(self) -> None:
        self.added_user: User | None = None

    def query(self, model: type[User]) -> "FakeQuery":
        return FakeQuery()

    def add(self, user: User) -> None:
        self.added_user = user

    def commit(self) -> None:
        pass

    def refresh(self, user: User) -> None:
        pass


class FakeQuery:
    def filter(self, condition: object) -> "FakeQuery":
        return self

    def first(self) -> None:
        return None


class TestRoleBasedAccessControl(unittest.TestCase):
    def setUp(self) -> None:
        self.customer = User(
            name="Customer",
            email="customer@example.com",
            hashed_password="hashed",
            role="customer",
            is_active=True,
        )

    def test_allowed_role_returns_current_user(self) -> None:
        dependency = require_role("customer")

        self.assertIs(dependency(self.customer), self.customer)

    def test_forbidden_role_returns_403(self) -> None:
        dependency = require_role("seller")

        with self.assertRaises(HTTPException) as context:
            dependency(self.customer)

        self.assertEqual(context.exception.status_code, 403)

    def test_missing_authentication_returns_401(self) -> None:
        with self.assertRaises(HTTPException) as context:
            get_current_user(credentials=None, db=None)

        self.assertEqual(context.exception.status_code, 401)

    def test_registration_payload_cannot_set_role(self) -> None:
        payload = UserRegister.model_validate(
            {
                "name": "Customer",
                "email": "customer@example.com",
                "password": "password123",
                "role": "admin",
            }
        )

        self.assertFalse(hasattr(payload, "role"))

    def test_registration_always_assigns_customer_role(self) -> None:
        database = FakeDatabase()
        payload = UserRegister(
            name="Customer",
            email="customer@example.com",
            password="password123",
        )

        register(payload, database)

        self.assertIsNotNone(database.added_user)
        self.assertEqual(database.added_user.role, "customer")

    def test_invalid_token_is_unauthenticated(self) -> None:
        credentials = type(
            "Credentials",
            (),
            {"credentials": "invalid-token"},
        )()

        with self.assertRaises(HTTPException) as context:
            get_current_user(credentials=credentials, db=None)

        self.assertEqual(context.exception.status_code, 401)


if __name__ == "__main__":
    unittest.main()
