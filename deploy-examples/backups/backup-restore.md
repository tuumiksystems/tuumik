# Restore data from backup in running Tuumik deployment

Before restoring data make sure you have Tuumik correctly set up and running with "docker compose up -d" and you are in the directory containing your compose.yml file on the server.

The instructions assume that the backup file that you want to restore from is in /home/tmk/tuumik-backups on the server.

## Steps

**1. Stop the app service (keep the mongo service running):**

```shell
docker compose stop app
```

**2. Restore from backup file:**

```shell
docker exec -i tuumik-mongo-1 mongorestore --archive --gzip --drop < /home/tmk/tuumik-backups/tuumik-backup-TIMESTAMP-YYYYMMDD.archive.gz
```

Use the name of your actual backup file in the command. It should be something like `tuumik-backup-1775587398-20260407.archive.gz`.

The `--drop` flag drops existing collections before restoring to avoid duplicate data.

**3. Start the app again:**

```shell
docker compose start app
```

## Notes

- List available backups: `ls -lh /home/tmk/tuumik-backups/`
- The restore command must be run from the directory containing `compose.yml`
- Verify the container name with: `docker ps`
