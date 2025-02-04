#!/bin/sh

docker pull directus/directus:11.4.0
docker save -o directus.tar directus/directus:11.4.0
docker pull nginx:1.27.3
docker save -o nginx.tar nginx:1.27.3
docker pull traefik:v3.0.4
docker save -o traefik.tar traefik:v3.0.4
docker pull axllent/mailpit:v1.21.8
docker save -o mailpit.tar axllent/mailpit:v1.21.8
