import json
import logging
from typing import Optional, Dict, Any, List
from langchain_openai import ChatOpenAI
from langchain_community.agent_toolkits.openapi import planner
from langchain_community.agent_toolkits.openapi.spec import reduce_openapi_spec
from langchain_community.utilities import RequestsWrapper
from app.api.routes.tools.gpt_utils import load_env
import requests

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChatbotManager:
    def __init__(self):
        self.agent = None
        self.api_key: str = load_env()
        self.chat_history: List[Dict[str, Any]] = []
        self.base_url: str = "http://localhost"  # Update this with your actual base URL
        self.allow_dangerous_requests: bool = True  # Set this to True to allow dangerous requests
        self.access_token: Optional[str] = None
        logger.info("ChatbotManager initialized")

    def get_access_token(self) -> str:
        """Get an access token for authentication."""
        login_url = f"{self.base_url}/api/v1/login/access-token"
        data = {
            "username": "admin@example.com",  # Replace with actual username
            "password": "password"  # Replace with actual password
        }
        try:
            response = requests.post(login_url, data=data)
            response.raise_for_status()
            self.access_token = response.json()["access_token"]
            logger.info("Access token retrieved successfully")
            print(self.access_token)
            return self.access_token
        except requests.RequestException as e:
            logger.error(f"Failed to get access token: {e}")
            raise

    def validate_token(self) -> bool:
        """Validate the current access token."""
        if not self.access_token:
            self.get_access_token()
        test_url = f"{self.base_url}/api/v1/paymentsfromcustomer/?skip=0&limit=1"
        headers = {"Authorization": f"Bearer {self.access_token}"}
        try:
            response = requests.get(test_url, headers=headers)
            if response.status_code == 401:  # Unauthorized
                self.get_access_token()  # Refresh token if unauthorized
                return False
            return True
        except requests.RequestException as e:
            logger.error(f"Failed to validate token: {e}")
            raise

    def fetch_openapi_spec(self) -> dict:
        """Fetch the OpenAPI specification with authentication."""
        self.validate_token()
        headers = {"Authorization": f"Bearer {self.access_token}"}
        try:
            response = requests.get(f"{self.base_url}/api/v1/openapi.json", headers=headers)
            response.raise_for_status()
            spec = response.json()
            logger.info("OpenAPI spec fetched successfully")
            return self.ensure_servers_key(spec)  # Ensure 'servers' key exists
        except requests.RequestException as e:
            logger.error(f"Failed to fetch OpenAPI spec: {e}")
            raise

    def ensure_servers_key(self, api_spec: dict) -> dict:
        """Ensure the 'servers' key exists in the OpenAPI spec."""
        if 'servers' not in api_spec:
            api_spec['servers'] = [
                {
                    "url": self.base_url,
                    "description": "Default server"
                }
            ]
        return api_spec

    def initialize(self):
        if self.agent is not None:
            return

        try:
            # Fetch and ensure the 'servers' key in OpenAPI spec
            raw_api_spec = self.fetch_openapi_spec()
            api_spec = reduce_openapi_spec(raw_api_spec)
            logger.info("OpenAPI spec reduced successfully")

            # Set up authentication
            headers = {"Authorization": f"Bearer {self.access_token}"}
            requests_wrapper = RequestsWrapper(headers=headers)

            # Initialize LLM
            llm = ChatOpenAI(model_name="gpt-4", temperature=0.0)
            logger.info("Language model initialized")

            # Create the agent
            self.agent = planner.create_openapi_agent(
                api_spec,
                requests_wrapper,
                llm,
                allow_dangerous_requests=self.allow_dangerous_requests,
                verbose=True
            )
            logger.info("OpenAPI agent created successfully")

        except Exception as e:
            logger.error(f"Failed to initialize agent: {e}")
            raise

    def process_query(self, query: str) -> str:
        """Process the user query and return the response."""
        try:
            if self.agent is None:
                logger.info("Initializing agent")
                self.initialize()
                if self.agent is None:
                    return "I'm having trouble initializing. Please try again later."

            logger.info(f"Processing query: {query}")
            response = self.agent.invoke(query)
            logger.info("Query processed successfully")

            # Handle the response
            if isinstance(response, dict):
                output = response.get('output', '')
                if isinstance(output, str):
                    result = output
                elif isinstance(output, dict):
                    result = str(output)  # Convert dict to string
                else:
                    result = "Unexpected response format"
            elif isinstance(response, str):
                result = response
            else:
                result = f"Unexpected response type: {type(response)}"

            self.chat_history.append({"role": "human", "content": query})
            self.chat_history.append({"role": "ai", "content": result})
            return result
        except Exception as e:
            logger.error(f"Error processing query: {e}")
            return f"An error occurred while processing your query: {str(e)}"

    def handle_api_response(self, response: requests.Response) -> str:
        """Handle the API response and return a formatted json."""
        try:
            data = response.json()
            if isinstance(data, dict):
                return json.dumps(data, indent=2)
            elif isinstance(data, list):
                return json.dumps(data[:5], indent=2)  # Return first 5 items for brevity
            else:
                return str(data)
        except ValueError:
            return response.text

chatbot_manager = ChatbotManager()

def process_query(query: str) -> str:
    return chatbot_manager.process_query(query)


