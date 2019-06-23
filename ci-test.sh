
ROOT=~/git/mrbot-projects/botfront-ce

# cd $ROOT/botfront/cli
# npm link
# cd $ROOT
# botfront init --ci --path ultimate_test

docker run -it --rm \
  -v $ROOT/botfront:/botfront \
  -w /botfront \
  --network="ultimate_test_botfront-network" \
  -e CYPRESS_VIDEO=true \
  -e CYPRESS_MODE="CI_RUN" \
  -e CYPRESS_baseUrl="http://botfront-app:3000" \
  --entrypoint cypress \
  cypress/included:3.2.0 run