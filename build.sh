set -e
export ANDROID_HOME=~/Android/Sdk
export PATH=~/Android/Sdk/platform-tools:${PATH}


initial_folder=$(pwd)

BUILD_FOLDER=$(mktemp -d)
APP_FOLDER=$BUILD_FOLDER

__exit() {
    cd $initial_folder
    rm -fr $BUILD_FOLDER
    echo Cleaned $BUILD_FOLDER
    echo Exited
}
trap __exit ERR
trap __exit SIGINT

mkdir -p $BUILD_FOLDER/App $BUILD_FOLDER/Common
for f in $(ls | grep -v -e Data -v -e ".git*" -v -e node_modules -v -e build); do
    cp -r $f $BUILD_FOLDER/App
    echo Copied $f
done
cp -r /Common $BUILD_FOLDER
echo Copied /Common
cd $BUILD_FOLDER/App

PACKAGE_NAME=dev.s71walceli.ccmangos
[ ! -z $APP_ID_SUFFIX ] && PACKAGE_NAME=$PACKAGE_NAME.$APP_ID_SUFFIX

OLD_PACKAGE_NAME=$(grep applicationId android/app/build.gradle | head -n 1 | awk -F\" '{print $2}')


PACKAGE_NAME__SED=$(echo $OLD_PACKAGE_NAME | sed  "s/\\./\\\\./g")
echo PACKAGE_NAME__SED = $PACKAGE_NAME__SED
echo sed -i s/$PACKAGE_NAME__SED/$PACKAGE_NAME/g
find $BUILD_FOLDER \( -type d -name .git -prune \) -o -type f -print0 \
    | xargs -0 sed -i s/$PACKAGE_NAME__SED/$PACKAGE_NAME/g
cat android/app/build.gradle | grep applicationId

PKG_MIGRATION_FROM=$BUILD_FOLDER/android/app/src/main/java/$(echo $OLD_PACKAGE_NAME | tr . /)
PKG_MIGRATION_TO=$BUILD_FOLDER/android/app/src/main/java/$(echo $PACKAGE_NAME | tr . /) 
_PKG_MIGRATION_FROM=${PKG_MIGRATION_FROM}/../.tmp
#ls -al ${PKG_MIGRATION_FROM}
mkdir -p $_PKG_MIGRATION_FROM
mv $PKG_MIGRATION_FROM $_PKG_MIGRATION_FROM
mkdir -p $PKG_MIGRATION_TO
mv $_PKG_MIGRATION_FROM/* $PKG_MIGRATION_TO
rm -fr $_PKG_MIGRATION_FROM

yarn install
#npx react-native-rename "Plant Trace STAGING" -b $PACKAGE_NAME
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
adb install app/build/outputs/apk/release/$PACKAGE_NAME.apk
mkdir -p $initial_folder/build/release/
mv app/build/outputs/apk/release/$PACKAGE_NAME.apk $initial_folder/build/release/

__exit
