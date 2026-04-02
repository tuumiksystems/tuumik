# Host Tuumik using Docker - Ubuntu VM, public access, HTTP-01 challenge

These instructions show how to host Tuumik using Docker on a Linux (Ubuntu) VM. With this setup Tuumik will be publicly accessible on your domain name over HTTPS. TLS will be handled by Caddy via HTTP-01 challenge. This is the recommended configuration for Tuumik due to its simplicity.

**1. Select server and install Docker**

It is recommended to use the latest LTS release of Ubuntu. Tuumik with default configuration requires a server with at least 1 GB of memory. The server needs to have Docker and Docker Compose installed.

**2. Select domain name and create A record for it**

Create an A record for your domain name that points to your server's IP address.

**3. Update domain name in Caddyfile and compose.yml**

In Caddyfile and compose.yml (ROOT_URL) replace tuumik.example.com with your actual domain name.

**4. Create project directory on server and copy files to it**

```shell
mkdir tuumik
cd tuumik
```

Copy compose-init.yml, compose.yml and Caddyfile to your project directory on the server.

**5. Start compose-init.yml and wait 60 seconds**

```shell
docker compose -f compose-init.yml up -d
```

Once the service has been started wait for 60 seconds. This will set up the mongo service. The service in compose-init.yml only needs to be run once during setup to initalize Mongo's replica set configuration. After this all services will run from compose.yml.

**6. Stop compose-init.yml**

```shell
docker compose -f compose-init.yml down
```

**7. Start compose.yml**

```shell
docker compose up -d
```

**8. Open your domain name in browser**

You should see Tuumik's login page.

**9. Set up backups**

If this is a production environment it is very important to set up proper backups for your server.
