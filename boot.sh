#!/bin/bash

#set -ew
export ANDROID_HOME=~/Android/Sdk
export PATH=~/Android/Sdk/platform-tools:${PATH}

# Split the ADB_ENDPOINTS variable into an array
IFS=',' read -r -a endpoints <<< "$ADB_ENDPOINTS"

for endpoint in "${endpoints[@]}"; do
    adb connect "$endpoint"
    attempts=10
    until adb shell ls; do
        ((attempts--))
        if ((attempts == 0)); then
            echo "Failed to connect to $endpoint. Trying next endpoint."
            break
        fi
    done

    # If we successfully connected, exit the loop
    if ((attempts > 0)); then
        echo "Successfully connected to $endpoint"
        connected=true
        break
    fi
done

if [ -z "$connected" ]; then
    echo "Failed to connect to any endpoint."
    exit 1
fi

yarn start & sleep 1
server_pid=$!
yarn run android || exit $?
wait $server_pid
