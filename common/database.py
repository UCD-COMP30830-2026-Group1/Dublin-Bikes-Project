# common/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import dbinfo

# App-wide engine singleton: manages the connection pool with pre-ping validation
# and connection recycling to handle RDS timeouts.
engine = create_engine(
    dbinfo.URI_ML, # Using SQLite for simplicity; switch to RDS URI in production
    pool_pre_ping = True, # Active health check before each checkout
    pool_recycle=3600, # Refresh connections every hour
    pool_size=10  # Limit max persistent connections for 1GB RAM safety
)

# Session Factory: Generates thread-safe database session instances.
# autocommit=False ensures transactions are only committed explicitly.
SessionLocal = sessionmaker(autocommit=False,autoflush=False,bind=engine)