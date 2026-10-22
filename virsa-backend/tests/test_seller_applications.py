import unittest
from datetime import datetime

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.api.routes.seller_applications import (
    create_seller_application,
    get_seller_application,
    list_my_seller_applications,
    list_seller_applications,
    review_seller_application,
)
from app.db.session import Base
from app.dependencies import require_role
from app.models.seller_application import SellerApplication
from app.models.user import User
from app.schemas.seller_application import (
    SellerApplicationCreate,
    SellerApplicationReview,
    SellerApplicationStatus,
)


class TestSellerApplications(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(cls.engine)
        cls.session_factory = sessionmaker(bind=cls.engine)

    def setUp(self) -> None:
        self.db = self.session_factory()
        self.db.query(SellerApplication).delete()
        self.db.query(User).delete()
        self.db.commit()
        self.customer = User(
            name="Customer",
            email=f"{self._testMethodName}-customer@example.com",
            hashed_password="hashed",
            role="customer",
            is_active=True,
        )
        self.admin = User(
            name="Admin",
            email=f"{self._testMethodName}-admin@example.com",
            hashed_password="hashed",
            role="admin",
            is_active=True,
        )
        self.db.add_all([self.customer, self.admin])
        self.db.commit()
        self.db.refresh(self.customer)
        self.db.refresh(self.admin)

    def tearDown(self) -> None:
        self.db.close()

    def test_customer_can_submit_and_view_own_application(self) -> None:
        application = create_seller_application(
            SellerApplicationCreate(
                business_name="Heritage Studio",
                description="We create traditional handcrafted goods for customers.",
            ),
            self.customer,
            self.db,
        )

        applications = list_my_seller_applications(self.customer, self.db)

        self.assertEqual(application.status, "pending")
        self.assertEqual(len(applications), 1)
        self.assertEqual(applications[0].applicant_id, self.customer.id)

    def test_admin_can_list_view_and_approve_application(self) -> None:
        application = create_seller_application(
            SellerApplicationCreate(
                business_name="Heritage Studio",
                description="We create traditional handcrafted goods for customers.",
            ),
            self.customer,
            self.db,
        )

        listed = list_seller_applications(self.admin, self.db, None)
        viewed = get_seller_application(application.id, self.admin, self.db)
        reviewed = review_seller_application(
            application.id,
            SellerApplicationReview(
                status=SellerApplicationStatus.approved,
            ),
            self.admin,
            self.db,
        )

        self.assertEqual(len(listed), 1)
        self.assertEqual(viewed.id, application.id)
        self.assertEqual(reviewed.status, "approved")
        self.assertEqual(reviewed.reviewed_by_id, self.admin.id)
        self.assertIsInstance(reviewed.reviewed_at, datetime)
        self.assertEqual(self.db.get(User, self.customer.id).role, "customer")

    def test_review_requires_notes_for_rejection_or_more_information(self) -> None:
        with self.assertRaises(ValueError):
            SellerApplicationReview(status=SellerApplicationStatus.rejected)

        with self.assertRaises(ValueError):
            SellerApplicationReview(
                status=SellerApplicationStatus.needs_more_info
            )

    def test_customer_cannot_view_another_users_application(self) -> None:
        other_customer = User(
            name="Other Customer",
            email="other@example.com",
            hashed_password="hashed",
            role="customer",
            is_active=True,
        )
        self.db.add(other_customer)
        self.db.commit()
        self.db.refresh(other_customer)

        application = create_seller_application(
            SellerApplicationCreate(
                business_name="Heritage Studio",
                description="We create traditional handcrafted goods for customers.",
            ),
            self.customer,
            self.db,
        )

        applications = list_my_seller_applications(other_customer, self.db)

        self.assertEqual(applications, [])
        self.assertNotEqual(application.applicant_id, other_customer.id)

    def test_application_is_not_created_for_non_customer_role(self) -> None:
        self.assertEqual(self.admin.role, "admin")
        with self.assertRaises(HTTPException) as context:
            require_role("customer")(self.admin)

        self.assertEqual(context.exception.status_code, 403)
        self.assertEqual(
            self.db.query(SellerApplication).count(),
            0,
        )


if __name__ == "__main__":
    unittest.main()
