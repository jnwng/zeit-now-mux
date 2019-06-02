import os from 'os';
import fs from 'fs';
import path from 'path';
import { FileBlob } from '@now/build-utils';

import { build } from '../src';

jest.mock('@mux/mux-node');

const files = {
  'index.html': new FileBlob({
    mode: 0o777,
    data: fs.readFileSync(path.join(__dirname, './fixtures/html/index.html')),
  }),
  'subdirectory/index.html': new FileBlob({
    mode: 0o777,
    data: fs.readFileSync(
      path.join(__dirname, './fixtures/html/subdirectory/index.html')
    ),
  }),
};

const workPath = path.join(
  os.tmpdir(),
  Math.random()
    .toString()
    .slice(3)
);

it('parses <video /> tags', async () => {
  const result = await build({
    files,
    entrypoint: 'index.html',
    workPath,
    config: {},
  });

  console.info({ result });
});
