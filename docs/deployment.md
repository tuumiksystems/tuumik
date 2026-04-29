# Deployment of Tuumik

For most use cases it is recommended to deploy Tuumik via Docker. This repository provides the following examples.

## Deployment via Docker

- [docker-ubuntu-public](../deploy-examples/docker-ubuntu-public/) - deploy Tuumik on Ubuntu VM, served publicly, TLS via HTTP-01 challenge
- [docker-ubuntu-public-dns](../deploy-examples/docker-ubuntu-public-dns/) - deploy Tuumik on Ubuntu VM, served publicly, TLS via DNS-01 challenge
- [docker-ubuntu-tailscale-dns](../deploy-examples/docker-ubuntu-tailscale-dns/) - deploy Tuumik on Ubuntu VM, served privately via Tailscale VPN, TLS via DNS-01 challenge
- [docker-local](../deploy-examples/docker-local/) - run Tuumik on localhost for testing

## Create and deploy custom versions

The above Docker examples use prebuilt Tuumik and Tuumik Export images that are published on Docker Hub. If you have customized your own version of Tuumik and/or Tuumik Export, then read [these instructions](./custom.md) on how to create Docker images from the modified source code and deploy these to production.

## Automatic backups

- [backup-create](../deploy-examples/backups/backup-create.md) - create a cron job for automatic regular backups
- [backup-restore](../deploy-examples/backups/backup-restore.md) - restore data from a backup file

## Local development environment

- [local-demo](../deploy-examples/local-demo/) - start Tuumik in local development environment with demo settings
- [local-prod](../deploy-examples/local-prod/) - start Tuumik in local development environment with production settings

Setting up a local development environment is described in more detail [here](./development.md).
