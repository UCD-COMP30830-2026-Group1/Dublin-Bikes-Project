import pytest
from flask_app import create_app
from common.database import SessionLocal

@pytest.fixture(scope="session")
def app():
    """Create and configure a new app instance for the entire test session."""
    app = create_app()
    app.config.update({
        "TESTING": True,
        "CACHE_TYPE": "NullCache",
    })
    yield app

@pytest.fixture(scope="session")
def client(app):
    """A test client for the app."""
    return app.test_client()

@pytest.fixture(scope="function")
def db_session():
    """Provide a clean database session for each test, ensuring it closes."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()