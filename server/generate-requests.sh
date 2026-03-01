#!/bin/bash

# get live routes
ROUTES=$(curl -s http://localhost:3001/_admin/routes | jq -r '.[].path')
METHODS=("GET" "POST" "PUT" "DELETE")

if [ -z "$ROUTES" ]; then
  echo "Error: Could not fetch routes"
  exit 1
fi

# convert to an array
mapfile -t ROUTE_ARRAY <<< "$ROUTES"

for i in {1..50}
do
  RANDOM_ROUTE=${ROUTE_ARRAY[$(( RANDOM % ${#ROUTE_ARRAY[@]} ))]}
  RANDOM_METHOD=${METHODS[$(( RANDOM % ${#METHODS[@]} ))]}
  
  CLEAN_ROUTE=$(echo "$RANDOM_ROUTE" | sed 's/:[a-zA-Z0-9_]*/test-item/g')

  curl -s -X "$RANDOM_METHOD" "http://localhost:3001$CLEAN_ROUTE" > /dev/null
  
  echo "[$i/50] $RANDOM_METHOD $CLEAN_ROUTE"

  sleep 0.1
done
