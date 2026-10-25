// Parse HTML into an inert document and copy only the elements and attributes the editor needs.
export function sanitizeHTML(html: string): string {
  const source = new DOMParser().parseFromString(html, 'text/html');
  const allowed = new Set(['P','BR','STRONG','B','EM','I','U','S','UL','OL','LI','H1','H2','H3','H4','BLOCKQUOTE','A','TABLE','THEAD','TBODY','TR','TH','TD','HR','SPAN','DIV','IMG']);
  const blocked = new Set(['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','SVG','MATH','FORM','INPUT','BUTTON','TEXTAREA','SELECT','TEMPLATE','LINK','META','BASE']);
  const clean = (node: Node): Node | null => {
    if(node.nodeType===Node.TEXT_NODE)return document.createTextNode(node.textContent||'');
    if(!(node instanceof Element) || blocked.has(node.tagName))return null;
    const children = Array.from(node.childNodes).map(clean).filter((item): item is Node=>item!==null);
    if(!allowed.has(node.tagName)){const fragment=document.createDocumentFragment();fragment.append(...children);return fragment;}
    const output=document.createElement(node.tagName.toLowerCase());
    if(node.tagName==='IMG') {
      const src=node.getAttribute('src')||'';
      if(!/^https?:\/\/[^\s]+$/i.test(src) && !/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(src))return null;
      output.setAttribute('src',src);output.setAttribute('alt',node.getAttribute('alt')||'');
      output.setAttribute('loading','lazy');output.style.maxWidth='100%';
    }
    if(node.tagName==='A') {
      const href=node.getAttribute('href')?.trim()||'';
      if(/^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(href)) output.setAttribute('href',href);
      output.setAttribute('target','_blank');output.setAttribute('rel','noopener noreferrer');
    }
    if(node.tagName==='TD'||node.tagName==='TH')for(const attr of ['colspan','rowspan']){const value=node.getAttribute(attr);if(value && /^\d{1,2}$/.test(value))output.setAttribute(attr,value);}
    const align=(node as HTMLElement).style.textAlign;
    if(['left','center','right','justify'].includes(align))output.style.textAlign=align;
    output.append(...children);return output;
  };
  const result=document.createElement('div');
  for(const node of Array.from(source.body.childNodes)){const safe=clean(node);if(safe)result.append(safe);}
  return result.innerHTML;
}
