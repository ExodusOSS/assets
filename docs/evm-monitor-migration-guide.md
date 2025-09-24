# EVM Monitor Migration Guide

That document will help you when you make migration from `no-history` to `clarity(-v2/-v3)`.

## createAssetFactory

In required for you `[asset]-plugin` you will find `const createAsset = createAssetFactory`.

Change server `url` to clarity and change `monitorType`.
Update other parameters depends on your needs

## Tests

You can need to update tests as well. After it you need to make several important steps:

- Run `yarn run test:integration --scope @exodus/[asset]-plugin` - check your test passed properly
- Probably you need to regenerate `[asset]-safe-report.json`:
  - Set `override:true` flag in `monitorIntegrationTester` parameters in your test
  - Run command `yarn test:asset [asset]`. (For example `yarn test:asset ethereum`) - it will generate new safe-report.
  - Remember to set `override:false` flag back
- If your tests have or require replays — you need to record and replay new recordings for it:
  - Be sure you have `[testname].replay.test.cjs` nearby your `[testname].integration.test.js` file.
  - Add `jest.exodus.mock.fetchRecord()` or `jest.exodus.mock.websocketRecord({ WebSocket: require('ws') })` at the top of your replay file, depends on you needs.
  - Use `yarn run test --scope @exodus/[asset]-plugin` - it should create `.json` files with request / response records.
  - Remove `...Record(...)` methods and add `jest.exodus.mock.fetchReplay()` or `jest.exodus.mock.websocketReplay()`
- Next you need add to your test script in near package.json file `--drop-network` to disable network
- Use `yarn run test --scope @exodus/[asset]-plugin` to simulate working in `CI`.
