"""
db/models.py — SQLAlchemy models for MySQL storage.
"""
from datetime import datetime
from sqlalchemy import String, Text, DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class MarutiPart(Base):
    """
    Stores cached genuine parts data scraped from marutisuzuki.com.
    
    Columns:
        part_number  — Normalized uppercase part number (primary key via UNIQUE)
        part_name    — Display name of the part
        mrp          — MRP string e.g. "₹1,234.00"
        availability — "In Stock", "Out of Stock", etc.
        image_url    — URL of product image from Maruti website
        category     — Part category / breadcrumb path
        status       — FOUND | NOT_FOUND | ERROR
        raw_data     — JSON blob for raw page data / debugging
        scraped_at   — When data was last scraped
        updated_at   — Auto-updated on every write
    """

    __tablename__ = "maruti_parts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    part_number: Mapped[str] = mapped_column(String(60), unique=True, nullable=False, index=True)
    part_name: Mapped[str | None] = mapped_column(String(512), nullable=True)
    mrp: Mapped[str | None] = mapped_column(String(64), nullable=True)
    availability: Mapped[str | None] = mapped_column(String(128), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    category: Mapped[str | None] = mapped_column(String(256), nullable=True)
    status: Mapped[str] = mapped_column(
        String(16), nullable=False, default="FOUND", index=True
    )
    raw_data: Mapped[str | None] = mapped_column(Text, nullable=True)
    scraped_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=func.now(), index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=func.now(), onupdate=func.now()
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "partNumber": self.part_number,
            "partName": self.part_name,
            "mrp": self.mrp,
            "availability": self.availability,
            "imageUrl": self.image_url,
            "category": self.category,
            "status": self.status,
            "scrapedAt": self.scraped_at.isoformat() if self.scraped_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
