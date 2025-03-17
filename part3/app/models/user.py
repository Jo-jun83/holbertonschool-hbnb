from app.models.base import BaseModel
from flask_bcrypt import Bcrypt
from app import db, bcrypt

bcrypt = Bcrypt()

class User(BaseModel):
    __tablename__ = 'users'

    _first_name = db.Column(db.String(50), nullable=False)
    _last_name = db.Column(db.String(50), nullable=False)
    _email = db.Column(db.String(120), nullable=False, unique=True)
    _password = db.Column(db.String(128), nullable=False)
    _is_admin = db.Column(db.Boolean, default=False)
    places = db.relationship('Place',
                             back_populates='owner',
                             cascade='all, delete-orphan')
    reviews = db.relationship('Review', back_populates='user', cascade='all, delete-orphan')


    def hash_password(self, password):
        """Hash the password before storing it."""
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def verify_password(self, password):
        """Verify the hashed password."""
        return bcrypt.check_password_hash(self.password, password)

    @property
    def first_name(self):
        """
        Get the user's first name.
        """
        return self._first_name

    @first_name.setter
    def first_name(self, value):
        """
        Set the user's first name.
        """
        if not value or len(value) > 50 or len(value) < 1:
            raise ValueError(
                'The first name must be indicated and must be less than 50 characters long.'
                )
        self._first_name = value

    @property
    def last_name(self):
        """
        Get the user's last name.
        """
        return self._last_name

    @last_name.setter
    def last_name(self, value):
        """
        Set the user's last name.
        """
        if not value or len(value) > 50 or len(value) < 1:
            raise ValueError(
                'The last name must be indicated and must be less than 50 characters long.'
                )
        self._last_name = value

    @property
    def email(self):
        """
        Get the user's email.
        """
        return self._email

    @email.setter
    def email(self, value):
        """
        Set the user's email.
        """
        if not isinstance(value, str) or '@' not in value:
            raise ValueError("Valid email is required")
        self._email = value

    @property
    def is_admin(self):
        """
        Get the user's admin status.
        """
        return self._is_admin

    @is_admin.setter
    def is_admin(self, value):
        """
        Set the user's admin status.
        """
        if not isinstance(value, bool):
            raise ValueError('is_admin must be a boolean')
        self._is_admin = value

    def hash_password(self, password):
        """Hashes the password before storing it."""
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def verify_password(self, password):
        """Verifies if the provided password matches the hashed password."""
        return bcrypt.check_password_hash(self.password, password)