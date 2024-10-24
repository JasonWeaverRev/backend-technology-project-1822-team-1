#!bin/bash
echo "Stopping application" >> /tmp/deployment.log


# Find the PID of the node process running the server
PID=$(pgrep -f "node src/server.js")

# Check if a PID was found
if [ -z "$PID" ]; then
    # No process found, log it
    echo "No process found for node src/server.js" >> /tmp/deployment.log
else
    # Process found, attempt to kill it
    echo "Found process with PID: $PID. Stopping it..." >> /tmp/deployment.log
    sudo kill $PID

    # Check if the kill command was successful
    if [ $? -eq 0 ]; then
        echo "Successfully stopped process with PID: $PID" >> /tmp/deployment.log
    else
        echo "Failed to stop process with PID: $PID" >> /tmp/deployment.log
    fi
fi
