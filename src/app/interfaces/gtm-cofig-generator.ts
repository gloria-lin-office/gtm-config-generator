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

export interface Variable {
  name: string;
  type: string;
  accountId: string;
  containerId: string;
  parameter: Parameter[];
}

export interface Parameter {
  type: string;
  key: string;
  value: string;
}

export interface NestedObject {
  [key: string]: any;
}

export interface Trigger {
  name: string;
  id: number;
}

export interface Tag {
  name: string;
  triggers: Trigger[];
  parameters: Parameter[];
}

export interface Error {
  type: string;
  reason: string;
  meta: any;
}
