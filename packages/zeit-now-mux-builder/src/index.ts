import cheerio from 'cheerio';
import superagent from 'superagent';
import { FileBlob, AnalyzeOptions, BuildOptions } from '@now/build-utils';
import Mux from '@mux/mux-node';

const { Video } = new Mux(
  // TODO(jon): swap this out
  process.env.MUX_ACCESS_TOKEN,
  process.env.MUX_SECRET_KEY
);

// Currently we're pulling this from the Zeit configuration metadata, but we can use Mux's "list assets" at a later time.
async function getAssetMap() {
  const {
    ZEIT_CONFIGURATION_ACCESS_TOKEN: accessToken,
    ZEIT_CONFIGURATION_ID: configurationId,
  } = process.env;
  try {
    const response = await superagent
      .get(
        `https://api.zeit.co/v1/integrations/configuration/${configurationId}/metadata`
      )
      .set({
        Authorization: `Bearer ${accessToken}`,
      });
    console.info({ response });

    return response.muxAssets;
  } catch (err) {
    console.error({ err });
  }
}

async function updateAssetMap(assetMap) {
  const {
    ZEIT_CONFIGURATION_ACCESS_TOKEN: accessToken,
    ZEIT_CONFIGURATION_ID: configurationId,
  } = process.env;
  const response = await superagent
    .post(
      `https://api.zeit.co/v1/integrations/configuration/${configurationId}/metadata`
    )
    .set({
      Authorization: `Bearer ${accessToken}`,
    })
    .send({ muxAssets: assetMap });
  console.info({ response });
}

async function getMuxPlaybackId(sourceURL: string) {
  const asset = await Video.Assets.create({
    input: sourceURL,
  });
  console.info({ asset });

  const playback = await Video.Assets.createPlaybackId(asset.id, {
    policy: 'public',
  });
  console.info({ playback });

  return playback.id;
}

export function analyze(options: AnalyzeOptions) {
  const { files, entrypoint } = options;
  return files[entrypoint].digest;
}

export async function build(options: BuildOptions) {
  const { files, entrypoint } = options;

  const stream = files[entrypoint].toStream();
  const { data } = await FileBlob.fromStream({ stream });
  const content = data.toString();

  const $ = cheerio.load(content);
  const videoSources = $('video source');

  const assetMap = getAssetMap();
  console.info({ assetMap });

  let newAssetMap = {};
  videoSources.map(async videoSource => {
    const sourceURL = videoSource.attr('src');

    let playbackId = assetMap[sourceURL].playbackId;

    if (!assetMap[sourceURL]) {
      playbackId = await getMuxPlaybackId(sourceURL);
      newAssetMap = {
        ...newAssetMap,
        [sourceURL]: {
          playbackId,
        },
      };
    }

    const playbackURL = `https://stream.mux.com/${playbackId}.m3u8`;
    videoSource.attr('src', playbackURL);
    videoSource.attr('type', 'application/x-mpegURL');
    console.info({
      src: videoSource.attr('src'),
      type: videoSource.attr('type'),
    });
  });

  if (Object.keys(newAssetMap).length) {
    await updateAssetMap({
      ...assetMap,
      ...newAssetMap,
    });
  }

  const modifiedContent = $.html();
  console.info({ modifiedContent });
  const result = new FileBlob({ data: modifiedContent });

  return {
    [entrypoint]: result,
  };
}
