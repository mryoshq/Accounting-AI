# app/api/routeS/tools/gpt_utils.py

import os
import base64
from dotenv import load_dotenv
from fastapi import UploadFile
from PIL import Image
from io import BytesIO
from pydantic import BaseModel, Field
from datetime import date
from typing import List, Optional, Literal
import fitz 
import json
import instructor
from openai import OpenAI

from sqlmodel import Session, select
from app.models import User
from app.core.db import engine
from app.core.security import decrypt_token

import logging

logger = logging.getLogger(__name__)

def get_user_api_key(user_id: int) -> str:
    logger.debug(f"Attempting to retrieve API key for user {user_id}")
    with Session(engine) as session:
        statement = select(User.api_token).where(User.id == user_id)
        result = session.exec(statement).first()
        if not result:
            logger.error(f"No API key found for user with id {user_id}")
            raise ValueError(f"No API key found for user with id {user_id}")
        logger.info(f"API key retrieved for user {user_id}")
        return result

def load_env(user_id: int) -> str:
    logger.debug(f"Loading environment for user {user_id}")
    try:
        encrypted_api_key = get_user_api_key(user_id)
        if not encrypted_api_key:
            logger.error(f"Encrypted API key not found for user {user_id}")
            raise ValueError("API key not found for the user")
        
        logger.debug(f"Attempting to decrypt API key for user {user_id}")
        decrypted_api_key = decrypt_token(encrypted_api_key)
        if not decrypted_api_key:
            logger.error(f"Failed to decrypt API key for user {user_id}")
            raise ValueError("Failed to decrypt API key")
        
        logger.info(f"API key successfully decrypted for user {user_id}")
        logger.info(f"loadenv _ API key: {decrypted_api_key}")
        return decrypted_api_key
    except Exception as e:
        logger.error(f"Error in load_env for user {user_id}: {str(e)}", exc_info=True)
        raise


# PDF processing
def is_pdf(file: UploadFile):
    return file.content_type == 'application/pdf'

def convert_pdf_to_jpeg(file: UploadFile, resolution=144):
    # Read the uploaded file
    pdf_data = file.file.read()
    pdf_document = fitz.open(stream=pdf_data, filetype="pdf")
    page = pdf_document.load_page(0)  # Load the first page

    # Set the resolution (DPI)
    zoom_x = resolution / 72  # Horizontal zoom factor
    zoom_y = resolution / 72  # Vertical zoom factor
    mat = fitz.Matrix(zoom_x, zoom_y)  # Define transformation matrix for zoom

    pix = page.get_pixmap(matrix=mat)  # Render page to an image
    image = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    jpeg_image = BytesIO()
    image.save(jpeg_image, format="JPEG", quality=95, optimize=True)
    jpeg_image.seek(0)
    return jpeg_image

# Image processing
def convert_image_to_jpeg(file: UploadFile):
    image = Image.open(file.file)
    jpeg_image = BytesIO()
    image = image.convert("RGB")
    image.save(jpeg_image, format="JPEG", quality=95, optimize=True)
    jpeg_image.seek(0)
    return jpeg_image

def encode_image_to_base64(file: UploadFile):
    jpeg_image = convert_image_to_jpeg(file)
    content = jpeg_image.read()
    encoded_string = base64.b64encode(content).decode('utf-8')
    return encoded_string

def encode_pdf_to_base64(file: UploadFile):
    jpeg_image = convert_pdf_to_jpeg(file)
    content = jpeg_image.read()
    encoded_string = base64.b64encode(content).decode('utf-8')
    return encoded_string

def encode_file_to_base64(file: UploadFile):
    if is_pdf(file):
        return encode_pdf_to_base64(file)
    else:
        return encode_image_to_base64(file)


# OpenAI API
def call_openai_to_extract_data(key: str, encoded_img: str):
    client = instructor.from_openai(OpenAI(api_key=key))
    response = client.chat.completions.create(
        model='gpt-4o',
        messages=[
            {
                "role": "system",
                "content": """You are a specialized invoice processing AI. You have been trained to extract information from invoices for the profit of Al inside Private S.A.R.L. You will extract information from the given invoice and output the information in json format. Make sure that each information goes to the correct field in the json output.You can handle external and internal invoices. the main difference is that internal invoices contain values " RC N': 50543 l.F:26185261 T.P : 20800463 " on the top left corner of the invoice. when these values are found it is an internal invoice and you are required to return the customer name and ice of the customer. Never return AI-INSIDE PRIVATE SARL as a customer. On external invoices, you are required to return the supplier name and ice of the supplier.
                There are usually two ICE numbers one for the supplier and one for the client which is 002150760000076 is the wrong ice. Find the ICE for supplier or the customer never return the wrong ICE number (002150760000076). when only one is found, it is the wrong one. return 00000 instead. the postal code is usually found within the address of the supplier or the customer."""
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Analyze the given invoice and extract relevant data in the correct format. "
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{encoded_img}",
                            "detail":"high"
                        }
                    }
                ]
            },
        ],
        response_model=Invoice,
    )
    return response

def check_and_call_openai(api_key: str, encoded_img: str):
    if encoded_img is not None:
        return call_openai_to_extract_data(api_key, encoded_img)
    else:
        raise ValueError("Encoded image not provided")


# Debugging logs
def debug_log(debug: bool, case: int, *args):
    if not debug:
        return
    
    if case == 1:
        api_key = args[0]
        print("\nLoaded API key:", api_key, "...\n")
    elif case == 2:
        print("Starting timer...")
        print("Waiting for the Assistant to process...")
    elif case == 3:
        beautified_json = json.loads(args[0])
        print(f"\nJSON response:\n")
        print(json.dumps(beautified_json, indent=2))
    elif case == 4:
        start, end = args
        print(f"\nProcessing time: {end - start} seconds")


# Model response
class ItemDetail(BaseModel):
    code: Optional[str] = Field("", description="Code of the item, name, designation or reference number")
    description: Optional[str] = Field("", description="Description of the item")
    unit_price: Optional[float] = Field(0, description="Unit price of the item")
    quantity: Optional[int] = Field(1, description="Quantity of the item")

class Invoice(BaseModel):
    invoice_number: Optional[str] = Field("", description="Invoice number")
    invoice_date: Optional[date] = Field("", description="Invoice date in yyyy-MM-dd format")
    due_date: Optional[date] = Field("", description="Due date in yyyy-MM-dd format")
    items: List[ItemDetail] = Field(default_factory=list, description="List of items with details including price and quantity")
    total_amount_ht: Optional[float] = Field(None, description="Total amount excluding VAT")
    total_vat_amount: Optional[float] = Field(None, description="Total VAT amount")
    total_amount_ttc: Optional[float] = Field(None, description="Total amount including VAT")
    currency: Literal["EUR", "MAD"] = Field(None, description="Currency of the invoice")
    supplier: Optional[str] = Field("", description="Name of the supplier")
    customer: Optional[str] = Field("", description="Name of the customer")
    ice : Optional[str] = Field("", description="ICE number of the supplier or the customer ")
    postal_code: Optional[str] = Field("", description="Postal code of the supplier or the customer")
