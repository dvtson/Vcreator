import React, {createContext,useContext} from 'react';
import type {PublicSnapshot} from '../services/publicSnapshot';
function value(snapshot:PublicSnapshot){return {programInfo:snapshot.info,challenges:snapshot.challenges,allChallenges:snapshot.challenges,awards:snapshot.awards,allAwards:snapshot.awards,featuredIndividuals:snapshot.individuals,allFeaturedIndividuals:snapshot.individuals,featuredContents:snapshot.contents,allFeaturedContents:snapshot.contents,faqs:snapshot.faqs,allFaqs:snapshot.faqs,leaderboards:snapshot.boards,publicReady:true,loading:false,loadError:'',refreshData:async()=>{}};}
const Context=createContext<ReturnType<typeof value>|null>(null);
export function PublicRenderProvider({snapshot,children}:{snapshot:PublicSnapshot;children:React.ReactNode}){return <Context.Provider value={value(snapshot)}>{children}</Context.Provider>;}
export function useData(){const data=useContext(Context);if(!data)throw Error('Missing public context');return data;}
