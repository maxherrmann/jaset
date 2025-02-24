set -e

rm -rf build > /dev/null
rm -rf dist > /dev/null

npm run format
npm run lint

npx tsc
node build.js

dts-bundle-generator \
    -o ./dist/index.d.ts \
    --export-referenced-types false \
    --sort \
    --no-banner \
    -- ./build/index.d.ts

npx publint --strict