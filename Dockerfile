FROM node:10-alpine as build

ARG envType=staging

RUN echo ${envType}

RUN mkdir /app

WORKDIR /app

COPY backend /app
COPY build/ /app/build

# Run
FROM php:7.3-apache

COPY --from=build /app/build /var/www/html

RUN a2enmod rewrite

EXPOSE 80
