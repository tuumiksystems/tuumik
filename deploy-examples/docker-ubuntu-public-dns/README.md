# Host Tuumik using Docker - Ubuntu VM, public access, DNS-01 challenge

These instructions show how to host Tuumik using Docker on a Linux (Ubuntu) VM. With this setup Tuumik will be publicly accessible on your domain name over HTTPS. TLS will be handled by Traefik via DNS-01 challenge and a domain registered at Cloudflare. This setup serves as a template for situations where DNS-01 challenge is needed instead of HTTP-01.

**1. Select server and install Docker**

It is recommended to use the latest LTS release of Ubuntu. Tuumik with default configuration requires a server with at least 1 GB of memory. The server needs to have Docker and Docker Compose installed.

**2. Register domain name with Cloudflare**

Register a domain name at cloudflare.com. This example uses Cloudflare since Traefik has built-in support for it via lego.

Instead of Cloudflare you can also use any other registrar that Traefik supports for DNS-01 challenges (AWS, Azure, Google, DigitalOcean etc). In this case you would need to update the "dnschallenge.provider" data in compose.yml and relevant API key in compose.yml and .env.

**3. Create A record for the domain name**

Create an A record for your domain name that points to your server's public IP address.

**4. Create API key at Cloudflare**

In the Cloudflare admin console create a CF_DNS_API_TOKEN. This is needed for Traefik to be able to create temporary TXT records for DNS challenges.

**5. Update compose.yml and .env files**

In compose.yml update both references to "tuumik.example.com" with your actual domain name. Notice that "ROOT_URL" starts with https:// while "traefik.http.routers.app.rule" does not.

In compose.yml update "certificatesresolvers.letsencrypt.acme.email=admin@exampledomain.com" to your actual email address. Using an email address that is clearly just a placeholder such as admin@example.com can cause DNS challenge to fail.

Copy .env.example to .env and add your CF_DNS_API_TOKEN to it.

**6. Create project directory on server and copy files to it**

```shell
mkdir tuumik
cd tuumik
```

Copy compose-init.yml, compose.yml and .env to your project directory on the server.

**7. Start compose-init.yml and wait 60 seconds**

```shell
docker compose -f compose-init.yml up -d
```

Once the service has been started wait for 60 seconds. This will set up the mongo service. The service in compose-init.yml only needs to be run once during setup to initalize Mongo's replica set configuration. After this all services will run from compose.yml.

**8. Stop compose-init.yml**

```shell
docker compose -f compose-init.yml down
```

**9. Start compose.yml**

```shell
docker compose up -d
```

**10. Open your domain name in browser**

You should see Tuumik's login page.

**11. Set up backups**

If this is a production environment it is very important to set up proper backups for your server.
