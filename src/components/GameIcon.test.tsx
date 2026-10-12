import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GameIcon } from './GameIcon.tsx';
import { ItemAmounts } from './ItemAmounts.tsx';

describe('GameIcon', () => {
  it('renders a decorative local image at the requested size', () => {
    const { container } = render(<GameIcon id="Desc_IronPlate_C" size={32} />);
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('alt', '');
    expect(img).toHaveAttribute('src', '/icons/Desc_IronPlate_C.webp');
    expect(img).toHaveAttribute('width', '32');
    expect(img).toHaveAttribute('height', '32');
  });

  it('sits beside the text name in item chips, never instead of it', () => {
    const { container } = render(
      <ItemAmounts items={[{ item: 'Desc_IronPlate_C', amount: 10 }]} />,
    );
    expect(screen.getByText('Iron Plate')).toBeInTheDocument();
    expect(container.querySelector('li img')).toHaveAttribute('width', '20');
  });
});
