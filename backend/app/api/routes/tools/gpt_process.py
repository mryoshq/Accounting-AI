import json
import timeit
from typing import List
from fastapi import UploadFile

from app.api.routes.tools.gpt_utils import load_env, encode_file_to_base64, check_and_call_openai, debug_log

def process_invoice(file: UploadFile, debug: bool = False):
    api_key = load_env()
    debug_log(debug, 1, api_key)
    
    start = timeit.default_timer()
    debug_log(debug, 2)
    
    encoded_img = encode_file_to_base64(file)
    
    extracted_data = check_and_call_openai(api_key, encoded_img)
    
    response_data_json = extracted_data.json()
    end = timeit.default_timer()
    
    debug_log(debug, 3, response_data_json)
    debug_log(debug, 4, start, end)
    
    return {
        "invoice_data": json.loads(response_data_json),
        "document_image": encoded_img
    }

def pipeline(files: List[UploadFile], debug: bool = False):
    results = []
    for file in files:
        result = process_invoice(file, debug)
        results.append(result)
    return results