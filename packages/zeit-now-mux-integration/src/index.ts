const { withUiHook } = require('@zeit/integration-utils');

let count = 0;

// @ts-ignore
const integration = withUiHook(({ payload }) => {
  count += 1;
  return `
    <Page>
      <P>Counter: ${count}</P>
      <Button>Count Me</Button>
    </Page>
  `;
});

module.exports = integration;
