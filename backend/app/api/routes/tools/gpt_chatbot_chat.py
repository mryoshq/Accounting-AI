# app/api/routes/tools/gpt_chatbot_chat.py
import json, re
import logging
from typing import Optional, Dict, Any, List
import requests
from pydantic import BaseModel, Field, create_model

from app.api.routes.tools.gpt_utils import load_env

from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, OpenAIFunctionsAgent
from langchain.memory import ConversationBufferMemory
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder, HumanMessagePromptTemplate
from langchain.schema import SystemMessage
from langchain.tools import StructuredTool

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class ChatbotManager:
    def __init__(self, user_id: int, access_token: str):
        self.agent_executor = None
        self.user_id = user_id
        self.api_key: str = load_env(user_id)
        logger.debug(f"API key loaded for user {user_id}")
        self.base_url: str = "http://localhost" 
        self.access_token: str = access_token 
        self.memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
        logger.info(f"ChatbotManager initialized for user {user_id}")

    def validate_token(self) -> bool:
        """Validate the current access token."""
        test_url = f"{self.base_url}/api/v1/paymentsfromcustomer/?skip=0&limit=1"
        headers = {"Authorization": f"Bearer {self.access_token}"}
        try:
            response = requests.get(test_url, headers=headers)
            return response.status_code != 401
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
            return self.ensure_servers_key(spec)
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

    def create_api_tool(self, path: str, operation: Dict[str, Any], method: str) -> Optional[Dict[str, Any]]:
        """Create a function definition for a specific API operation."""
        if method.lower() != 'get':
            return None  # Skip non-GET operations

        operation_id = operation.get('operationId', f"{method}_{path}")
        summary = operation.get('summary', '')
        description = operation.get('description', '')
        
        parameters = operation.get('parameters', [])
        
        fields = {}
        for param in parameters:
            param_name = param['name']
            param_type = param.get('schema', {}).get('type', 'string')
            param_description = param.get('description', '')
            required = param.get('required', False)

            field_type = str
            if param_type == 'integer':
                field_type = int
            elif param_type == 'number':
                field_type = float
            elif param_type == 'boolean':
                field_type = bool

            fields[param_name] = (field_type, Field(description=param_description, default=... if required else None))

        ArgsSchema = create_model(f"{operation_id}ArgsSchema", **fields)

        def api_func(**kwargs) -> str:
            self.validate_token()
            url = f"{self.base_url}{path}"
            headers = {"Authorization": f"Bearer {self.access_token}"}
            query_params = {}

            logger.info(f"API call to GET {url}")
            logger.info(f"Input parameters: {kwargs}")

            for key, value in kwargs.items():
                if value is not None:
                    if f"{{{key}}}" in url:
                        url = url.replace(f"{{{key}}}", str(value))
                        logger.info(f"Replaced path parameter {key} with {value}")
                    else:
                        query_params[key] = value

            logger.info(f"Processed URL: {url}")
            logger.info(f"Query params: {query_params}")

            try:
                response = requests.get(url, headers=headers, params=query_params)
                response.raise_for_status()
                logger.info(f"API call successful. Status code: {response.status_code}")
                logger.info(f"Response content: {response.text[:1000]}...")  # Log first 1000 characters of response
                return json.dumps(response.json(), indent=2)
            except requests.RequestException as e:
                logger.error(f"API call failed: {e}")
                logger.error(f"Response status code: {e.response.status_code if hasattr(e, 'response') else 'No status code'}")
                logger.error(f"Response content: {e.response.content if hasattr(e, 'response') else 'No response content'}")
                return f"API call failed: {str(e)}"

        return {
            "function": {
                "name": operation_id,
                "description": f"{summary}\n{description}\nEndpoint: GET {path}",
                "parameters": ArgsSchema.schema()
            },
            "callable": api_func,
            "args_schema": ArgsSchema
        }

    def initialize(self):
        """Initialize the chatbot agent with API tools and conversation abilities."""
        if self.agent_executor is not None:
            return

        try:
            raw_api_spec = self.fetch_openapi_spec()
            logger.info("OpenAPI spec fetched successfully")

            tools = []
            for path, path_item in raw_api_spec['paths'].items():
                for method, operation in path_item.items():
                    tool = self.create_api_tool(path, operation, method)
                    if tool:
                        tools.append(StructuredTool.from_function(
                            func=tool["callable"],
                            name=tool["function"]["name"],
                            description=tool["function"]["description"],
                            args_schema=tool["args_schema"]
                        ))
                        logger.info(f"Created tool: {tool['function']['name']}")

            llm = ChatOpenAI(api_key=self.api_key, model_name="gpt-4", temperature=0.0)
            logger.info("Language model initialized")

            prompt = ChatPromptTemplate.from_messages([
                SystemMessage(content="""You are a helpful AI assistant that can interact with an API. 
                Use the provided tools to respond to the user's request. 
                When dealing with specific suppliers or invoices, make sure to use the correct supplier ID.
                For example, if asked about 'PRO-ASSID', you should first use the suppliers-read_suppliers tool to find its ID,
                and then use that ID in subsequent API calls."""),
                MessagesPlaceholder(variable_name="chat_history"),
                HumanMessagePromptTemplate.from_template("{input}"),
                MessagesPlaceholder(variable_name="agent_scratchpad"),
            ])

            agent = OpenAIFunctionsAgent(llm=llm, tools=tools, prompt=prompt)

            self.agent_executor = AgentExecutor.from_agent_and_tools(
                agent=agent,
                tools=tools,
                memory=self.memory,
                verbose=True,
                handle_parsing_errors=True
            )

            logger.info("Agent executor created successfully with API tools and memory")

        except Exception as e:
            logger.error(f"Failed to initialize agent: {e}")
            raise

    def format_supplier_list(self, text: str) -> str:
        """Format the supplier list with bullet points and line breaks."""
        # Split the text into individual supplier entries
        suppliers = re.split(r'\d+\.', text)[1:]  # Skip the first empty element
        
        formatted_suppliers = []
        for supplier in suppliers:
            # Clean up each supplier entry
            supplier = supplier.strip()
            # Replace commas with line breaks and add a bullet point
            formatted_supplier = "• " + supplier.replace(", ", "\n  ")
            formatted_suppliers.append(formatted_supplier)
        
        # Join the formatted supplier entries with double line breaks
        return "\n\n".join(formatted_suppliers)

    def process_query(self, query: str) -> str:
        """Process the user query and return the response."""
        try:
            if self.agent_executor is None:
                logger.info("Initializing agent")
                self.initialize()
                if self.agent_executor is None:
                    return "Agent is not initialized properly. I'm having trouble initializing. Please try again later."

            logger.info(f"Processing query: {query}")

            response = self.agent_executor.invoke({"input": query})
            logger.info("Query processed successfully")
            logger.info(f"Agent response: {response}")

            output = response['output']
            
            # Check if the output contains a list of suppliers
            if "Here are the suppliers:" in output:
                suppliers_list = output.split("Here are the suppliers:")[1].strip()
                formatted_suppliers = self.format_supplier_list(suppliers_list)
                output = f"Here are the suppliers:\n\n{formatted_suppliers}"

            return output

        except Exception as e:
            logger.error(f"Error processing query: {e}")
            return f"An error occurred while processing your query: {str(e)}"

# Initialize the chatbot manager
chatbot_manager = None

def get_chatbot_manager(user_id: int, access_token: str) -> ChatbotManager:
    global chatbot_manager
    if chatbot_manager is None or chatbot_manager.user_id != user_id:
        chatbot_manager = ChatbotManager(user_id, access_token)
    return chatbot_manager

def process_query(query: str, user_id: int, access_token: str) -> str:
    manager = get_chatbot_manager(user_id, access_token)
    return manager.process_query(query)
