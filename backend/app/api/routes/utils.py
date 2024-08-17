from fastapi import APIRouter, Depends
from pydantic.networks import EmailStr

from app.api.deps import get_current_active_superuser
from app.models import Message, ChatbotQuery
from app.utils import generate_test_email, send_email

router = APIRouter()

# -------------------------- 

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

# -------------------------- 

from app.api.routes.tools.gpt_chatbot_planner import process_query as process_query_planner

@router.post("/chatbot_planner")
def chatbot_planner(query: ChatbotQuery):
    response = process_query_planner(query.query)
    return {"response": response}

# ---

from app.api.routes.tools.gpt_chatbot_chat import process_query as process_query_chat

@router.post("/chatbot_chat")
def chatbot_chat(query: ChatbotQuery):
    response = process_query_chat(query.query)
    return {"response": response}