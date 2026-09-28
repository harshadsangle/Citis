"use client";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
const base=(process.env.NEXT_PUBLIC_API_BASE_URL||"/api/v1").replace(/\/$/,"");
type Row={id:string;name?:string;code?:string;status?:string;start_date?:string;end_date?:string};
export default function AcademicStructurePage(){
 const [kind,setKind]=useState("faculties"),[rows,setRows]=useState<Row[]>([]),[name,setName]=useState(""),[code,setCode]=useState(""),[error,setError]=useState("");
 const load=()=>fetch(`${base}/${kind}`).then(r=>r.json()).then(x=>setRows(x.data||[])).catch(()=>setError("Unable to load academic records."));
 useEffect(load,[kind]);
 async function create(e:FormEvent){e.preventDefault();setError("");const body=kind==="semesters"?{institutionId:"",name,code,startDate:new Date().toISOString(),endDate:new Date(Date.now()+86400000).toISOString()}:{institutionId:"",name,code};const r=await fetch(`${base}/${kind}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});if(!r.ok)setError("Create failed. Select an institution in the full form or contact an administrator.");else{setName("");setCode("");load();}}
 return <main style={{maxWidth:1000,margin:"40px auto",padding:24,fontFamily:"sans-serif"}}><h1>Academic structure</h1><p>Manage scoped faculties, departments, semesters, and course offerings without changing catalogue courses.</p><nav aria-label="Academic structure resources">{["faculties","departments","semesters","course-offerings"].map(x=><button key={x} onClick={()=>setKind(x)} aria-current={kind===x?"page":undefined} style={{margin:4,padding:10}}>{x.replace("-"," ")}</button>)}</nav><form onSubmit={create} style={{display:"flex",gap:8,margin:"24px 0"}}><input aria-label="Name" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required/><input aria-label="Code" placeholder="Code" value={code} onChange={e=>setCode(e.target.value)} required/><button type="submit">Create</button></form>{error&&<p role="alert">{error}</p>}<ul>{rows.map(r=><li key={r.id}>{r.name||r.code} {r.code&&`(${r.code})`} — {r.status}</li>)}</ul></main>;
}