#!bin/bash
pgrep -l -f "node src/server.js" | cut -d ' ' -f 1 | xargs sudo kill