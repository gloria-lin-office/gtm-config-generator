import {
  Tag,
  TagConfig,
  TriggerConfig,
} from '../../../../interfaces/gtm-cofig-generator';
import { scrollTag, videoTag } from '../constant';
import {
  hasExistedDataLayer,
  isIncludeScroll,
  isIncludeVideo,
} from '../utilities/utilities';

export function createGA4Configuration(
  accountId: string,
  containerId: string
): TagConfig {
  return {
    name: 'GA4 Configuration',
    type: 'gaawc',
    accountId,
    containerId,
    parameter: [
      {
        type: 'BOOLEAN',
        key: 'sendPageView',
        value: 'false',
      },
      {
        type: 'BOOLEAN',
        key: 'enableSendToServerContainer',
        value: 'false',
      },
      {
        type: 'TEMPLATE',
        key: 'measurementId',
        value: '{{Custom JS - Measurement ID}}',
      },
    ],
    firingTriggerId: ['2147479553'],
  };
}

export function createTag(
  accountId: string,
  containerId: string,
  tag: Tag,
  dataLayers: string[],
  triggers: TriggerConfig[]
): TagConfig {
  console.log('dataLayers: ', dataLayers);
  return {
    name: `GA4 event - ${tag.name}`,
    type: 'gaawe',
    accountId,
    containerId,
    parameter: [
      {
        type: 'BOOLEAN',
        key: 'sendEcommerceData',
        value: 'false',
      },
      {
        type: 'TEMPLATE',
        key: 'eventName',
        value: tag.name,
      },
      {
        type: 'LIST',
        key: 'eventParameters',
        list: tag.parameters.map((param) => {
          const dLReference = `${param.value}`;
          console.log('dLReference: ', dLReference);
          return {
            type: 'MAP',
            map: [
              {
                type: 'TEMPLATE',
                key: 'name',
                value: `${param.key}`,
              },
              {
                type: 'TEMPLATE',
                key: 'value',
                value: `{{DLV - ${dLReference}}}`,
              },
            ],
          };
        }),
      },
      {
        type: 'TAG_REFERENCE',
        key: 'measurementId',
        value: 'GA4 Configuration',
      },
    ],
    firingTriggerId: tag.triggers.map(
      (t0) =>
        triggers.find(
          (t1) =>
            t1.customEventFilter &&
            t1.customEventFilter[0] &&
            t1.customEventFilter[0].parameter[1] &&
            t1.customEventFilter[0].parameter[1].value === t0.name
        )?.triggerId as string
    ),
  };
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

export function createScrollTag(
  accountId: string,
  containerId: string,
  data: Record<string, string>[],
  triggers: TriggerConfig[]
) {
  try {
    if (!isIncludeScroll(data)) {
      return [];
    }

    const trigger = triggers.find((trigger) => trigger.name === 'event scroll');
    if (!trigger || !trigger.triggerId) {
      throw new Error("Couldn't find matching trigger for scroll tag");
    }

    return scrollTag({
      accountId,
      containerId,
      triggerId: trigger.triggerId as string,
    });
  } catch (error) {
    console.error('Error while creating scroll tag:', error);
    // Potentially re-throw the error if it should be handled upstream
    // throw error;
    return [];
  }
}

export function getTags(
  accountId: string,
  containerId: string,
  data: Record<string, string>[],
  triggers: TriggerConfig[],
  tags: Tag[],
  dataLayers: string[]
): TagConfig[] {
  return [
    // config tag
    createGA4Configuration(accountId, containerId),
    // normal tags
    ...tags.map((tag) => {
      return createTag(accountId, containerId, tag, dataLayers, triggers);
    }),
    // built-in tags. Currently only video and scroll
    ...createVideoTag(accountId, containerId, data, triggers),
    ...createScrollTag(accountId, containerId, data, triggers),
  ].map((_data, index) => ({
    ..._data,
    tagId: (index + 1).toString(),
  }));
}
