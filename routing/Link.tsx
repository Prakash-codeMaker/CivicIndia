import React from 'react';
import { useRouter } from './RouterContext';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: React.ReactNode;
}

const Link: React.FC<LinkProps> = ({ to, children, className, onClick, ...props }) => {
  const { navigate } = useRouter();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    if (onClick) {
      onClick(event);
    }

    // Normalize `to`: remove any leading '#', ensure exactly one leading '/'
    let raw = to || '/';
    if (raw.startsWith('#')) raw = raw.slice(1);
    if (!raw.startsWith('/')) raw = '/' + raw;

    // Debug navigation intents
    // eslint-disable-next-line no-console
    console.debug('[Link] clicked', { original: to, normalized: raw });

    navigate(raw);
  };

  // Build href from normalized `to` so the browser shows a consistent hash-based URL
  let href = to || '/';
  if (href.startsWith('#')) href = href.slice(1);
  if (!href.startsWith('/')) href = '/' + href;
  href = `#${href}`;

  return (
    <a href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
};

export default Link;