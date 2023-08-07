import {
  TagConfig,
  TriggerConfig,
  VariableConfig,
} from 'src/app/interfaces/gtm-cofig-generator';

export const BUILT_IN_SCROLL_EVENT = ['scroll'];
export const BUILT_IN_VIDEO_EVENTS = [
  'video_start',
  'video_progress',
  'video_complete',
];
export const BUILT_IN_EVENTS = [
  ...BUILT_IN_SCROLL_EVENT,
  ...BUILT_IN_VIDEO_EVENTS,
];

export const videoTrigger = ({
  accountId,
  containerId,
  progressThresholdsPercent = '10,25,50,75',
}: {
  accountId: string;
  containerId: string;
  progressThresholdsPercent?: string;
}): TriggerConfig => ({
  accountId,
  containerId,
  name: 'event youtube video',
  type: 'YOU_TUBE_VIDEO',
  fingerprint: '1689849183312',
  parameter: [
    {
      type: 'TEMPLATE',
      key: 'progressThresholdsPercent',
      value: progressThresholdsPercent,
    },
    {
      type: 'BOOLEAN',
      key: 'captureComplete',
      value: 'true',
    },
    {
      type: 'BOOLEAN',
      key: 'captureStart',
      value: 'true',
    },
    {
      type: 'BOOLEAN',
      key: 'fixMissingApi',
      value: 'true',
    },
    {
      type: 'TEMPLATE',
      key: 'triggerStartOption',
      value: 'WINDOW_LOAD',
    },
    {
      type: 'TEMPLATE',
      key: 'radioButtonGroup1',
      value: 'PERCENTAGE',
    },
    {
      type: 'BOOLEAN',
      key: 'capturePause',
      value: 'false',
    },
    {
      type: 'BOOLEAN',
      key: 'captureProgress',
      value: 'true',
    },
  ],
});

export const videoBuiltInVariable = ({
  accountId,
  containerId,
}: {
  accountId: string;
  containerId: string;
}): VariableConfig[] => [
  {
    accountId,
    containerId,
    type: 'VIDEO_PROVIDER',
    name: 'Video Provider',
  },
  {
    accountId,
    containerId,
    type: 'VIDEO_URL',
    name: 'Video URL',
  },
  {
    accountId,
    containerId,
    type: 'VIDEO_TITLE',
    name: 'Video Title',
  },
  {
    accountId,
    containerId,
    type: 'VIDEO_DURATION',
    name: 'Video Duration',
  },
  {
    accountId,
    containerId,
    type: 'VIDEO_PERCENT',
    name: 'Video Percent',
  },
  {
    accountId,
    containerId,
    type: 'VIDEO_VISIBLE',
    name: 'Video Visible',
  },
  {
    accountId,
    containerId,
    type: 'VIDEO_STATUS',
    name: 'Video Status',
  },
  {
    accountId,
    containerId,
    type: 'VIDEO_CURRENT_TIME',
    name: 'Video Current Time',
  },
];

export const videoTag = ({
  accountId,
  containerId,
  triggerId,
}: {
  accountId: string;
  containerId: string;
  triggerId: string;
}): TagConfig[] => [
  {
    accountId,
    containerId,
    name: 'GA4 Event - Video',
    type: 'gaawe',
    parameter: [
      {
        type: 'BOOLEAN',
        key: 'sendEcommerceData',
        value: 'false',
      },
      {
        type: 'TEMPLATE',
        key: 'eventName',
        value: 'video_{{Video Status}}',
      },
      {
        type: 'LIST',
        key: 'eventParameters',
        list: [
          {
            type: 'MAP',
            map: [
              {
                type: 'TEMPLATE',
                key: 'name',
                value: 'video_current_time',
              },
              {
                type: 'TEMPLATE',
                key: 'value',
                value: '{{Video Current Time}}',
              },
            ],
          },
          {
            type: 'MAP',
            map: [
              {
                type: 'TEMPLATE',
                key: 'name',
                value: 'video_duration',
              },
              {
                type: 'TEMPLATE',
                key: 'value',
                value: '{{Video Duration}}',
              },
            ],
          },
          {
            type: 'MAP',
            map: [
              {
                type: 'TEMPLATE',
                key: 'name',
                value: 'video_percent',
              },
              {
                type: 'TEMPLATE',
                key: 'value',
                value: '{{Video Percent}}',
              },
            ],
          },
          {
            type: 'MAP',
            map: [
              {
                type: 'TEMPLATE',
                key: 'name',
                value: 'video_provider',
              },
              {
                type: 'TEMPLATE',
                key: 'value',
                value: '{{Video Provider}}',
              },
            ],
          },
          {
            type: 'MAP',
            map: [
              {
                type: 'TEMPLATE',
                key: 'name',
                value: 'video_title',
              },
              {
                type: 'TEMPLATE',
                key: 'value',
                value: '{{Video Title}}',
              },
            ],
          },
          {
            type: 'MAP',
            map: [
              {
                type: 'TEMPLATE',
                key: 'name',
                value: 'video_url',
              },
              {
                type: 'TEMPLATE',
                key: 'value',
                value: '{{Video URL}}',
              },
            ],
          },
          {
            type: 'MAP',
            map: [
              {
                type: 'TEMPLATE',
                key: 'name',
                value: 'visible',
              },
              {
                type: 'TEMPLATE',
                key: 'value',
                value: '{{Video Visible}}',
              },
            ],
          },
        ],
      },
      {
        type: 'TAG_REFERENCE',
        key: 'measurementId',
        value: 'GA4 Configuration',
      },
    ],
    fingerprint: '1690374452646',
    firingTriggerId: [triggerId],
  },
  {
    accountId,
    containerId,
    name: 'cHTML - Youtube iframe API script',
    type: 'html',
    parameter: [
      {
        type: 'TEMPLATE',
        key: 'html',
        value: '<script src="https://www.youtube.com/iframe_api">\n',
      },
      {
        type: 'BOOLEAN',
        key: 'supportDocumentWrite',
        value: 'false',
      },
    ],
    fingerprint: '1689848944995',
    firingTriggerId: [triggerId],
  },
];

export const scrollTag = ({
  accountId,
  containerId,
  triggerId,
}: {
  accountId: string;
  containerId: string;
  triggerId: string;
}): TagConfig[] => [
  {
    accountId,
    containerId,
    name: 'GA4 - scroll',
    type: 'gaawe',
    parameter: [
      {
        type: 'BOOLEAN',
        key: 'sendEcommerceData',
        value: 'false',
      },
      {
        type: 'TEMPLATE',
        key: 'eventName',
        value: 'scroll',
      },
      {
        type: 'LIST',
        key: 'eventParameters',
        list: [
          {
            type: 'MAP',
            map: [
              {
                type: 'TEMPLATE',
                key: 'name',
                value: 'scroll_percentage',
              },
              {
                type: 'TEMPLATE',
                key: 'value',
                value: '{{Scroll Depth Threshold}}',
              },
            ],
          },
        ],
      },
      {
        type: 'TAG_REFERENCE',
        key: 'measurementId',
        value: 'GA4 Configuration',
      },
    ],
    fingerprint: '1690184079241',
    firingTriggerId: [triggerId],
  },
];

export const scrollTriggers = ({
  accountId,
  containerId,
  verticalThresholdsPercent = '25,50,75,90',
}: {
  accountId: string;
  containerId: string;
  verticalThresholdsPercent?: string;
}): TriggerConfig => ({
  accountId,
  containerId,
  name: 'event scroll',
  type: 'SCROLL_DEPTH',
  fingerprint: '1687976535532',
  parameter: [
    {
      type: 'TEMPLATE',
      key: 'verticalThresholdUnits',
      value: 'PERCENT',
    },
    {
      type: 'TEMPLATE',
      key: 'verticalThresholdsPercent',
      value: verticalThresholdsPercent,
    },
    {
      type: 'BOOLEAN',
      key: 'verticalThresholdOn',
      value: 'true',
    },
    {
      type: 'TEMPLATE',
      key: 'triggerStartOption',
      value: 'WINDOW_LOAD',
    },
    {
      type: 'BOOLEAN',
      key: 'horizontalThresholdOn',
      value: 'false',
    },
  ],
});

export const scrollBuiltInVariable = ({
  accountId,
  containerId,
}: {
  accountId: string;
  containerId: string;
}): VariableConfig[] => [
  {
    accountId,
    containerId,
    type: 'SCROLL_DEPTH_THRESHOLD',
    name: 'Scroll Depth Threshold',
  },
];
