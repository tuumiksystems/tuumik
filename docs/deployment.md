# Deployment of Tuumik

For most use cases it is recommended to deploy Tuumik via Docker. This repository provides the following examples.

## Deployment via Docker

- [docker-compose-hub](../deploy-examples/docker-compose-hub/) - deploy based on an official image of Tuumik released on Docker Hub
- [docker-compose-synology](../deploy-examples/docker-compose-synology/) - same as above but with minor changes to deploy Tuumik to a Synology NAS
- [docker-compose-build](../deploy-examples/docker-compose-build/) - process to build a custom image of Tuumik from source

## Deployment via [Meteor Up](https://meteor-up.com)

- [mup-demo](../deploy-examples/mup-demo/) - deploy Tuumik to a remote server with demo settings via Meteor Up
- [mup-prod](../deploy-examples/mup-prod/) - deploy Tuumik to a remote server with production settings via Meteor Up

## Local development environment

- [local-demo](../deploy-examples/local-demo/) - start Tuumik in local development environment with demo settings
- [local-prod](../deploy-examples/local-prod/) - start Tuumik in local development environment with production settings

Starting a local development environment is described in more detail [here](./development-environment.md).
