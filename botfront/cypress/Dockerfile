## This Dockerfile builds the ci-runner image, used to run Cypress tests

FROM docker:stable

RUN apk add iptables
RUN wget https://github.com/docker/compose/releases/download/1.22.0/docker-compose-`uname -s`-`uname -m`\
     -O /usr/local/bin/docker-compose
RUN chmod +x /usr/local/bin/docker-compose
RUN apk add --update nodejs nodejs-npm

#RUN nohup sh -c 'dockerd &' && sleep 4
#RUN docker pull ...

ENTRYPOINT ["echo", "Please run with a custom entrypoint"]