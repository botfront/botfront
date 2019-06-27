######################################################################
#  Use this Dockerfile to build a standalone image with your actions #
######################################################################

FROM rasa/rasa-sdk:latest

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/exported_actions/
CMD ["start", "--actions", "exported_actions"]
