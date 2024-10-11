import {
  BUILT_IN_EVENTS,
  BUILT_IN_SCROLL_EVENT,
  BUILT_IN_VIDEO_EVENTS,
  ECOMMERCE_ATTR_KEYS,
  ECOMMERCE_ATTR_KEYS_WITH_EC
} from '../gtm-json-manager/constant';

export function isBuiltInEvent(eventName: string): boolean {
  return BUILT_IN_EVENTS.some((_event) => eventName.includes(_event));
}

export function isIncludeVideo(data: Record<string, string>[]): boolean {
  return data.some((record) =>
    BUILT_IN_VIDEO_EVENTS.includes(record['eventName'])
  );
}

export function isIncludeScroll(data: Record<string, string>[]): boolean {
  return data.some((record) =>
    BUILT_IN_SCROLL_EVENT.includes(record['eventName'])
  );
}

export function isBuiltInEcommerceAttr(attrKey: string): boolean {
  return ECOMMERCE_ATTR_KEYS.some((_attr) => attrKey==_attr);
}
export function isBuiltInEcommerceAttrWithEcommercePrefix(attrKey: string): boolean {
  return ECOMMERCE_ATTR_KEYS_WITH_EC.some((_attr) => attrKey==_attr);
}