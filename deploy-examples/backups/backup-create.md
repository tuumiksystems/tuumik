# Create automatic backups with cron and mongodump

**1. Create directory for backups:**

```shell
mkdir tuumik-backups
```

If on the server your user name is tmk and you run this command in your home directory, then the full path of the tuumik-backups directory on Ubuntu will be /home/tmk/tuumik-backups. If your user name or target directory is different, adjust the command below in step 3 accordingly.

**2. Open the crontab editor:**

```shell
crontab -e
```

**3. Add cron task:**

```shell
0 3 * * * docker exec tuumik-mongo-1 mongodump --archive --gzip > /home/tmk/tuumik-backups/tuumik-backup-$(date +\%s-\%Y\%m\%d).archive.gz && find /home/tmk/tuumik-backups -name "*.archive.gz" -mtime +30 -delete
```

## Notes

- Verify the container name for your mongo service with: `docker ps`
- Test manually before relying on cron: run the `docker exec` part without the cron prefix
