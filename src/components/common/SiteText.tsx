import { useData } from '../../context/DataContext';
import { siteTextCatalog } from '../../services/siteTextCatalog';
const defaults = new Map<string, string>(siteTextCatalog.map(item => [item.id, item.text]));
export function SiteText({ id }: { id: string }) {
  const { programInfo } = useData();
  const value = programInfo.siteText?.[id] ?? defaults.get(id) ?? '';
  return <>{value ? ` ${value} ` : ''}</>;
}

export function useSiteText() {
  const {programInfo}=useData();
  return (id:string)=>programInfo.siteText?.[id] ?? defaults.get(id) ?? '';
}
