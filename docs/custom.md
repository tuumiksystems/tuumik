# Create and deploy custom Docker images

These instructions show how to create Docker images of your customized versions of Tuumik or Tuumik Export and then deploy these into production.

It is assumed that you have Docker installed in your development environment.

## Tuumik

**1. Build Docker image**

In your development environment inside the directory root where you have your customized Tuumik project (for example /tuumik/app/) run the following command:

```shell
docker build -t my-tuumik-app:1.0.0 .
```

**2. Save the image to an archive file**

```shell
docker save my-tuumik-app:1.0.0 -o tuumik-app.tar
```

**3. Transfer the archive file to server**

```shell
scp tuumik-app.tar user@server:/path/
```

**4. Load the image into Docker on server**

```shell
docker load -i tuumik-app.tar
```

**5. Modify compose.yml file to use image**

In your compose.yml file inside the "app" block on the server change the following line:

```yaml
image: tuumik/tuumik:1.0.13
```

to this:

```yaml
image: my-tuumik-app:1.0.0
```

## Tuumik Export

**1. Build Docker image**

In your development environment inside the directory root where you have your customized Tuumik Export project (for example /tuumik/export/) run the following command:

```shell
docker build -t my-tuumik-export:1.0.0 .
```

**2. Save the image to an archive file**

```shell
docker save my-tuumik-export:1.0.0 -o tuumik-export.tar
```

**3. Transfer the archive file to server**

```shell
scp tuumik-export.tar user@server:/path/
```

**4. Load the image into Docker on server**

```shell
docker load -i tuumik-export.tar
```

**5. Modify compose.yml file to use image**

In your compose.yml file inside the "export" block on the server change the following line:

```yaml
image: tuumik/tuumik-export:1.0.0
```

to this:

```yaml
image: my-tuumik-export:1.0.0
```
