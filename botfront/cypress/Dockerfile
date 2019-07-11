## This Dockerfile builds the ci-runner image, used to run Cypress tests

FROM cypress/included:3.4.0

RUN apt-get update
RUN apt-get install -y apt-transport-https software-properties-common
RUN add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian stretch stable"
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add -
RUN apt-get update
RUN apt-get install -y docker-ce
RUN curl -L https://github.com/docker/compose/releases/download/1.22.0/docker-compose-`uname -s`-`uname -m`\
     -o /usr/local/bin/docker-compose
RUN chmod +x /usr/local/bin/docker-compose
RUN curl https://install.meteor.com/ | sh

ENV METEOR_ALLOW_SUPERUSER 1
ENV CYPRESS_MODE CI_RUN
ENV CYPRESS_VIDEO false
ENTRYPOINT ["echo", "Please run with a custom entrypoint"]
