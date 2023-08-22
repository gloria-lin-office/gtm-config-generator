import { ElementRef } from '@angular/core';

export function setInitialScrollTop(elementRef: ElementRef) {
  const observer = new MutationObserver(() => {
    const element = elementRef.nativeElement;
    if (element.scrollHeight > 0) {
      element.scrollTop = element.scrollHeight;
      observer.disconnect(); // Disconnect after setting scrollTop
    }
  });

  observer.observe(elementRef.nativeElement, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false,
  });
}
