
#set -ew
export ANDROID_HOME=~/Android/Sdk
export PATH=~/Android/Sdk/platform-tools:${PATH}

adb connect ${ADB_ENDPOINT}
attempts=10
until adb shell ls; do
    ((attempts--))
    if ((attempts == 0)); then exit 1; fi
done
yarn start & sleep 1
server_pid=$!
yarn run android || exit $?
wait $server_pid
