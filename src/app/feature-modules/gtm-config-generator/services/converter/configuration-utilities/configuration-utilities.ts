import {
  Tag,
  TagConfig,
  Trigger,
  TriggerConfig,
  VariableConfig,
} from '../../../../../interfaces/gtm-config-generator';
import { getTags } from '../tag-utilities/tag-utilities';
import { getTriggers } from '../trigger-utilities/trigger-utilities';
import { outputTime } from '../utilities/utilities';
import {
  getBuiltInVariables,
  getVariables,
} from '../variable-utilities/variable-utilities';

export function getGTMFinalConfiguration(
  accountId: string,
  containerId: string,
  variables: VariableConfig[],
  triggers: TriggerConfig[],
  tags: TagConfig[],
  builtInVariable: VariableConfig[],
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

export function exportGtmJSON(
  data: Record<string, string>[],
  accountId: string,
  containerId: string,
  containerName: string,
  gtmId: string,
  tags: Tag[],
  dataLayers: string[],
  triggers: Trigger[],
  measurementIdCustomJS: string
) {
  const _variable = getVariables(
    accountId,
    containerId,
    dataLayers,
    measurementIdCustomJS
  );
  const _triggers = getTriggers(accountId, containerId, data, triggers);
  const _tags = getTags(
    accountId,
    containerId,
    data,
    _triggers,
    tags,
    dataLayers
  );
  const builtInVariable = getBuiltInVariables(accountId, containerId, data);

  return getGTMFinalConfiguration(
    accountId,
    containerId,
    _variable,
    _triggers,
    _tags,
    builtInVariable,
    containerName,
    gtmId
  );
}
