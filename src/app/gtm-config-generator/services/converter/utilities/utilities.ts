import {
  NestedObject,
  Parameter,
} from '../../../../interfaces/gtm-cofig-generator';
import {
  BUILT_IN_EVENTS,
  BUILT_IN_SCROLL_EVENT,
  BUILT_IN_VIDEO_EVENTS,
} from '../constant';

export function isBuiltInEvent(eventName: string): boolean {
  try {
    return BUILT_IN_EVENTS.some((_event) => eventName.includes(_event));
  } catch (error) {
    throw new Error('Failed to check if event is built-in');
  }
}

export function isIncludeVideo(data: Record<string, string>[]) {
  try {
    return data.some((record) =>
      BUILT_IN_VIDEO_EVENTS.includes(record['eventName'])
    );
  } catch (error) {
    throw new Error('Failed to check if video is included');
  }
}

export function isIncludeScroll(data: Record<string, string>[]) {
  try {
    return data.some((record) =>
      BUILT_IN_SCROLL_EVENT.includes(record['eventName'])
    );
  } catch (error) {
    throw new Error('Failed to check if scroll is included');
  }
}

export function hasExistedDataLayer(dLReference: string, dataLayers: string[]) {
  return dataLayers.some((dL) => dL.includes(dLReference));
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
export function getAllObjectPaths(obj: NestedObject, prefix = ''): string[] {
  let paths: string[] = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const path = prefix ? `${prefix}.${key}` : key;
      paths.push(path);

      if (typeof obj[key] === 'object' && obj[key] !== null) {
        const nestedPaths = getAllObjectPaths(obj[key], path);
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
export function formatParameters(params: Record<string, string>): Parameter[] {
  return Object.keys(params).map((key) => {
    const value = Array.isArray(params[key]) ? key : params[key].slice(1);
    return { key: key, value: value, type: '' };
  });
}

/**
 * Formats the parameters of a single event.
 * If the event parameters contain an 'ecommerce' key, the value of this key is also formatted and combined with the rest of the parameters.
 * Otherwise, the function just formats the parameters.
 * @param eventParams - A stringified JSON representing event parameters.
 * @returns An array of objects, each containing 'name' and 'value' properties.
 */
export function formatSingleEventParameters(eventParams: string): Parameter[] {
  const parsedEventParams = JSON.parse(eventParams);
  const ecommerceString = 'ecommerce';

  if (parsedEventParams.hasOwnProperty(ecommerceString)) {
    const { ecommerce, ...rest } = parsedEventParams;
    const ecommerceParams = formatParameters(ecommerce);
    const restParams = formatParameters(rest);
    const formattedParams = [...ecommerceParams, ...restParams];
    console.log(
      'formattedParams after formatting ecommerce: ',
      formattedParams
    );
    return formattedParams;
  }
  const formattedParams = formatParameters(parsedEventParams);
  console.log('formattedParams after formatting: ', formattedParams);
  return formattedParams;
}
