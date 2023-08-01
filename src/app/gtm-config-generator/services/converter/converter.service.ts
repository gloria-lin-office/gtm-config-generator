import { Injectable } from '@angular/core';
import {
  scrollBuiltInVariable,
  scrollTag,
  scrollTriggers,
  videoBuiltInVariable,
  videoTag,
  videoTrigger,
} from './constant';
import {
  BUILT_IN_EVENTS,
  createGA4Configuration,
  createMeasurementIdCJS,
  createTag,
  createTrigger,
  createVariable,
  getGTMFinalConfiguration,
  isIncludeScroll,
  isIncludeVideo,
} from './utility';

const ACCOUNT_ID = '6072698131';
const CONTAINER_ID = '102416705';
const CONTAINER_NAME = 'validation';
const GTM_ID = 'GTM-WJ6N3RM';
const MEASUREMENT_ID_STAGING = 'G-1ZQZQZQZQZ';
const MEASUREMENT_ID_PROD = 'G-2ZQZQZQZQZ';
const STAGING_URL = 'https://example.com';
const PROD_URL = 'https://example.com';
const measurementIdCustomJS = `function() {\n  var MEASUREMENT_ID_STAGING = '${MEASUREMENT_ID_STAGING}'\n  var MEASUREMENT_ID_PROD = '${MEASUREMENT_ID_PROD}'\n\n  var originUrl = window.origin\n\n  if(originUrl === '${STAGING_URL}') return MEASUREMENT_ID_STAGING\n  if(originUrl === '${PROD_URL}') return MEASUREMENT_ID_PROD\n\n  throw new Error('Invalid environment provided')\n}\n`;

interface NestedObject {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class ConverterService {
  dataLayers: string[] = [];
  triggers: { name: string; id: number }[] = [];
  tags: {
    name: string;
    triggers: { name: string; id: number }[];
    parameters: { name: string; value: string }[];
  }[] = [];
  errors: { type: 'dL'; reason: string; meta: any }[] = [];

  accountId: string = ACCOUNT_ID;
  containerId: string = CONTAINER_ID;
  containerName: string = CONTAINER_NAME;
  GTMId: string = GTM_ID;
  stagingUrl = STAGING_URL;
  productionUrl = PROD_URL;
  stagingMeasurementId = MEASUREMENT_ID_STAGING;
  productionMeasurementId = MEASUREMENT_ID_PROD;

  constructor() {}

  convert(jsonString: string) {
    const specs = this.fiftyFiveParseAllSpecs(jsonString);
    const formattedData = specs.map((spec: { [x: string]: any }) => {
      const eventName = spec['event'];

      const eventParameters = { ...spec }; // copy of spec
      delete eventParameters['event'];

      const formattedParameters = this.formatSingleEventParameters(
        JSON.stringify(eventParameters)
      );

      this.formatSingleTrigger(eventName);
      this.formatSingleTag(formattedParameters, eventName);

      return { formattedParameters, eventName };
    });

    const results = this.exportGTMJSON(formattedData);
    return results;
  }

  // ------------------------------------------------------------
  // tags-related methods
  // ------------------------------------------------------------

  private formatSingleTag(
    formattedParams: { name: string; value: string }[],
    eventName: string
  ) {
    if (this.isBuiltInEvent(eventName)) {
      return;
    }
    this.addTagIfNotExists(eventName, formattedParams);
    console.log('this.tags', this.tags);
  }

  private isBuiltInEvent(eventName: string): boolean {
    return BUILT_IN_EVENTS.some((_event) => eventName.includes(_event));
  }

  private addTagIfNotExists(
    eventName: string,
    formattedParams: { name: string; value: string }[]
  ) {
    if (!this.tags.some((tag) => tag.name === eventName)) {
      this.tags.push({
        name: eventName,
        parameters: formattedParams,
        triggers: [
          this.triggers.find((trigger) => trigger.name === eventName)!,
        ],
      });
    }
  }

  private createVideoTag(
    accountId: string,
    containerId: string,
    data: Record<string, string>[],
    triggers: any[]
  ) {
    return isIncludeVideo(data)
      ? [
          videoTag({
            accountId,
            containerId,
            triggerId: triggers.find(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              (trigger) => trigger.name === 'event youtube video'
            )!.triggerId,
          }),
        ]
      : [];
  }

  private createScrollTag(
    accountId: string,
    containerId: string,
    data: Record<string, string>[],
    triggers: any[]
  ) {
    return isIncludeScroll(data)
      ? [
          scrollTag({
            accountId,
            containerId,
            triggerId: triggers.find(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              (trigger) => trigger.name === 'event scroll'
            )!.triggerId,
          }),
        ]
      : [];
  }

  private getTags(
    accountId: string,
    containerId: string,
    data: Record<string, string>[],
    triggers: any[]
  ) {
    return [
      // config tag
      createGA4Configuration(accountId, containerId),
      // normal tags
      ...this.tags.map((tag) => {
        return createTag(
          accountId,
          containerId,
          tag,
          this.dataLayers,
          triggers
        );
      }),
      // built-in tags. Currently only video and scroll
      ...this.createVideoTag(accountId, containerId, data, triggers),
      ...this.createScrollTag(accountId, containerId, data, triggers),
    ].map((_data, index) => ({
      ..._data,
      tagId: (index + 1).toString(),
    }));
  }

  // ------------------------------------------------------------
  // triggers-related methods
  // ------------------------------------------------------------

  private formatSingleTrigger(eventName: string) {
    if (this.isBuiltInEvent(eventName)) {
      return;
    }

    this.addTriggerIfNotExists(eventName);
    console.log('this.triggers', this.triggers);
  }

  private addTriggerIfNotExists(eventName: string) {
    if (!this.triggers.some((trigger) => trigger.name === eventName)) {
      this.triggers.push({
        name: eventName,
        id: this.triggers.length + 1,
      });
    }
  }

  private createVideoTrigger(
    accountId: string,
    containerId: string,
    data: Record<string, string>[]
  ) {
    const _videoTrigger = isIncludeVideo(data)
      ? videoTrigger({
          accountId,
          containerId,
        })
      : undefined;

    return isIncludeVideo(data) ? [_videoTrigger] : [];
  }

  private createScrollTrigger(
    accountId: string,
    containerId: string,
    data: Record<string, string>[]
  ) {
    const _scrollTrigger = isIncludeScroll(data)
      ? scrollTriggers({
          accountId,
          containerId,
        })
      : undefined;

    return isIncludeScroll(data) ? [_scrollTrigger] : [];
  }

  private getTriggers(
    accountId: string,
    containerId: string,
    data: Record<string, string>[]
  ) {
    return [
      ...this.triggers.map(({ name: trigger }) => {
        return createTrigger(accountId, containerId, trigger);
      }),
      ...this.createVideoTrigger(accountId, containerId, data),
      ...this.createScrollTrigger(accountId, containerId, data),
    ].map((_trigger, index) => ({
      ..._trigger,
      triggerId: (index + 1).toString(),
    }));
  }

  // ------------------------------------------------------------
  // variables-related methods
  // ------------------------------------------------------------

  private getVariables(accountId: string, containerId: string) {
    const variables = this.dataLayers.map((dL, i) => {
      // const dataLayerName = `${dL}`;
      return createVariable(accountId, containerId, dL);
    });

    const measurementIdVariable = createMeasurementIdCJS(
      accountId,
      containerId,
      measurementIdCustomJS
    );
    variables.push(measurementIdVariable);

    return variables.map((data, index) => ({
      ...data,
      variableId: (index + 1).toString(),
    }));
  }

  private getBuiltInVariables(
    accountId: string,
    containerId: string,
    data: Record<string, string>[]
  ) {
    return [
      ...(isIncludeVideo(data)
        ? [...videoBuiltInVariable({ accountId, containerId })]
        : []),
      ...(isIncludeScroll(data)
        ? [...scrollBuiltInVariable({ accountId, containerId })]
        : []),
    ];
  }

  // ------------------------------------------------------------
  // general utility
  // ------------------------------------------------------------

  // data parsing

  private fiftyFiveParseAllSpecs(inputString: string) {
    const allSpecs = JSON.parse(inputString);
    // Using 'map' to apply the 'parseSpec' function to each object in the 'allSpecs' array
    // 'bind(this)' is used to ensure that 'this' inside 'parseSpec' refers to the class instance
    // When passing a method like 'parseSpec' as a callback, the context of 'this' is lost
    // Using 'bind(this)', the context is preserved and 'this' inside 'parseSpec' still refers to the class instance
    return allSpecs.map(this.parseSpec.bind(this));
  }

  private parseSpec(parsedJSON: Record<string, string>) {
    if (parsedJSON) {
      const { event, ...Json } = parsedJSON;

      // the paths is for building data layer variables
      const paths = this.getAllObjectPaths(Json);
      this.addDataLayer(paths);

      return parsedJSON;
    } else {
      this.addError(parsedJSON);
      return null;
    }
  }

  private addDataLayer(paths: string[]) {
    const uniquePaths = this.filterDuplicates(paths);
    this.dataLayers.push(...uniquePaths);
  }

  private addError(parsedJSON: Record<string, string>) {
    this.errors.push({
      type: 'dL',
      reason:
        'cannot parse JSON. please revise the format to follow JSON format structures',
      meta: parsedJSON,
    });
  }

  private filterDuplicates(paths: string[]): string[] {
    return paths.filter((path) => !this.dataLayers.includes(path));
  }

  /**
   * A function to get all paths from the root to each leaf node in a nested object.
   *
   * @param obj - The nested object to get the paths from.
   * @param prefix - The current path prefix, used during recursion.
   * @returns An array of paths. Each path is a string with properties separated by dots.
   *
   * @example
   * // returns ['a', 'b', 'b.c', 'b.d', 'b.d.e']
   * getAllObjectPaths({ a: 1, b: { c: 2, d: { e: 3 } } })
   */
  private getAllObjectPaths(obj: NestedObject, prefix = ''): string[] {
    let paths: string[] = [];

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const path = prefix ? `${prefix}.${key}` : key;
        paths.push(path);

        if (typeof obj[key] === 'object' && obj[key] !== null) {
          const nestedPaths = this.getAllObjectPaths(obj[key], path);
          paths = paths.concat(nestedPaths);
        }
      }
    }
    return paths;
  }

  /**
   * Formats an object into an array of key-value pairs, where each key is treated as a name and each value as a value.
   * The first character of each value is omitted.
   * @param params - An object where each key-value pair represents a parameter.
   * @returns An array of objects, each containing 'name' and 'value' properties.
   */
  private formatParameters(params: Record<string, string>) {
    return Object.keys(params).map((key) => {
      const value = Array.isArray(params[key]) ? key : params[key].slice(1);
      return { name: key, value };
    });
  }

  /**
   * Formats the parameters of a single event.
   * If the event parameters contain an 'ecommerce' key, the value of this key is also formatted and combined with the rest of the parameters.
   * Otherwise, the function just formats the parameters.
   * @param eventParams - A stringified JSON representing event parameters.
   * @returns An array of objects, each containing 'name' and 'value' properties.
   */
  private formatSingleEventParameters(eventParams: string) {
    const parsedEventParams = JSON.parse(eventParams);
    const ecommerceString = 'ecommerce';

    if (parsedEventParams.hasOwnProperty(ecommerceString)) {
      const { ecommerce, ...rest } = parsedEventParams;
      const ecommerceParams = this.formatParameters(ecommerce);
      const restParams = this.formatParameters(rest);
      const formattedParams = [...ecommerceParams, ...restParams];
      console.log(
        'formattedParams after formatting ecommerce: ',
        formattedParams
      );
      return formattedParams;
    }
    const formattedParams = this.formatParameters(parsedEventParams);
    console.log('formattedParams after formatting: ', formattedParams);
    return formattedParams;
  }

  // export

  private exportGTMJSON(data: Record<string, string>[]) {
    console.log('data in the exportGTMJSON', data);
    const accountId = this.accountId;
    const containerId = this.containerId;

    const _variable = this.getVariables(accountId, containerId);
    const _triggers = this.getTriggers(accountId, containerId, data);
    const _tags = this.getTags(accountId, containerId, data, _triggers);
    const builtInVariable = this.getBuiltInVariables(
      accountId,
      containerId,
      data
    );

    return getGTMFinalConfiguration(
      accountId,
      containerId,
      _variable,
      _triggers,
      _tags,
      builtInVariable,
      this.containerName,
      this.GTMId
    );
  }
}
