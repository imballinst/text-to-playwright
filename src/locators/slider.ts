import { Locator, Page } from '@playwright/test';
import { AriaRole } from '../types/aria';

// Helper functions.
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

type SliderSelector =
  | {
      kind: 'role';
      role: AriaRole;
      name: string;
      thumb?: SliderThumb;
    }
  | {
      kind: 'label';
      label: string;
      thumb?: SliderThumb;
    };

export class SliderLocator {
  private page: Page;
  private slider: Locator;
  private thumbInfo: SliderThumb | undefined;

  min = 0;
  max = 100;

  constructor(page: Page, selector: SliderSelector) {
    this.page = page;

    if (selector.kind === 'label') {
      this.slider = page.getByLabel(selector.label).first();
    } else {
      this.slider = page.getByRole(selector.role, { name: selector.name }).first();
    }

    this.thumbInfo = selector.thumb;
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

  async getSliderValue() {
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
    console.info(targetValue);

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
      console.info(targetThumbX, value, targetValue, inc);
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

  async getSliderPositions() {
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
