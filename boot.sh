
#set -ew
export ANDROID_HOME=~/Android/Sdk
export PATH=~/Android/Sdk/platform-tools:${PATH}

adb connect 192.168.0.104:55555
adb shell ls
yarn start & sleep 3
server_pid=$!
yarn run android
wait $server_pid
