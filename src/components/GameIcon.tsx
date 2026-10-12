import { cx } from './cx.ts';

export interface GameIconProps {
  /** Item or building class name, e.g. `Desc_IronPlate_C`. */
  id: string;
  /** 16 inline in tables and badges, 20 in chips and lists, 32 in headers and cards. */
  size?: 16 | 20 | 32;
  className?: string;
}

/**
 * A game icon served from `public/icons/` (built by `data:build-icons`).
 * Decorative: always render the text name beside it (DESIGN.md "Game icons").
 */
export function GameIcon({ id, size = 20, className }: GameIconProps) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}icons/${id}.webp`}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={cx('inline-block shrink-0', className)}
    />
  );
}
