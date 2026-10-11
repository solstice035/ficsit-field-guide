import { describe, expect, it } from 'vitest';
import {
  chunk,
  iconSourceFor,
  isIconCategory,
  resolveWikiPages,
  type WikiQueryResponse,
} from './icons.ts';

describe('icon source selection', () => {
  it('defaults to the wiki file named after the display name', () => {
    expect(iconSourceFor({ id: 'Desc_IronPlate_C', name: 'Iron Plate' }, {})).toEqual({
      kind: 'wiki',
      title: 'File:Iron Plate.png',
    });
  });

  it('applies an override by class name', () => {
    const overrides = {
      Build_Converter_C: { kind: 'satisfactory-tools', path: 'desc-converter-c_256.png' },
    } as const;
    expect(iconSourceFor({ id: 'Build_Converter_C', name: 'Converter' }, overrides)).toEqual(
      overrides.Build_Converter_C,
    );
  });
});

describe('icon categories', () => {
  it('accepts item, fluid, building and vehicle icon categories', () => {
    expect(isIconCategory(['Category:Item icons'])).toBe(true);
    expect(isIconCategory(['Category:Vehicle icons'])).toBe(true);
  });

  it('rejects the wiki placeholder and screenshots', () => {
    expect(isIconCategory(['Category:FP icons'])).toBe(false);
    expect(isIconCategory(['Category:Building screenshots'])).toBe(false);
    expect(isIconCategory([])).toBe(false);
  });
});

describe('resolving wiki pages', () => {
  const response: WikiQueryResponse = {
    query: {
      normalized: [{ from: 'File:Iron_Plate.png', to: 'File:Iron Plate.png' }],
      redirects: [{ from: 'File:Factory Cart™.png', to: 'File:Factory Cart.png' }],
      pages: [
        {
          title: 'File:Iron Plate.png',
          imageinfo: [{ url: 'https://example.test/Iron_Plate.png', width: 256 }],
          categories: [{ title: 'Category:Item icons' }],
        },
        {
          title: 'File:Factory Cart.png',
          imageinfo: [{ url: 'https://example.test/Factory_Cart.png', width: 256 }],
          categories: [{ title: 'Category:Vehicle icons' }],
        },
        { title: 'File:Nope.png', missing: true },
      ],
    },
  };

  it('follows normalisation and redirects back to the requested title', () => {
    const pages = resolveWikiPages(
      ['File:Iron_Plate.png', 'File:Factory Cart™.png', 'File:Nope.png'],
      response,
    );
    expect(pages.get('File:Iron_Plate.png')).toEqual({
      title: 'File:Iron Plate.png',
      url: 'https://example.test/Iron_Plate.png',
      width: 256,
      categories: ['Category:Item icons'],
    });
    expect(pages.get('File:Factory Cart™.png')?.title).toBe('File:Factory Cart.png');
    expect(pages.has('File:Nope.png')).toBe(false);
  });
});

describe('chunk', () => {
  it('splits into fixed-size batches', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(chunk([], 50)).toEqual([]);
  });
});
