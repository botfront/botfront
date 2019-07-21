rm -rf botfront-db
docker-compose up -d
docker run -it --rm \
  -v `pwd`/../botfront:/botfront \
  --network="ci_botfront-network" \
  -w /botfront \
  -e CYPRESS_VIDEO=true \
  -e CYPRESS_MODE="CI_RUN" \
  -e CYPRESS_baseUrl="http://host.docker.internal:8888" \
  --entrypoint cypress \
  cypress/included:3.4.0 run
  
docker-compose down