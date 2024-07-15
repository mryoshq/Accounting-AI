import random
import string

from fastapi.testclient import TestClient

from app.core.config import settings



def random_float():
    return round(random.uniform(1, 1000), 2)

def random_int():
    return random.randint(1, 1000)

def random_lower_string() -> str:
    return "".join(random.choices(string.ascii_lowercase, k=32))


def random_email() -> str:
    return f"{random_lower_string()}@{random_lower_string()}.com"


def get_superuser_token_headers(client: TestClient) -> dict[str, str]:
    login_data = {
        "username": settings.FIRST_SUPERUSER,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    
    print("Login Data:",login_data)
    r = client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    print("Login Response:", r.json())  # Log the response to check what is returned
    tokens = r.json()
    try:
        a_token = tokens["access_token"]
        return {"Authorization": f"Bearer {a_token}"}
    except KeyError:
        print("Failed to obtain access token:", r.json())
        raise
