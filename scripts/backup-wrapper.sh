#!/bin/bash

# Export environment variables
export PGHOST=db
export PGUSER=$POSTGRES_USER
export PGPASSWORD=$POSTGRES_PASSWORD
export PGDATABASE=$POSTGRES_DB

# Run the backup script
/scripts/backup.sh >> /var/log/cron.log 2>&1