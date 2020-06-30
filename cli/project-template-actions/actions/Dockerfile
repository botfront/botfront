######################################################################
#  This Dockerfile is used for local development                     #
######################################################################

# RASA_SDK_IMAGE is passed from docker-compose.yml
ARG RASA_SDK_IMAGE
FROM ${RASA_SDK_IMAGE}

# Change back to root user to install dependencies
USER root

COPY requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

# Switch back to non-root to run code
USER 1001
