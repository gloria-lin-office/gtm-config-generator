import {
  Tag,
  TagConfig,
  TriggerConfig,
} from 'src/app/interfaces/gtm-config-generator';

export function createTag(
  accountId: string,
  containerId: string,
  tag: Tag,
  dataLayers: string[],
  triggers: TriggerConfig[]
): TagConfig {
  // TODO: the dataLayers are nested paths, such as 'ecommerce.items'
  // However, the tag.parameters are not nested, such as 'items'
  // So, I've used the workaround to build it in the utilities.ts, adding the prefix 'ecommerce.'
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
