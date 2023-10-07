import { TriggerConfig } from 'src/app/interfaces/gtm-config-generator';

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
