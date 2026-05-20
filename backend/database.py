# database.py
# This file sets up our database where we save log analyses

from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# This tells SQLAlchemy to use SQLite and save to a file called logs.db
SQLALCHEMY_DATABASE_URL = "sqlite:///./logs.db"

# Create the database connection
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

# Create a session factory (sessions are like conversations with the database)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class that all our database tables will inherit from
Base = declarative_base()

# This defines what one "log analysis session" looks like in our database
class LogSession(Base):
    __tablename__ = "log_sessions"  # Name of the table in the database
    
    id = Column(Integer, primary_key=True, index=True)  # Auto ID number
    filename = Column(String)        # Name of the uploaded file
    raw_content = Column(Text)       # The actual log content
    analysis = Column(Text)          # The AI's analysis (stored as JSON text)
    created_at = Column(DateTime, default=datetime.utcnow)  # When it was created

# This creates the actual table in the database file
Base.metadata.create_all(bind=engine)

# This function gives us a database session and closes it when done
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()