#!/bin/bash

set -e

# Hardcoded environment variables
export PGHOST="db"  # Use the service name defined in Docker Compose
export PGPORT="5432"
export PGDATABASE="app"
export PGUSER="postgres"
export PGPASSWORD="password"

echo "Script is running as user: $(whoami)"
echo "Current directory: $(pwd)"
echo "Listing /scripts directory:"
ls -l /scripts

echo "Environment variables:"
echo "PGHOST=${PGHOST}"
echo "PGPORT=${PGPORT}"
echo "PGDATABASE=${PGDATABASE}"
echo "PGUSER=${PGUSER}"
echo "PGPASSWORD=${PGPASSWORD}"

# Create .pgpass file
PGPASSFILE="/root/.pgpass"
echo "${PGHOST}:${PGPORT}:${PGDATABASE}:${PGUSER}:${PGPASSWORD}" > $PGPASSFILE
chmod 600 $PGPASSFILE
export PGPASSFILE

BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"

echo "Starting backup process at $(date)"
echo "Creating backup: $BACKUP_FILE"

# Run pg_dump with detailed debugging
echo "Running pg_dump command:"
echo "pg_dump -h ${PGHOST} -U ${PGUSER} -d ${PGDATABASE} -v"

if pg_dump -h "${PGHOST}" -U "${PGUSER}" -d "${PGDATABASE}" -v | gzip > "$BACKUP_FILE"; then
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
