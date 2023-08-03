import {
  Trigger,
  TriggerConfig,
} from '../../../interfaces/gtm-cofig-generator';
import { isIncludeScroll, isIncludeVideo } from './utilities';
import { scrollTriggers, videoTrigger } from './constant';

export function createTrigger(
  accountId: string,
  containerId: string,
  trigger: string
): TriggerConfig {
  return {
    accountId,
    containerId,
    type: 'CUSTOM_EVENT',
    name: `event equals ${trigger}`,
    customEventFilter: [
      {
        type: 'EQUALS',
        parameter: [
          {
            type: 'TEMPLATE',
            key: 'arg0',
            value: '{{_event}}',
          },
          {
            type: 'TEMPLATE',
            key: 'arg1',
            value: trigger,
          },
        ],
      },
    ],
  };
}

export function createVideoTrigger(
  accountId: string,
  containerId: string,
  data: Record<string, string>[]
): TriggerConfig[] {
  try {
    if (isIncludeVideo(data)) {
      const _videoTrigger = videoTrigger({
        accountId,
        containerId,
      });
      return [_videoTrigger];
    }
    return []; // if there's no video trigger, return an empty array
  } catch (error) {
    console.error('Failed to create video trigger:', error);
    return []; // if there's an error, return an empty array
  }
}

export function createScrollTrigger(
  accountId: string,
  containerId: string,
  data: Record<string, string>[]
): TriggerConfig[] {
  try {
    if (isIncludeScroll(data)) {
      const _scrollTrigger = scrollTriggers({
        accountId,
        containerId,
      });
      return [_scrollTrigger];
    }
    return []; // if there's no scroll trigger, return an empty array
  } catch (error) {
    console.error('Failed to create scroll trigger:', error);
    return []; // if there's an error, return an empty array
  }
}

export function getTriggers(
  accountId: string,
  containerId: string,
  data: Record<string, string>[],
  triggers: Trigger[]
): TriggerConfig[] {
  return [
    ...triggers.map(({ name: trigger }) => {
      return createTrigger(accountId, containerId, trigger);
    }),
    ...createVideoTrigger(accountId, containerId, data),
    ...createScrollTrigger(accountId, containerId, data),
  ].map((_trigger, index) => ({
    ..._trigger,
    triggerId: (index + 1).toString(),
  }));
}
