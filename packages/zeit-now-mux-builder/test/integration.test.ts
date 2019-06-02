/* global beforeAll, expect, it, jest */
import fs from 'fs';
import path from 'path';

// @ts-ignore
import {
  packAndDeploy,
  testDeployment,
} from '../../../../now-builders/test/lib/deployment/test-deployment';

jest.setTimeout(4 * 60 * 1000);
const buildUtilsUrl = '@canary';
let builderUrl;

beforeAll(async () => {
  const builderPath = path.resolve(__dirname, '..');
  builderUrl = await packAndDeploy(builderPath);
  console.log('builderUrl', builderUrl);
});

const fixturesPath = path.resolve(__dirname, 'fixtures');

// eslint-disable-next-line no-restricted-syntax
for (const fixture of fs.readdirSync(fixturesPath)) {
  // eslint-disable-next-line no-loop-func
  it(`should build ${fixture}`, async () => {
    const response = await testDeployment(
      { builderUrl, buildUtilsUrl },
      path.join(fixturesPath, fixture)
    );
    expect(response).toBeDefined();
  });
}
