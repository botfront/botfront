# A docker image with the 'cypress-plugin-retries' added

FROM cypress/browsers:node12.6.0-chrome75

# avoid too many progress messages
# https://github.com/cypress-io/cypress/issues/1243
ENV CI=1
ARG CYPRESS_VERSION="3.4.0"

RUN echo "whoami: $(whoami)"
RUN npm config -g set user $(whoami)
RUN npm install -g "cypress@${CYPRESS_VERSION}"
RUN npm install -g cypress-plugin-retries
RUN npm link cypress-plugin-retries
RUN cypress verify
# Cypress cache and installed version
RUN cypress cache path
RUN cypress cache list
RUN mkdir /app
COPY  wait-for-it.sh /app/
RUN chmod +x /app/wait-for-it.sh 
RUN echo  " node version:    $(node -v) \n" \
  "npm version:     $(npm -v) \n" \
  "yarn version:    $(yarn -v) \n" \    
  "debian version:  $(cat /etc/debian_version) \n" \
  "user:            $(whoami) \n"

ENTRYPOINT ["/bin/bash"]
CMD ["-c", "/app/wait-for-it.sh $BOTFRONT_HOST -s -t 90 -- cypress run"]