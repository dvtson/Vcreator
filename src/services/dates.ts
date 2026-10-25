import { TimeStatus } from '../types';
export function challengeTimeStatus(date: string, now = Date.now()): TimeStatus {
  // Campaign dates are Vietnam calendar dates, independent of the viewer's device timezone.
  const start=Date.parse(`${date}T00:00:00+07:00`);
  const end=start+7*24*60*60*1000;
  if(now<start)return 'upcoming';
  return now>=end?'ended':'ongoing';
}
export function isCalendarDate(value:string):boolean {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const date=new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10)===value;
}
