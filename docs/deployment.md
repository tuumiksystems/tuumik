# Deployment of Tuumik

For most use cases it is recommended to deploy Tuumik via Docker. This repository provides the following examples.

## Deployment via Docker

- [docker-ubuntu-public](../deploy-examples/docker-ubuntu-public/) - deploy Tuumik on Ubuntu VM, served publicly, TLS via HTTP-01 challenge (recommended setup)
- [docker-ubuntu-public-dns](../deploy-examples/docker-ubuntu-public-dns/) - deploy Tuumik on Ubuntu VM, served publicly, TLS via DNS-01 challenge
- [docker-ubuntu-tailscale-dns](../deploy-examples/docker-ubuntu-tailscale-dns/) - deploy Tuumik on Ubuntu VM, served privately via Tailscale VPN, TLS via DNS-01 challenge
- [docker-build](../deploy-examples/docker-build/) - process to build a custom image of Tuumik from source

## Deployment via [Meteor Up](https://meteor-up.com)

- [mup-demo](../deploy-examples/mup-demo/) - deploy Tuumik to a remote server with demo settings via Meteor Up
- [mup-prod](../deploy-examples/mup-prod/) - deploy Tuumik to a remote server with production settings via Meteor Up

## Local development environment

- [local-demo](../deploy-examples/local-demo/) - start Tuumik in local development environment with demo settings
- [local-prod](../deploy-examples/local-prod/) - start Tuumik in local development environment with production settings

Starting a local development environment is described in more detail [here](./development-environment.md).
