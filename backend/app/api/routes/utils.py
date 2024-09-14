# app/api/routeS/utils.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic.networks import EmailStr
from pydantic import BaseModel

from app.api.deps import get_current_active_superuser, get_current_user
from app.models import Message, User
from app.utils import generate_test_email, send_email
from app.api.routes.tools.gpt_chatbot_planner import process_query as process_query_planner
from app.api.routes.tools.gpt_chatbot_chat import process_query as process_query_chat

router = APIRouter()

class ChatbotQuery(BaseModel):
    query: str

@router.post(
    "/test-email/",
    dependencies=[Depends(get_current_active_superuser)],
    status_code=201,
)
def test_email(email_to: EmailStr) -> Message:
    """
    Test emails.
    """
    email_data = generate_test_email(email_to=email_to)
    send_email(
        email_to=email_to,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )
    return Message(message="Test email sent")

@router.post("/chatbot_planner")
def chatbot_planner(query: ChatbotQuery, current_user: User = Depends(get_current_user)):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Only superusers can use the chatbot planner")
    response = process_query_planner(query.query, current_user.id)
    return {"response": response}

@router.post("/chatbot_chat")
def chatbot_chat(query: ChatbotQuery, current_user: User = Depends(get_current_active_superuser)):
    if not current_user.api_token_enabled:
        raise HTTPException(status_code=403, detail="User does not have an active API token")
    response = process_query_chat(query.query, current_user.id)
    return {"response": response}