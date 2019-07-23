rm -rf botfront-db
# docker build -t botfront/botfront:latest ../.

docker-compose up -d --remove-orphans

sleep 10

docker run -it --rm \
  -v `pwd`/../botfront:/botfront \
  --network="ci_botfront-network" \
  -w /botfront \
  -e CYPRESS_VIDEO=true \
  -e CYPRESS_RETRIES=3 \
  -e CYPRESS_MODE="CI_RUN" \
  -e CYPRESS_baseUrl="http://botfront:3000" \
  --entrypoint cypress \
  botfront/cypress-retries:3.4.0 run
  
docker-compose down