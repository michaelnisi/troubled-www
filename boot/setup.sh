#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o xtrace

SOURCE="${BASH_SOURCE[0]}"
if [[ -h $SOURCE ]]; then
    SOURCE="$(readlink "$SOURCE")"
fi
DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"

SVC_ROOT=/opt/troubled
TROUBLED_PORT=8443
TROUBLED_SOURCE=/var/troubled/source
TROUBLED_TARGET=/var/troubled/target

setup_source() {
    mkdir -p $TROUBLED_SOURCE
    cd $TROUBLED_SOURCE/..
    git clone https://github.com/michaelnisi/troubled.git source || true
    cd source
    git pull
    npm install
}

setup_target() {
    mkdir -p $TROUBLED_TARGET
    cd $TROUBLED_TARGET
    git init
}

setup_troubled() {
    local IN=$SVC_ROOT/smf/manifests/troubled.xml.in
    local OUT=/lib/svc/manifest/site/troubled.xml
    sed \
	-e "s;@@SVC_ROOT@@;$SVC_ROOT;g" \
	-e "s;@@TROUBLED_SOURCE@@;$TROUBLED_SOURCE;g" \
	-e "s;@@TROUBLED_TARGET@@;$TROUBLED_TARGET;g" \
	-e "s;@@TROUBLED_PORT@@;${TROUBLED_PORT};g" \
	-e "s;@@TROUBLED_SECRET@@;$TROUBLED_SECRET;g" \
	-e "s;@@AWS_ACCESS_KEY_ID@@;$AWS_ACCESS_KEY_ID;g" \
	-e "s;@@AWS_SECRET_ACCESS_KEY@@;$AWS_SECRET_ACCESS_KEY;g" \
	-e "s;@@S3_BUCKET@@;$S3_BUCKET;g" \
	-e "s;@@S3_REGION@@;$S3_REGION;g" \
	-e "s;@@S3_ENDPOINT@@;$S3_ENDPOINT;g" \
	-e "s;@@CONSUMER_KEY@@;$CONSUMER_KEY;g" \
	-e "s;@@CONSUMER_SECRET@@;$CONSUMER_SECRET;g" \
	-e "s;@@ACCESS_TOKEN@@;$ACCESS_TOKEN;g" \
	-e "s;@@ACCESS_TOKEN_SECRET@@;$ACCESS_TOKEN_SECRET;g" \
	$IN > $OUT
    svccfg import $OUT
    svcadm enable troubled
}

# Assuming svc:/pkgsrc/stud:default is ours, we ignorantly just overwrite any
# existing configuration.
setup_stud() {
    sed -e "s;@@TROUBLED_PORT@@;${TROUBLED_PORT};g" \
      $SVC_ROOT/etc/stud.conf.in > /opt/local/etc/stud/stud.conf
    svcadm enable stud
   if [ "$(svcs -H -o state stud)" == "online" ]; then
     return 0
   fi
   return 1
}

schedule_updates() {
  local url=localhost:${TROUBLED_PORT}/update
  local header="X-Hub-Signature: sha1=${TROUBLED_SHA1}"
  local job="33 0,3,6,9,12,15,18,21 * * * curl -s -H  \"$header\" $url >/dev/null 2>&1"
  if [ "$( crontab -l | grep -s $url )" ]; then
    echo "schedule_updates: nothing to do"
  else
    (crontab -l; echo "$job" ) | crontab
  fi
}

# Mainline

echo "Setting up source repo"
setup_source

echo "Setting up source repo"
setup_target

echo "Updating troubled configuration"
setup_troubled

echo "Schedule updates"
schedule_updates

echo "Setting up stud"
setup_stud

exit 0
