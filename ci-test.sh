
ROOT=~/git/mrbot-projects/botfront-ce
# cd $ROOT
# rm -rf ultimate_test

# cd $ROOT/cli
# npm link
# cd $ROOT
# botfront init --ci --path ultimate_test

docker run -it --rm \
  -v $ROOT/botfront:/botfront \
  -w /botfront \
  # --network="ultimate_test_botfront-network" \
  -e CYPRESS_RETRIES=2 \
  -e CYPRESS_VIDEO=true \
  -e CYPRESS_MODE="CI_RUN" \
  -e CYPRESS_baseUrl="http://host.docker.internal:8888" \
  --entrypoint cypress \
  cypress/included:3.4.0 run