######################################################################
#  This Dockerfile is used build your Rasa image                     #
######################################################################

# Botfront requires this image. Botfront won't work with Rasa vanilla images.
FROM botfront/rasa-for-botfront:v1.3.9-bf.4

COPY . /custom/extensions/.

RUN pip install --no-cache-dir -r /custom/extensions/requirements.txt
RUN pip install -e /custom/extensions/.