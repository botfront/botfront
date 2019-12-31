######################################################################
#  This Dockerfile is used for local development                     #
######################################################################

# RASA_SDK_IMAGE is passed from docker-compose.yml
ARG RASA_SDK_IMAGE
FROM ${RASA_SDK_IMAGE}

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

