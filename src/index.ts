import cheerio from 'cheerio';
import { FileBlob, AnalyzeOptions, BuildOptions } from '@now/build-utils';
import Mux from '@mux/mux-node';

const { Video } = new Mux(
  process.env.MUX_ACCESS_TOKEN,
  process.env.MUX_SECRET_KEY
);

export function analyze(options: AnalyzeOptions) {
  const { files, entrypoint } = options;
  return files[entrypoint].digest;
}

export async function build(options: BuildOptions) {
  const { files, entrypoint } = options;

  const stream = files[entrypoint].toStream();
  const { data } = await FileBlob.fromStream({ stream });
  const content = data.toString();

  // Let's pull this out into an extensible set of tests for certain properties
  const $ = cheerio.load(content);
  const videoSource = $('video source');
  console.info({ videoSource });
  //

  const asset = await Video.Assets.create({
    input: videoSource,
  });
  console.info({ asset });

  const playback = await Video.Assets.createPlaybackId(asset.id, {
    policy: 'public',
  });
  console.info({ playback });

  const playbackURL = `https://stream.mux.com/${playback.id}.m3u8`;
  videoSource.attr('src', playbackURL);
  console.info({ src: videoSource.attr('src') });

  // if we match the video tag, do an async substitution for the Mux URL
  // perhaps we can do a video literal tag.

  const modifiedContent = $.html();
  console.info({ modifiedContent });

  const result = new FileBlob({ data: modifiedContent });

  return {
    [entrypoint]: result,
  };
}
