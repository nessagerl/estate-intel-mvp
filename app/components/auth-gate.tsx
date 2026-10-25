'use client';
import {useEffect,useState} from 'react';
import {usePathname} from 'next/navigation';
import {supabaseBrowser} from '@/lib/supabase-browser';
import AuthRequired from '@/app/components/auth-required';
export default function AuthGate({children}:{children:React.ReactNode}){
 const pathname=usePathname();const[status,setStatus]=useState<'loading'|'in'|'out'>('loading');
 useEffect(()=>{let active=true;supabaseBrowser.auth.getSession().then(({data})=>{if(active)setStatus(data.session?'in':'out')}).catch(()=>{if(active)setStatus('out')});const {data:sub}=supabaseBrowser.auth.onAuthStateChange((_event,session)=>{if(active)setStatus(session?'in':'out')});return()=>{active=false;sub.subscription.unsubscribe()}},[]);
 if(pathname==='/'||pathname==='/auth'||pathname.startsWith('/auth/'))return <>{children}</>;
 if(status==='loading')return <main className="mx-auto max-w-xl p-8">Checking your session…</main>;
 if(status==='out')return <AuthRequired/>;
 return <>{children}</>;
}
