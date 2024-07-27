FROM tiangolo/uvicorn-gunicorn-fastapi:python3.10

WORKDIR /app/

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | POETRY_HOME=/opt/poetry python && \
    ln -s /opt/poetry/bin/poetry /usr/local/bin/poetry && \
    poetry config virtualenvs.create false

# Copy poetry.lock* in case it doesn't exist in the repo
COPY ./pyproject.toml ./poetry.lock* /app/


# Install dependencies
# This layer will be cached as long as pyproject.toml and poetry.lock* do not change

# Allow installing dev dependencies to run tests
ARG INSTALL_DEV=false

RUN if [ "$INSTALL_DEV" = "true" ]; then \
        poetry install --no-root; \
    else \
        poetry install --no-root --only main; \
    fi


# Set environment variable
ENV PYTHONPATH=/app

# Copy scripts and other necessary files
COPY scripts/ /app/scripts/
COPY alembic.ini prestart.sh tests-start.sh /app/

# Copy the main application
COPY app /app/app
