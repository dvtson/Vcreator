import { useMemo } from 'react';
import { sanitizeHTML } from '../../services/sanitizeHTML';
interface SafeHTMLProps { html: string; className?: string; }
export const SafeHTML = ({html, className=''}: SafeHTMLProps) => {
  const safe=useMemo(()=>sanitizeHTML(html),[html]);
  return <div className={`rich-text-content ${className}`} dangerouslySetInnerHTML={{__html:safe}} />;
};
