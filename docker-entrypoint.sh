#!/bin/sh
set -e

echo "Running tests..."
npm test

echo "Tests passed. Starting application..."
exec npm start
