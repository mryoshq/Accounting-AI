#!/bin/bash

set -e

BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"

echo "Starting backup process at $(date)"
echo "Environment variables:"
env | grep PG

echo "Creating backup: $BACKUP_FILE"
if pg_dump -v | gzip > "$BACKUP_FILE"; then
    echo "Backup completed successfully"
    ls -lh "$BACKUP_FILE"
else
    echo "Backup failed"
    exit 1
fi

# Check if the backup file is empty
if [ ! -s "$BACKUP_FILE" ]; then
    echo "Error: Backup file is empty"
    exit 1
fi

# Remove backups older than 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup process finished at $(date)"
echo "Final backup file details:"
ls -lh "$BACKUP_FILE"