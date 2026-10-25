import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ProgramInfo, Challenge, AwardItem, FeaturedIndividual, FeaturedContent, FaqItem, LeaderboardPeriod } from '../types';
import { getProgramInfo, getChallenges, getAwards, getFeaturedIndividuals, getFeaturedContents, getFaqs, getLeaderboards, DATA_CHANGED_EVENT } from '../services/storageService';
import { initialProgramInfo } from '../services/seedData';
import { useAuth } from '../hooks/useAuth';
import { cloudEnabled } from '../services/firebase';
import { cloudErrorMessage } from '../services/serviceErrors';

interface DataContextType {
  programInfo: ProgramInfo;
  challenges: Challenge[]; allChallenges: Challenge[];
  awards: AwardItem[]; allAwards: AwardItem[];
  featuredIndividuals: FeaturedIndividual[]; allFeaturedIndividuals: FeaturedIndividual[];
  featuredContents: FeaturedContent[]; allFeaturedContents: FeaturedContent[];
  faqs: FaqItem[]; allFaqs: FaqItem[];
  leaderboards: LeaderboardPeriod[];
  loading: boolean; loadError: string; refreshData: () => Promise<void>;
}
const emptyInfo: ProgramInfo = {...initialProgramInfo, title:'VRB CREATOR',heroDescription:'',submissionFormUrl:'',zaloGroupUrl:'',isSubmissionActive:false,isZaloActive:false};
const DataContext = createContext<DataContextType>({ programInfo:emptyInfo,challenges:[],allChallenges:[],awards:[],allAwards:[],featuredIndividuals:[],allFeaturedIndividuals:[],featuredContents:[],allFeaturedContents:[],faqs:[],allFaqs:[],leaderboards:[],loading:true,loadError:'',refreshData:async()=>{} });
function stable<T>(previous:T,next:T):T{return JSON.stringify(previous)===JSON.stringify(next)?previous:next;}
export const DataProvider: React.FC<{children:React.ReactNode}> = ({children}) => {
  const auth = useAuth();
  const [programInfo,setProgramInfo]=useState<ProgramInfo>(emptyInfo);
  const [allChallenges,setAllChallenges]=useState<Challenge[]>([]);
  const [allAwards,setAllAwards]=useState<AwardItem[]>([]);
  const [allFeaturedIndividuals,setAllFeaturedIndividuals]=useState<FeaturedIndividual[]>([]);
  const [allFeaturedContents,setAllFeaturedContents]=useState<FeaturedContent[]>([]);
  const [allFaqs,setAllFaqs]=useState<FaqItem[]>([]);
  const [leaderboards,setLeaderboards]=useState<LeaderboardPeriod[]>([]);
  const [loading,setLoading]=useState(true);const [loadError,setLoadError]=useState('');
  const request=useRef(0);
  const loadAll=useCallback(async()=>{
    if(!auth.ready)return;
    const token=++request.current;
    try{
      const includePrivate=Boolean(auth.user && auth.user.role !== 'reviewer');
      const [info,challenges,awards,individuals,contents,faqs,boards]=await Promise.all([
        getProgramInfo(),getChallenges(includePrivate),getAwards(includePrivate),getFeaturedIndividuals(includePrivate),getFeaturedContents(includePrivate),getFaqs(includePrivate),getLeaderboards(),
      ]);
      if(token!==request.current)return;
      setProgramInfo(previous=>stable(previous,info));
      setAllChallenges(previous=>stable(previous,challenges));setAllAwards(previous=>stable(previous,awards));
      setAllFeaturedIndividuals(previous=>stable(previous,individuals));setAllFeaturedContents(previous=>stable(previous,contents));
      setAllFaqs(previous=>stable(previous,faqs));setLeaderboards(previous=>stable(previous,boards));setLoadError('');
    }catch(error){if(token===request.current)setLoadError(cloudErrorMessage(error));}
    finally{if(token===request.current)setLoading(false);}
  },[auth.ready,auth.user?.uid,auth.user?.role]);
  useEffect(()=>{
    setLoading(true);++request.current;
    // Clear private collections on account changes before any new public request returns.
    setAllChallenges([]);setAllAwards([]);setAllFeaturedIndividuals([]);setAllFeaturedContents([]);setAllFaqs([]);setLeaderboards([]);
    void loadAll();
    const refresh=()=>{void loadAll();};
    const storage=(event:StorageEvent)=>{if(!cloudEnabled && event.key===DATA_CHANGED_EVENT)refresh();};
    const focus=()=>{if(!cloudEnabled && !window.location.pathname.startsWith('/admin'))refresh();};
    let active=true;let stop=()=>{};
    if(cloudEnabled)void import('../services/cloudStore').then(({subscribeCloudChanges})=>{if(active)stop=subscribeCloudChanges(()=>{window.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT));},error=>setLoadError(cloudErrorMessage(error)));}).catch(error=>{if(active)setLoadError(cloudErrorMessage(error));});
    window.addEventListener(DATA_CHANGED_EVENT,refresh);window.addEventListener('storage',storage);window.addEventListener('focus',focus);
    return()=>{active=false;++request.current;stop();window.removeEventListener(DATA_CHANGED_EVENT,refresh);window.removeEventListener('storage',storage);window.removeEventListener('focus',focus);};
  },[loadAll]);
  const visible = <T extends {status:string}>(rows:T[])=>rows.filter(row=>row.status==='published');
  return <DataContext.Provider value={{programInfo,challenges:visible(allChallenges),allChallenges,awards:visible(allAwards),allAwards,featuredIndividuals:visible(allFeaturedIndividuals),allFeaturedIndividuals,featuredContents:visible(allFeaturedContents),allFeaturedContents,faqs:visible(allFaqs),allFaqs,leaderboards,loading,loadError,refreshData:loadAll}}>{children}</DataContext.Provider>;
};
export function useData(){return useContext(DataContext);}
