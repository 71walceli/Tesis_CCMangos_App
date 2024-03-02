set -e
export ANDROID_HOME=~/Android/Sdk
export PATH=~/Android/Sdk/platform-tools:${PATH}


npx react-native bundle --platform android --dev false --entry-file index.js \
    --bundle-output android/app/src/main/assets/index.android.bundle \
    --assets-dest android/app/src/main/res/

rm -rf ./android/app/src/main/res/drawable-*
rm -rf ./android/app/src/main/res/raw

cd android
[ ! -z $CLEAN ] && ./gradlew clean
./gradlew assembleRelease

adb connect ${ADB_ENDPOINT}
attempts=10
until adb shell ls; do
    ((attempts--))
    if ((attempts == 0)); then 
        echo "Failed to sideload apk. You need to do it yourself."
        exit 1
    fi
done
adb install app/build/outputs/apk/release/dev.s71walceli.ccmangos.apk
