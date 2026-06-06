/**
 * useCamPay.ts — Hardened Payment Hook · Bambeh SARL
 */
import { useState, useRef, useCallback, useEffect } from 'react';

const SUPABASE_URL  = (import.meta.env.VITE_SUPABASE_URL      as string) ?? '';
const SUPABASE_ANON = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? '';
const COLLECT_URL   = `${SUPABASE_URL}/functions/v1/campay-collect`;
const STATUS_URL    = (ref: string) => `${SUPABASE_URL}/functions/v1/campay-status?reference=${encodeURIComponent(ref)}`;

const REQUEST_TIMEOUT_MS  = 25_000;
const MAX_RETRIES         = 3;
const RETRY_BASE_DELAY_MS = 1_200;
const POLL_INTERVAL_MS    = 5_000;
const POLL_MAX_ATTEMPTS   = 18;
const RATE_LIMIT_MAX      = 3;
const RATE_LIMIT_WINDOW   = 10 * 60 * 1_000;
const RATE_LIMIT_KEY      = 'beh_pay_attempts';
const MIN_AMOUNT_XAF      = 100;
const MAX_AMOUNT_XAF      = 5_000_000;

export type PaymentStatus   = 'idle'|'initiating'|'pending'|'confirmed'|'failed'|'timeout';
export type PaymentErrorCode= 'NETWORK_ERROR'|'SERVER_ERROR'|'VALIDATION_ERROR'|'RATE_LIMITED'|'TIMEOUT'|'CANCELLED'|'UNKNOWN';
export interface PaymentBreakdown { subtotal:number; appFee:number; govTax:number; total:number; currency:'XAF'; }
export interface PaymentResult { success:boolean; reference?:string; status?:PaymentStatus; error?:string; errorCode?:PaymentErrorCode; breakdown?:PaymentBreakdown; }

async function generateSecureRef(): Promise<string> {
  const ts  = Date.now().toString(36).toUpperCase();
  const buf = new Uint8Array(4); crypto.getRandomValues(buf);
  const rand= Array.from(buf).map(b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();
  return `BEH-${ts}-${rand}`;
}
async function generateNonce(): Promise<string> {
  const buf = new Uint8Array(8); crypto.getRandomValues(buf);
  return `${Date.now()}.${Array.from(buf).map(b=>b.toString(16).padStart(2,'0')).join('')}`;
}
function validatePhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g,'').replace(/^(\+237|237)/,'');
  if (!/^6[5-9]\d{7}$/.test(cleaned))
    throw Object.assign(new Error('Invalid phone number. Use a Cameroon MTN or Orange number (e.g. 6XXXXXXXX).'),{code:'VALIDATION_ERROR'});
  return cleaned;
}
function validateAmount(amount: number): void {
  if (!Number.isFinite(amount)||amount<MIN_AMOUNT_XAF)
    throw Object.assign(new Error(`Minimum payment is ${MIN_AMOUNT_XAF.toLocaleString()} XAF.`),{code:'VALIDATION_ERROR'});
  if (amount>MAX_AMOUNT_XAF)
    throw Object.assign(new Error(`Maximum payment is ${MAX_AMOUNT_XAF.toLocaleString()} XAF.`),{code:'VALIDATION_ERROR'});
}
function checkRateLimit(): void {
  try {
    const raw = sessionStorage.getItem(RATE_LIMIT_KEY);
    const now = Date.now();
    let rec = raw ? JSON.parse(raw) : {attempts:0,windowStart:now};
    if (now-rec.windowStart>RATE_LIMIT_WINDOW) rec={attempts:0,windowStart:now};
    if (rec.attempts>=RATE_LIMIT_MAX) {
      const remaining=Math.ceil((RATE_LIMIT_WINDOW-(now-rec.windowStart))/60_000);
      throw Object.assign(new Error(`Too many payment attempts. Please wait ${remaining} minute(s).`),{code:'RATE_LIMITED'});
    }
    rec.attempts+=1;
    sessionStorage.setItem(RATE_LIMIT_KEY,JSON.stringify(rec));
  } catch(err:any) { if(err?.code==='RATE_LIMITED') throw err; }
}
function sleep(ms:number):Promise<void>{return new Promise(r=>setTimeout(r,ms));}
async function fetchWithTimeout(url:string,options:RequestInit,externalSignal?:AbortSignal):Promise<Response>{
  const ctrl=new AbortController();
  const timer=setTimeout(()=>ctrl.abort(),REQUEST_TIMEOUT_MS);
  externalSignal?.addEventListener('abort',()=>ctrl.abort(),{once:true});
  try{return await fetch(url,{...options,signal:ctrl.signal});}finally{clearTimeout(timer);}
}
async function securePost(url:string,body:Record<string,unknown>,externalSignal?:AbortSignal):Promise<unknown>{
  const nonce=await generateNonce();
  let lastError:Error|null=null;
  for(let attempt=0;attempt<MAX_RETRIES;attempt++){
    if(externalSignal?.aborted) throw new DOMException('Aborted','AbortError');
    try{
      const res=await fetchWithTimeout(url,{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${SUPABASE_ANON}`,'apikey':SUPABASE_ANON,'x-bambeh-nonce':nonce,'x-bambeh-client':'web'},
        body:JSON.stringify(body),
      },externalSignal);
      if(res.status>=400&&res.status<500){
        const p=await res.json().catch(()=>({})) as Record<string,unknown>;
        const code:PaymentErrorCode=(res.status===400||res.status===422)?'VALIDATION_ERROR':'SERVER_ERROR';
        throw Object.assign(new Error((p?.error as string)??`Request error (${res.status})`),{code});
      }
      if(res.status===429) throw Object.assign(new Error('Payment service is busy. Please try again.'),{code:'RATE_LIMITED'});
      if(!res.ok){const p=await res.json().catch(()=>({})) as Record<string,unknown>;throw new Error((p?.error as string)??`Server error (${res.status})`);}
      return await res.json();
    }catch(err:any){
      if(err.name==='AbortError') throw err;
      if(err.code==='VALIDATION_ERROR'||err.code==='RATE_LIMITED') throw err;
      lastError=err;
      if(attempt<MAX_RETRIES-1) await sleep(RETRY_BASE_DELAY_MS*2**attempt);
    }
  }
  throw lastError??new Error('Payment request failed after retries.');
}
async function secureGet(url:string,externalSignal?:AbortSignal):Promise<unknown>{
  try{
    const res=await fetchWithTimeout(url,{method:'GET',headers:{'Authorization':`Bearer ${SUPABASE_ANON}`,'apikey':SUPABASE_ANON,'x-bambeh-client':'web'}},externalSignal);
    if(!res.ok) return null;
    return await res.json();
  }catch{return null;}
}
async function pollForConfirmation(reference:string,onStatusChange:(s:PaymentStatus)=>void,externalSignal?:AbortSignal):Promise<PaymentResult>{
  for(let i=0;i<POLL_MAX_ATTEMPTS;i++){
    if(externalSignal?.aborted) return{success:false,error:'Payment cancelled.',errorCode:'CANCELLED'};
    const delay=i<6?POLL_INTERVAL_MS:Math.min(POLL_INTERVAL_MS+(i-5)*1_000,12_000);
    await sleep(delay);
    const data=await secureGet(STATUS_URL(reference),externalSignal) as Record<string,unknown>|null;
    if(!data) continue;
    const s=(data.status as string)?.toUpperCase();
    if(s==='SUCCESSFUL'||data.confirmed===true){onStatusChange('confirmed');return{success:true,reference,status:'confirmed',breakdown:data.breakdown as PaymentBreakdown|undefined};}
    if(s==='FAILED'){onStatusChange('failed');return{success:false,reference,status:'failed',error:'Your payment was declined. Please check your Mobile Money balance.',errorCode:'SERVER_ERROR'};}
    onStatusChange('pending');
  }
  onStatusChange('timeout');
  return{success:false,reference,status:'timeout',error:'Confirmation timed out. If deducted, contact support@bambeh.com with your reference.',errorCode:'TIMEOUT'};
}

export function useCamPay(){
  const [status,setStatus]=useState<PaymentStatus>('idle');
  const [error,setError]=useState<string|null>(null);
  const [errorCode,setErrorCode]=useState<PaymentErrorCode|null>(null);
  const abortRef=useRef<AbortController|null>(null);
  useEffect(()=>()=>{abortRef.current?.abort();},[]);
  function getSignal():AbortSignal{abortRef.current?.abort();const ctrl=new AbortController();abortRef.current=ctrl;return ctrl.signal;}
  function handleError(err:unknown):PaymentResult{
    const e=err as Record<string,unknown>;
    const message=typeof e?.message==='string'?e.message:'An unexpected error occurred. Please try again.';
    const knownCodes:PaymentErrorCode[]=['VALIDATION_ERROR','SERVER_ERROR','TIMEOUT','RATE_LIMITED','CANCELLED'];
    const code:PaymentErrorCode=knownCodes.includes(e?.code as PaymentErrorCode)?(e.code as PaymentErrorCode):(e as{name?:string})?.name==='AbortError'?'CANCELLED':'NETWORK_ERROR';
    setError(message);setErrorCode(code);setStatus('failed');
    console.error('[useCamPay] Payment error:',{code,message});
    return{success:false,error:message,errorCode:code,status:'failed'};
  }
  const pay=useCallback(async(amount:number,phone:string,description:string):Promise<PaymentResult>=>{
    setStatus('initiating');setError(null);setErrorCode(null);
    try{
      validateAmount(amount);
      const cleanPhone=validatePhone(phone);
      checkRateLimit();
      const signal=getSignal();
      const reference=await generateSecureRef();
      const data=await securePost(COLLECT_URL,{amount,phone:cleanPhone,description,reference},signal) as Record<string,unknown>;
      if(!data?.success) return handleError({message:(data?.error as string)??'Payment initiation failed.',code:'SERVER_ERROR'});
      setStatus('pending');
      return await pollForConfirmation((data.reference as string)??reference,setStatus,signal);
    }catch(err:any){
      if(err?.name==='AbortError'){setStatus('idle');return{success:false,error:'Payment cancelled.',errorCode:'CANCELLED'};}
      return handleError(err);
    }
  },[]);
  const donate=useCallback(async(amount:number,phone:string):Promise<PaymentResult>=>{
    setStatus('initiating');setError(null);setErrorCode(null);
    try{
      validateAmount(amount);
      const cleanPhone=validatePhone(phone);
      checkRateLimit();
      const signal=getSignal();
      const reference=await generateSecureRef();
      const data=await securePost(COLLECT_URL,{amount,phone:cleanPhone,description:'Donation to Bambeh Marketplace',reference},signal) as Record<string,unknown>;
      if(!data?.success) return handleError({message:(data?.error as string)??'Donation initiation failed.',code:'SERVER_ERROR'});
      setStatus('pending');
      return await pollForConfirmation((data.reference as string)??reference,setStatus,signal);
    }catch(err:any){
      if(err?.name==='AbortError'){setStatus('idle');return{success:false,error:'Donation cancelled.',errorCode:'CANCELLED'};}
      return handleError(err);
    }
  },[]);
  const cancel=useCallback(()=>{abortRef.current?.abort();setStatus('idle');setError(null);setErrorCode(null);},[]);
  const reset=useCallback(()=>{setStatus('idle');setError(null);setErrorCode(null);},[]);
  return{pay,donate,cancel,reset,status,error,errorCode,loading:status==='initiating'||status==='pending',isConfirmed:status==='confirmed',isFailed:status==='failed'||status==='timeout',isPending:status==='pending'};
}
