## Use this Dockerfile to export your actions to a standalone image
## for deployment on your favorite environment.

FROM rasa/rasa-sdk:latest

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY actions.py /app/exported_actions/actions.py
CMD ["start", "--actions", "exported_actions.actions"]
