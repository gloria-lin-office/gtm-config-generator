import { Tag, Variable } from '../../../interfaces/gtm-cofig-generator';

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

export function isIncludeVideo(data: Record<string, string>[]) {
  return data.some((record) =>
    BUILT_IN_VIDEO_EVENTS.includes(record['eventName'])
  );
}

export function isIncludeScroll(data: Record<string, string>[]) {
  return data.some((record) =>
    BUILT_IN_SCROLL_EVENT.includes(record['eventName'])
  );
}

export function createVariable(
  accountId: string,
  containerId: string,
  dataLayerName: string
): Variable {
  return {
    name: `DLV - ${dataLayerName}`,
    type: 'v',
    accountId,
    containerId,
    parameter: [
      {
        type: 'INTEGER',
        key: 'dataLayerVersion',
        value: '2',
      },
      {
        type: 'BOOLEAN',
        key: 'setDefaultValue',
        value: 'false',
      },
      {
        type: 'TEMPLATE',
        key: 'name',
        value: dataLayerName,
      },
    ],
  };
}

export function createTrigger(
  accountId: string,
  containerId: string,
  trigger: string
) {
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

// TODO: use the regex table instead of custom JS variable
export function createGA4Configuration(accountId: string, containerId: string) {
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
        value: '{{CustomJS - Measurement ID}}',
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
  triggers: any[]
) {
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
          const dLReference = param.value;
          return {
            type: 'MAP',
            map: [
              {
                type: 'TEMPLATE',
                key: 'name',
                value: param.key,
              },
              {
                type: 'TEMPLATE',
                key: 'value',
                value:
                  param.value && hasExistedDataLayer(dLReference, dataLayers)
                    ? `{{${dLReference}}}`
                    : ``,
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
      (t0: { name: any }) =>
        triggers.find(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          (t1) => t1.customEventFilter[0].parameter[1].value === t0.name
        )!.triggerId
    ),
  };
}

export function hasExistedDataLayer(dLReference: string, dataLayers: string[]) {
  return dataLayers.some((dL) => dL.includes(dLReference));
}

export function createMeasurementIdCJS(
  accountId: string,
  containerId: string,
  measurementIdCustomJS: string
) {
  return {
    name: 'Custom JS - Measurement ID',
    type: 'jsm',
    accountId,
    containerId,
    parameter: [
      {
        type: 'TEMPLATE',
        key: 'javascript',
        value: measurementIdCustomJS,
      },
    ],
    formatValue: {},
  };
}

// TODO: type the data
// the variables, triggers, and tags here are with the configuration
export function getGTMFinalConfiguration(
  accountId: string,
  containerId: string,
  variables: Variable[],
  triggers: any[],
  tags: any,
  builtInVariable: any,
  containerName: string,
  gtmId: string
) {
  return {
    exportFormatVersion: 2,
    exportTime: outputTime(),
    containerVersion: {
      path: `accounts/${accountId}/containers/${containerId}/versions/0`,
      accountId: `${accountId}`,
      containerId: `${containerId}`,
      containerVersionId: '0',
      container: {
        path: `accounts/${accountId}/containers/${containerId}`,
        accountId: `${accountId}`,
        containerId: `${containerId}`,
        name: containerName,
        publicId: gtmId,
        usageContext: ['WEB'],
        fingerprint: '1690281340453',
        tagManagerUrl: `https://tagmanager.google.com/#/container/accounts/${accountId}/containers/${containerId}/workspaces?apiLink=container`,
        features: {
          supportUserPermissions: true,
          supportEnvironments: true,
          supportWorkspaces: true,
          supportGtagConfigs: false,
          supportBuiltInVariables: true,
          supportClients: false,
          supportFolders: true,
          supportTags: true,
          supportTemplates: true,
          supportTriggers: true,
          supportVariables: true,
          supportVersions: true,
          supportZones: true,
          supportTransformations: false,
        },
        tagIds: [gtmId],
      },
      builtInVariable,
      variable: variables,
      trigger: triggers,
      tag: tags,
      fingerprint: '1690374452646',
      tagManagerUrl: `https://tagmanager.google.com/#/versions/accounts/${accountId}/containers/${containerId}/versions/0?apiLink=version`,
    },
  };
}

export function outputTime() {
  //output the time like the format: 2023-08-03 02:16:33
  const date: Date = new Date();

  let year: number = date.getFullYear();

  let month: number | string = date.getMonth() + 1; // getMonth() is zero-indexed, so we need to add 1
  month = month < 10 ? '0' + month : month; // ensure month is 2-digits

  let day: number | string = date.getDate();
  day = day < 10 ? '0' + day : day; // ensure day is 2-digits

  let hours: number | string = date.getHours();
  hours = hours < 10 ? '0' + hours : hours; // ensure hours is 2-digits

  let minutes: number | string = date.getMinutes();
  minutes = minutes < 10 ? '0' + minutes : minutes; // ensure minutes is 2-digits

  let seconds: number | string = date.getSeconds();
  seconds = seconds < 10 ? '0' + seconds : seconds; // ensure seconds is 2-digits

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
