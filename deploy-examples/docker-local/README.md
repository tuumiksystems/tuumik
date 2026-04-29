# Run Tuumik and Tuumik Export locally using Docker

These instructions show how to run Tuumik and Tuumik Export locally using Docker. With this setup Tuumik will be accessible only on localhost.

This is meant mainly for testing. If you want to customize Tuumik or Tuumik Export, then it is recommended to set up a local development environment as [described here](../../docs/development.md).

**1. Install Docker**

Your machine needs to have Docker and Docker Compose installed.

**2. Create project directory and copy files to it**

```shell
mkdir tuumik
cd tuumik
```

Copy compose-init.yml and compose.yml to your project directory.

**3. Start compose-init.yml and wait 60 seconds**

```shell
docker compose -f compose-init.yml up -d
```

Once the service has been started wait for 60 seconds. This will set up the mongo service. The service in compose-init.yml only needs to be run once during setup to initalize Mongo's replica set configuration. After this all services will run from compose.yml.

**4. Stop compose-init.yml**

```shell
docker compose -f compose-init.yml down
```

**5. Start compose.yml**

```shell
docker compose up -d
```

**6. Open http://localhost:3000 in browser**

You should see Tuumik's login page.
