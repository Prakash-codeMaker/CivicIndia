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
    
    // The path passed to navigate should be clean (e.g. /report)
    const path = to.startsWith('/') ? to : '/' + to;
    navigate(path);
  };

  // The href for the browser should be a full hash-based URL
  const href = `#${to.startsWith('/') ? to : '/' + to}`;

  return (
    <a href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
};

export default Link;