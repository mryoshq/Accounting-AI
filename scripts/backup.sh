#!/bin/bash

set -e

# Path to the .env file
ENV_FILE="/scripts/.env"

# Check if the .env file exists
if [ -f $ENV_FILE ]; then
    # Export variables from the .env file
    set -o allexport
    source $ENV_FILE
    set +o allexport
else
    echo "Error: .env file not found at $ENV_FILE"
    exit 1
fi

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
