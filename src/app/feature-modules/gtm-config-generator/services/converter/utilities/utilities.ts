import {
  NestedObject,
  Parameter,
} from '../../../../../interfaces/gtm-config-generator';
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
    // TODO: workaround to add the prefix '$ecommerce.' manully to the ecommerce object
    // Should be checking the dataLayers path for the prefix 'ecommerce.'
    Object.keys(ecommerce).forEach((key) => {
      ecommerce[key] = `$ecommerce.${key}`;
    });
    console.log('ecommerce: ', ecommerce);
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

export function fixJsonString(inputString: string) {
  try {
    let fixedString = inputString;

    // Remove multi-line comments first (/**/)
    fixedString = fixedString.replace(/\/\*[\s\S]*?\*\//gm, '');

    // Remove single-line comments that appear after JSON values
    let lines = fixedString.split('\n');
    for (let i = 0; i < lines.length; i++) {
      let commentIndex = lines[i].indexOf('//');
      if (commentIndex >= 0) {
        let precedingChars = lines[i].substring(0, commentIndex);
        if (/[:,]\s*$/.test(precedingChars)) {
          // Comment appears after a JSON value, remove only the comment
          lines[i] = lines[i].substring(0, commentIndex);
        }
      }
    }

    fixedString = lines.join('\n');

    // Replace single quotes with double quotes
    fixedString = fixedString.replace(/'/g, '"');

    // Handle mismatched quotes
    fixedString = fixedString.replace(/"([^"]*)'(?![^"]*")/g, '"$1"');
    fixedString = fixedString.replace(/(?<![^"]*')'([^"]*)"/g, '"$1"');

    // Wrap unquoted property names with double quotes
    fixedString = fixedString.replace(
      /([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g,
      '$1"$2"$3'
    );

    // Fix unquoted values (except true, false, and null) by wrapping them with quotes
    fixedString = fixedString.replace(
      /(:\s*)([^"{}\[\],\s]+)(?=\s*[,\]}])/g,
      (match, p1, p2) => {
        if (['true', 'false', 'null'].includes(p2)) return match;
        return `${p1}"${p2}"`;
      }
    );

    // Remove any trailing commas
    fixedString = fixedString.replace(/,\s*([\]}])/g, '$1');

    return fixedString;
  } catch (error) {
    throw new Error('Failed to fix JSON parsing issues');
  }
}
