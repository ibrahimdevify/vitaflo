#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
npm install

npx prisma generate

# Install Puppeteer and download Chrome into the project cache
npx puppeteer browsers install chrome