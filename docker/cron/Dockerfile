FROM alpine:3.19

RUN apk add --no-cache curl tzdata

ENV TZ=Europe/Rome

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
