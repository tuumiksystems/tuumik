# Build a custom Docker image of Tuumik

For most use cases it is recommended to deploy Tuumik based on an official image of it released on Docker Hub using the [compose.yml file provided here](../docker-compose-hub/). The process described below is only necessary if you require changes in the source code that are not present in an official release.

**1. Create a directory called tuumik**

```shell
mkdir tuumik
```

**2. Download a release of Tuumik**

You can download the latest release of Tuumik from https://github.com/tuumiksystems/tuumik/releases

**3. Extract the release to tuumik/app**

**4. Copy Dockerfile and compose.yml from tuumik/app/deploy-examples/docker-compose-build to /tuumik**

**5. Run docker compose build**

```shell
docker compose build
```

Notice that you do not need to run npm install in tuumik/app before building. Dependencies are installed automatically in the build process.

**6. Run docker compose up**

```shell
docker compose up
```

**7. Open http://localhost:3000 in browser**

You should see Tuumik's login page.

**8. Database directory**

Once you run Tuumik, a tuumik/tuumikdb directory will be created automatically. This is where all database data will be stored. To clear the database, first stop the Docker services and then delete this directory.

```shell
sudo rm -rf tuumikdb/
```
