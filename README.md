# PSYKHE-WEB

## Development Quickstart

Note: the use of a docker environment conflicts with many other development servers. You will likely need to terminate any existing Web, Database, and Cache serverse which are running on your local machine. Especially on OSX, failure to do so can cause the docker environment to silently fail to bind to the network.

1. Create the following directory structure:

        psykhe-spa
        |-- psykhe-web
        |   |- (ie, https://github.com/psykhe-fashion/psykhe-web)
        |
        |-- psykhe-web-api
        |   |- (ie, https://github.com/psykhe-fashion/psykhe-web-api)

2. Create a `docker-compose.override.yml` file based on the `docker-compose.override.example.yml` file in psykhe-web, to be placed alongside the `docker-compose.yml` file in psykhe-web.

3. Run `docker-compose up -d` within psykhe-web and wait for the environments to come up.

4. Run `docker-compose exec web-api composer db:reset` to initialise the local database

The test server should now be available at `http://localhost`

## Build/Deploy

The build and deploy pipelines are defined in the [`aws-infrastructure` repository](https://github.com/psykhe-fashion/aws-infrastructure)
