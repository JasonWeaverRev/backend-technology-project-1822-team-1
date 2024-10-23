#!bin/bash
echo "Stopping application" >> /tmp/deployment.log
pgrep -l -f "node src/server.js" | cut -d ' ' -f 1 | xargs sudo kill
