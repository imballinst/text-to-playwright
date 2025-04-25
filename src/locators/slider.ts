import { Locator, Page } from '@playwright/test';

export const VALID_SLIDER_LOCATORS = [
  { selector: 'input[type=range]', valueAttribute: 'value' },
  { selector: 'span[data-slot=slider-thumb]', valueAttribute: 'aria-valuenow' }
];

interface SliderThumb {
  /* For example, in shadcn, `span[data-slot=slider-thumb]`. */
  locator: string;
  /* For example, in shadcn, `aria-valuenow`. */
  valueAttribute: string;
  /**
   * For example, in shadcn, `aria-valuemin`.
   * @default "min"
   */
  minAttribute: string;
  /**
   * For example, in shadcn, `aria-valuemax`.
   * @default "max"
   */
  maxAttribute: string;
}

export class SliderLocator {
  private page: Page;
  private thumbInfo: SliderThumb | undefined;

  slider: Locator;
  min = 0;
  max = 100;

  constructor(page: Page, locator: Locator, thumbLocator?: SliderThumb) {
    this.page = page;
    this.slider = locator;
    this.thumbInfo = thumbLocator;
  }

  async initSliderAttributes() {
    let locator = this.slider;
    let minAttribute: string | undefined;
    let maxAttribute: string | undefined;

    if (this.thumbInfo) {
      locator = this.page.locator(this.thumbInfo.locator).first();
      minAttribute = this.thumbInfo?.minAttribute;
      maxAttribute = this.thumbInfo?.maxAttribute;
    }

    this.min = Number(await locator.getAttribute(minAttribute ?? 'min'));
    this.max = Number(await locator.getAttribute(maxAttribute ?? 'max'));
  }

  private async getSliderValue() {
    let locator = this.slider;
    let valueAttribute = 'value';

    if (this.thumbInfo) {
      locator = this.page.locator(this.thumbInfo.locator).first();
      valueAttribute = this.thumbInfo?.valueAttribute;
    }

    return Number(await locator.getAttribute(valueAttribute));
  }

  async move(targetValue: number) {
    const { sliderPageX, thumbX, thumbY, width } = await this.getSliderPositions();
    let targetThumbX = sliderPageX + (width * targetValue) / this.max;
    let value = await this.getSliderValue();

    await this.page.mouse.move(thumbX, thumbY);
    await this.slider.hover();
    await this.page.mouse.down();
    await this.slider.hover();
    await this.page.mouse.move(targetThumbX, thumbY);

    targetThumbX = sliderPageX + (width * targetValue) / this.max;
    value = await this.getSliderValue();

    const initial = targetThumbX;

    // Manual correction.
    // TODO: evaluate this. Not sure why this happens?
    let behavior: string | undefined;
    let inc = 1;

    while (value !== targetValue) {
      if (value > targetValue) {
        if (behavior === 'inc') {
          behavior = 'dec';
          inc = inc / 2;
        } else if (!behavior) {
          behavior = 'dec';
        }

        targetThumbX -= inc;
      } else if (value < targetValue) {
        if (behavior === 'dec') {
          behavior = 'inc';
          inc = inc / 2;
        } else if (!behavior) {
          behavior = 'inc';
        }

        targetThumbX += inc;
      }

      await this.page.mouse.move(targetThumbX, thumbY);
      value = await this.getSliderValue();
    }

    await this.page.mouse.up();
    return initial - targetThumbX;
  }

  private async getSliderPositions() {
    const bb = (await this.slider.boundingBox())!;
    const value = await this.getSliderValue();

    const sliderPageX = bb.x;

    const sliderX = (bb.width * value) / this.max;
    const sliderY = bb.height / 2;

    const thumbX = sliderPageX + sliderX;
    const thumbY = bb.y + sliderY;

    return { width: bb.width, sliderPageX, thumbX, thumbY };
  }
}
