######################################################################
#  This Dockerfile is used build your Rasa image                     #
######################################################################

# RASA_IMAGE is passed from docker-compose.yml which is generated
# from ./botfront/docker-compose-template.yml and ./botfront/botfront.yml

ARG RASA_IMAGE
FROM ${RASA_IMAGE}

# Change back to root user to install dependencies
USER root

COPY . /custom/extensions/.

RUN pip install --no-cache-dir -r /custom/extensions/requirements.txt
RUN pip install -e /custom/extensions/.

# Switch back to non-root to run code
USER 1001