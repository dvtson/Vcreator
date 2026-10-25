import React, { Suspense } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter, Routes, Route } from 'react-router-dom';
import { PublicRenderProvider } from '../context/DataContext';
import { UserLayout } from '../components/layout/UserLayout';
import { HomePage } from '../pages/public/HomePage';
import type { PublicSnapshot } from '../services/publicSnapshot';
export function renderHome(snapshot:PublicSnapshot):string {
  return renderToString(<PublicRenderProvider snapshot={snapshot}><StaticRouter location="/"><Suspense fallback={null}><Routes><Route element={<UserLayout/>}><Route path="/" element={<HomePage/>}/></Route></Routes></Suspense></StaticRouter></PublicRenderProvider>);
}
