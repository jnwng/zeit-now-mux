const Video = {
  Assets: {
    create: async () => {
      return {
        id: 'ymDhKE00YZ12XxJLFo76DIVqCzL15bVf2',
        created_at: '1517531451',
        playback_ids: [
          {
            id: 'EsxKJmzkfLvGV01cbThYHDcEz7TKcbR31',
            policy: 'public',
          },
        ],
        status: 'preparing',
      };
    },

    createPlaybackId: async () => {
      return {
        aspect_ratio: '16:9',
        mp4_support: 'none',
        master_access: 'none',
        playback_ids: [
          {
            id: 'Ell9QEhbh6Ck7hdy02QmGfkZHk01jiuUDJ',
            policy: 'public',
          },
        ],
        max_stored_frame_rate: 29.97,
        max_stored_resolution: 'HD',
        status: 'ready',
        created_at: '1559422572',
        duration: 23.872,
        id: '1pfiZExp2roPNiNOWErnDUY00OoGclODw',
        tracks: [
          {
            max_height: 1080,
            max_frame_rate: 29.97,
            max_width: 1920,
            id: 'DIp9lz01AUK02i5IEpQalH89xIWdcDAnQU',
            duration: 23.8238,
            type: 'video',
          },
          {
            max_channels: 2,
            type: 'audio',
            max_channel_layout: 'stereo',
            duration: 23.823792,
            id: 'GloLHA6yYGccm7i6M7D36vSByTLYk200f8iFjIQ15jEY',
          },
        ],
      };
    },
  },
};

module.exports = function Mux() {
  return { Video };
};
