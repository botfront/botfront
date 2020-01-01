######################################################################
#  This Dockerfile is used build your Rasa image                     #
######################################################################

# RASA_IMAGE is passed from docker-compose.yml
ARG RASA_IMAGE
FROM ${RASA_IMAGE}

COPY . /custom/extensions/.

RUN pip install --no-cache-dir -r /custom/extensions/requirements.txt
RUN pip install -e /custom/extensions/.
