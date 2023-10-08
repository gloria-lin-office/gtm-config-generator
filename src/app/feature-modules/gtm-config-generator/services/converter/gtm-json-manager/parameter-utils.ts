import {
  Parameter,
  ParameterMap,
  TriggerConfig,
} from '../../../../../interfaces/gtm-config-generator';

export function createListParameter(
  key: string,
  parameters: Parameter[]
): Parameter {
  return {
    type: 'LIST',
    key,
    list: parameters.map((param) =>
      createMapParameter(param.key, `{{DLV - ${param.value}}}`)
    ),
  };
}

export function createBuiltInListParameter(
  key: string,
  mapParameters: ParameterMap[]
) {
  return {
    type: 'LIST',
    key,
    list: [...mapParameters],
  };
}

export function createMapParameter(name: string, value: string): ParameterMap {
  return {
    type: 'MAP',
    map: [
      createTemplateParameter('name', name),
      createTemplateParameter('value', value),
    ],
  };
}

export function createIntegerParameter(key: string, value: string): Parameter {
  return {
    type: 'INTEGER',
    key,
    value,
  };
}

export function createBooleanParameter(key: string, value: string): Parameter {
  return {
    type: 'BOOLEAN',
    key,
    value,
  };
}

export function createTagReferenceParameter(
  key: string,
  value: string
): Parameter {
  return {
    type: 'TAG_REFERENCE',
    key,
    value,
  };
}

export function createTemplateParameter(key: string, value: string): Parameter {
  return {
    type: 'TEMPLATE',
    key,
    value,
  };
}

export function findTriggerIdByEventName(
  eventName: string,
  triggers: TriggerConfig[]
): string {
  const trigger = triggers.find(
    (t) => t.customEventFilter?.[0]?.parameter?.[1]?.value === eventName
  );
  return trigger?.triggerId ?? '';
}
