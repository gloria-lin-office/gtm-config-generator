import {
  Parameter,
  Tag,
  TagConfig,
  Trigger,
  TriggerConfig,
} from '../../../../interfaces/gtm-config-generator';
import { isBuiltInEvent } from '../../utilities/event-utils';
import { createTag } from '../tags/event-tag';
import { createGA4Configuration } from '../tags/ga4-configuration-tag';
import { createScrollTag } from '../tags/scroll-tag';
import { createVideoTag } from '../tags/video-tag';

export class TagManager {
  tags: Tag[] = [];

  formatSingleTag(
    formattedParams: Parameter[],
    eventName: string,
    triggers: Trigger[],
    data: object,
  ) {
    if (isBuiltInEvent(eventName)) {
      return;
    }
    this.addTagIfNotExists(eventName, formattedParams, triggers, data);
  }

  addTagIfNotExists(
    eventName: string,
    formattedParams: Parameter[],
    triggers: Trigger[],
    data: object
  ) {
    if (!this.tags.some((tag) => tag.name === eventName) && triggers) {
      this.tags.push({
        name: eventName,
        parameters: formattedParams,
        triggers: [triggers.find((trigger) => trigger.name === eventName)!],
        data: data
      });
    }
  }

  getTags() {
    return this.tags;
  }

  getAllTags(
    googleTagName: string,
    measurementId: string,
    measurementIdVariable: string,
    accountId: string,
    containerId: string,
    data: Record<string, string>[],
    triggers: TriggerConfig[],
    tags: Tag[],
    dataLayers: string[]
  ): TagConfig[] {
    return [
      // config tag
      createGA4Configuration(
        googleTagName,
        measurementId,
        measurementIdVariable,
        accountId,
        containerId
      ),
      // normal tags
      ...tags.map((tag) => {
        return createTag(
          measurementIdVariable,
          accountId,
          containerId,
          tag,
          dataLayers,
          triggers
        );
      }),
      // built-in tags. Currently only video and scroll
      ...createVideoTag(googleTagName, accountId, containerId, data, triggers),
      ...createScrollTag(googleTagName, accountId, containerId, data, triggers),
    ].map((_data, index) => ({
      ..._data,
      tagId: (index + 1).toString(),
    }));
  }
}
