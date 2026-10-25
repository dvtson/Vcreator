import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ProgramInfo, Challenge, AwardItem, FeaturedIndividual, FeaturedContent, FaqItem, LeaderboardPeriod } from '../types';
import { getProgramInfo, getChallenges, getAwards, getFeaturedIndividuals, getFeaturedContents, getFaqs, getLeaderboards, DATA_CHANGED_EVENT } from '../services/storageService';
import { initialProgramInfo } from '../services/seedData';
import { useAuth } from '../hooks/useAuth';
import { cloudEnabled } from '../services/firebase';
import { readPublicSnapshot, writePublicSnapshot } from '../services/publicSnapshot';
import { publicContentRows, invalidatePublicContent } from '../services/publicContentApi';
import type { ContentStore } from '../services/cloudModel';
import type { PublicSnapshot } from '../services/publicSnapshot';
import { serverSnapshot } from '../services/serverSnapshot';
import { cloudErrorMessage } from '../services/serviceErrors';

interface DataContextType {
  programInfo: ProgramInfo;
  challenges: Challenge[]; allChallenges: Challenge[];
  awards: AwardItem[]; allAwards: AwardItem[];
  featuredIndividuals: FeaturedIndividual[]; allFeaturedIndividuals: FeaturedIndividual[];
  featuredContents: FeaturedContent[]; allFeaturedContents: FeaturedContent[];
  faqs: FaqItem[]; allFaqs: FaqItem[];
  leaderboards: LeaderboardPeriod[];
  publicReady: boolean; loading: boolean; loadError: string; refreshData: () => Promise<void>;
}
const emptyInfo: ProgramInfo = {...initialProgramInfo, title:'VRB CREATOR',heroDescription:'',submissionFormUrl:'',zaloGroupUrl:'',isSubmissionActive:false,isZaloActive:false};
const DataContext = createContext<DataContextType>({ programInfo:emptyInfo,challenges:[],allChallenges:[],awards:[],allAwards:[],featuredIndividuals:[],allFeaturedIndividuals:[],featuredContents:[],allFeaturedContents:[],faqs:[],allFaqs:[],leaderboards:[],publicReady:false,loading:true,loadError:'',refreshData:async()=>{} });
export function PublicRenderProvider({snapshot,children}:{snapshot:PublicSnapshot;children:React.ReactNode}) {
  return <DataContext.Provider value={{programInfo:snapshot.info,challenges:snapshot.challenges,allChallenges:snapshot.challenges,awards:snapshot.awards,allAwards:snapshot.awards,featuredIndividuals:snapshot.individuals,allFeaturedIndividuals:snapshot.individuals,featuredContents:snapshot.contents,allFeaturedContents:snapshot.contents,faqs:snapshot.faqs,allFaqs:snapshot.faqs,leaderboards:snapshot.boards,publicReady:true,loading:false,loadError:'',refreshData:async()=>{}}}>{children}</DataContext.Provider>;
}
function stable<T>(previous:T,next:T):T{return JSON.stringify(previous)===JSON.stringify(next)?previous:next;}
export const DataProvider: React.FC<{children:React.ReactNode}> = ({children}) => {
  const auth = useAuth();
  const bootstrap=serverSnapshot();
  const [programInfo,setProgramInfo]=useState<ProgramInfo>(bootstrap?.info ?? emptyInfo);
  const [allChallenges,setAllChallenges]=useState<Challenge[]>(bootstrap?.challenges ?? []);
  const [allAwards,setAllAwards]=useState<AwardItem[]>(bootstrap?.awards ?? []);
  const [allFeaturedIndividuals,setAllFeaturedIndividuals]=useState<FeaturedIndividual[]>(bootstrap?.individuals ?? []);
  const [allFeaturedContents,setAllFeaturedContents]=useState<FeaturedContent[]>(bootstrap?.contents ?? []);
  const [allFaqs,setAllFaqs]=useState<FaqItem[]>([]);
  const [leaderboards,setLeaderboards]=useState<LeaderboardPeriod[]>([]);
  const [loading,setLoading]=useState(true);const [loadError,setLoadError]=useState('');
  const [publicReady,setPublicReady]=useState(Boolean(bootstrap));
  const freshContent=useRef(false);
  const request=useRef(0);
  const applySnapshot=(snapshot:PublicSnapshot)=>{
    setProgramInfo(snapshot.info);setAllChallenges(snapshot.challenges);setAllAwards(snapshot.awards);
    setAllFeaturedIndividuals(snapshot.individuals);setAllFeaturedContents(snapshot.contents);setAllFaqs(snapshot.faqs);setLeaderboards(snapshot.boards);setPublicReady(true);
  };
  const loadAll=useCallback(async()=>{
    const usePublicApi=cloudEnabled && import.meta.env.PROD && !window.location.pathname.startsWith('/admin');
    if(!auth.ready && !usePublicApi)return;
    const token=++request.current;
    try{
      const includePrivate=Boolean(auth.user && auth.user.role !== 'reviewer');
      const accept=<T,>(value:T,setter:React.Dispatch<React.SetStateAction<T>>)=>{
        if(token===request.current){freshContent.current=true;setter(previous=>stable(previous,value));}
        return value;
      };
      const read=<T,>(store:ContentStore,fallback:()=>Promise<T[]>):Promise<T[]>=>usePublicApi ? publicContentRows<T>(store).catch(fallback) : fallback();
      const infoRequest=usePublicApi ? publicContentRows<ProgramInfo>('program_info').then(rows=>{if(!rows[0])throw new Error('Chưa có dữ liệu chương trình.');return rows[0];}).catch(()=>getProgramInfo()) : getProgramInfo();
      const [info,challenges,awards,individuals,contents,faqs,boards]=await Promise.all([
        infoRequest.then(value=>{accept(value,setProgramInfo);if(token===request.current)setPublicReady(true);return value;}),
        read('challenges',()=>getChallenges(includePrivate)).then(value=>accept(value,setAllChallenges)),
        read('awards',()=>getAwards(includePrivate)).then(value=>accept(value,setAllAwards)),
        read('featured_individuals',()=>getFeaturedIndividuals(includePrivate)).then(value=>accept(value,setAllFeaturedIndividuals)),
        read('featured_contents',()=>getFeaturedContents(includePrivate)).then(value=>accept(value,setAllFeaturedContents)),
        read('faqs',()=>getFaqs(includePrivate)).then(value=>accept(value,setAllFaqs)),
        read('leaderboards',()=>getLeaderboards()).then(value=>accept(value,setLeaderboards)),
      ]);
      if(token!==request.current)return;
      setLoadError('');
      // Cache only anonymous public reads, never private admin datasets.
      if(cloudEnabled && (usePublicApi || !auth.user))void writePublicSnapshot({info,challenges,awards,individuals,contents,faqs,boards});
    }catch(error){if(token===request.current)setLoadError(cloudErrorMessage(error));}
    finally{if(token===request.current)setLoading(false);}
  },[auth.ready,auth.user?.uid,auth.user?.role]);
  useEffect(()=>{
    setLoading(true);setPublicReady(false);setProgramInfo(emptyInfo);freshContent.current=false;++request.current;
    // Clear private collections on account changes before any new public request returns.
    setAllChallenges([]);setAllAwards([]);setAllFeaturedIndividuals([]);setAllFeaturedContents([]);setAllFaqs([]);setLeaderboards([]);
    if(bootstrap && !window.location.pathname.startsWith('/admin'))applySnapshot(bootstrap);
    void loadAll();
    const refresh=()=>{invalidatePublicContent();void loadAll();};
    const storage=(event:StorageEvent)=>{if(!cloudEnabled && event.key===DATA_CHANGED_EVENT)refresh();};
    const focus=()=>{if(!cloudEnabled && !window.location.pathname.startsWith('/admin'))refresh();};
    let active=true;let stop=()=>{};
    if(cloudEnabled)void readPublicSnapshot().then(snapshot=>{if(active && snapshot && !freshContent.current)applySnapshot(snapshot);});
    const fastPublic=cloudEnabled && import.meta.env.PROD && !window.location.pathname.startsWith('/admin');
    const poll=fastPublic ? window.setInterval(()=>{if(document.visibilityState==='visible')refresh();},30_000) : undefined;
    if(cloudEnabled && !fastPublic)void import('../services/cloudStore').then(({subscribeCloudChanges})=>{if(active)stop=subscribeCloudChanges(()=>{window.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT));},error=>setLoadError(cloudErrorMessage(error)));}).catch(error=>{if(active)setLoadError(cloudErrorMessage(error));});
    window.addEventListener(DATA_CHANGED_EVENT,refresh);window.addEventListener('storage',storage);window.addEventListener('focus',focus);
    return()=>{active=false;++request.current;stop();if(poll!==undefined)window.clearInterval(poll);window.removeEventListener(DATA_CHANGED_EVENT,refresh);window.removeEventListener('storage',storage);window.removeEventListener('focus',focus);};
  },[loadAll]);
  const visible = <T extends {status:string}>(rows:T[])=>rows.filter(row=>row.status==='published');
  return <DataContext.Provider value={{programInfo,challenges:visible(allChallenges),allChallenges,awards:visible(allAwards),allAwards,featuredIndividuals:visible(allFeaturedIndividuals),allFeaturedIndividuals,featuredContents:visible(allFeaturedContents),allFeaturedContents,faqs:visible(allFaqs),allFaqs,leaderboards,publicReady,loading,loadError,refreshData:loadAll}}>{children}</DataContext.Provider>;
};
export function useData(){return useContext(DataContext);}
