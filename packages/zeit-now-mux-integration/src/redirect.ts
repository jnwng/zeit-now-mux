const { parse } = require('url');
const superagent = require('superagent');

async function getAccessToken({ code }: { code: string }) {
  const {
    ZEIT_OAUTH_CLIENT_ID: client_id,
    ZEIT_OAUTH_CLIENT_SECRET: client_secret,
  } = process.env;
  try {
    const response = await superagent
      .post('https://api.zeit.co/v2/oauth/access_token')
      .type('form')
      .send({
        client_id,
        client_secret,
        code,
        redirect_uri: 'http://localhost:5005/redirect',
      });

    const {
      access_token: accessToken,
      installation_id: configurationId,
      // user_id: userId,
    } = response.body;

    console.info({ accessToken, configurationId });
    return accessToken;
  } catch (err) {
    console.error({ err });
  }
}

async function storeSecret(
  accessToken: string,
  { name, value }: { name: string; value: string }
) {
  try {
    await superagent
      .post('https://api.zeit.co/v2/now/secrets')
      .set({
        Authorization: `Bearer ${accessToken}`,
      })
      .send({
        name,
        value,
      });
    console.info({ name, value });
  } catch (err) {
    if (err.status === 200) {
      return;
    } else if (err.status === 409) {
      console.info(`Secret with name: ${name} already exists`);
    } else {
      console.error({ err });
    }
  }
}

async function storeAccessTokenInZeitSecrets({
  accessToken,
  configurationId,
}: {
  accessToken: string;
  configurationId: string;
}) {
  await storeSecret(accessToken, {
    name: 'zeit-now-mux-access-token',
    value: accessToken,
  });
  await storeSecret(accessToken, {
    name: 'zeit-now-mux-configuration-id',
    value: configurationId,
  });
}

// @ts-ignore
module.exports = async (req, res) => {
  const { query } = parse(req.url, true);

  const { code, configurationId } = query;
  console.info({ code, configurationId });

  if (code && configurationId) {
    const accessToken = await getAccessToken({ code });
    console.info({ accessToken });
    // use the access token and the configurationId to get access to the configuration metadata
    // store the access token as an environment variable so we can access the configuration store arbitrarily.

    await storeAccessTokenInZeitSecrets({
      accessToken,
      configurationId,
    });
  }

  res.statusCode = 302;
  res.setHeader('Location', query.next || '/');
  res.end();
};
