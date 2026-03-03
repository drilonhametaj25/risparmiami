"""PDF extraction using pdfplumber."""
import os
import time
import logging
import requests
import pdfplumber

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": "RisparmiaMi-Scraper/1.0 (+https://risparmiami.pro)"
}


class PdfExtractor:
    """Extract text and tables from PDF files."""

    @staticmethod
    def download_pdf(url: str, output_path: str) -> str:
        """Download a PDF from URL and save to disk."""
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Use cached version if exists and recent (< 24h)
        if os.path.exists(output_path):
            age_hours = (time.time() - os.path.getmtime(output_path)) / 3600
            if age_hours < 24:
                logger.info(f"Using cached PDF: {output_path}")
                return output_path

        logger.info(f"Downloading PDF: {url}")
        response = requests.get(url, headers=HEADERS, timeout=60)
        response.raise_for_status()

        with open(output_path, "wb") as f:
            f.write(response.content)

        logger.info(f"Saved PDF to: {output_path}")
        return output_path

    @staticmethod
    def extract_text(pdf_path: str) -> str:
        """Extract all text from a PDF file."""
        text_parts = []
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for i, page in enumerate(pdf.pages):
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(f"--- Page {i + 1} ---\n{page_text}")
        except Exception as e:
            logger.error(f"Failed to extract text from {pdf_path}: {e}")
            raise

        return "\n\n".join(text_parts)

    @staticmethod
    def extract_tables(pdf_path: str) -> list[list[list[str]]]:
        """Extract all tables from a PDF file. Returns list of tables, each table is list of rows."""
        tables = []
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_tables = page.extract_tables()
                    if page_tables:
                        # Clean up None values
                        for table in page_tables:
                            cleaned = []
                            for row in table:
                                cleaned.append([cell.strip() if cell else "" for cell in row])
                            tables.append(cleaned)
        except Exception as e:
            logger.error(f"Failed to extract tables from {pdf_path}: {e}")
            raise

        return tables
