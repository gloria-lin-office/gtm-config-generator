export interface NestedObject {
  [key: string]: any;
}

export interface Error {
  type: string;
  reason: string;
  meta: any;
}

interface ParameterMap {
  type: string;
  key: string;
  value: string;
}

interface ParameterList {
  type: string;
  map: ParameterMap[];
}

export interface Parameter {
  type: string;
  key: string;
  value?: string;
  list?: ParameterList[];
}

export interface CustomEventFilter {
  type: string;
  parameter: Parameter[];
}

export interface Trigger {
  name: string;
  triggerId: string;
}

export interface TriggerConfig {
  name: string;
  type: string;
  accountId: string;
  containerId: string;
  triggerId?: string;
  firingTriggerId?: string[];
  fingerprint?: string;
  customEventFilter?: CustomEventFilter[];
  parameter?: Parameter[];
}

export interface Tag {
  name: string;
  triggers: Trigger[];
  parameters: Parameter[];
}

export interface TagConfig {
  name: string;
  type: string;
  accountId: string;
  containerId: string;
  parameter: Parameter[];
  fingerprint?: string;
  firingTriggerId: string[];
}

export interface VariableConfig {
  name: string;
  type: string;
  accountId: string;
  containerId: string;
  parameter?: Parameter[];
  formatValue?: {};
}

export interface GtmConfigGenerator {
  accountId: string;
  containerId: string;
  containerName: string;
  gtmId: string;
  specs: string;
  stagingUrl?: string;
  stagingMeasurementId?: string;
  productionUrl?: string;
  productionMeasurementId?: string;
}
