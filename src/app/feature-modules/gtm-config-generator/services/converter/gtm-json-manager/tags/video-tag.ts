import {
  TagConfig,
  TriggerConfig,
} from 'src/app/interfaces/gtm-config-generator';
import { isIncludeVideo } from '../../utilities/event-utils';

export function videoTag({
  accountId,
  containerId,
  triggerId,
}: {
  accountId: string;
  containerId: string;
  triggerId: string;
}): TagConfig[] {
  return [
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
}

export function createVideoTag(
  accountId: string,
  containerId: string,
  data: Record<string, string>[],
  triggers: TriggerConfig[]
) {
  try {
    if (!isIncludeVideo(data)) {
      return [];
    }

    const trigger = triggers.find(
      (trigger) => trigger.name === 'event youtube video'
    );
    if (!trigger || !trigger.triggerId) {
      throw new Error("Couldn't find matching trigger for video tag");
    }

    return videoTag({
      accountId,
      containerId,
      triggerId: trigger.triggerId as string,
    });
  } catch (error) {
    console.error('Error while creating video tag:', error);
    // Potentially re-throw the error if it should be handled upstream
    // throw error;
    return [];
  }
}
