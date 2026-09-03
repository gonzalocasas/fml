import { useEffect, useMemo, useRef, useState } from 'react'
import { ChefHat, Clock3, Heart, Plus, RotateCcw, Trophy, Users, X } from 'lucide-react'
import { recipes } from './data'
import { getSetting, getVotes, mergeVotes, saveVote, setSetting, type Vote } from './store'
import { connectFamily } from './sync'

type View = 'swipe'|'ranking'|'profile'
const room = new URLSearchParams(location.search).get('room') || 'casas-kitchen'

export default function App() {
  const [view,setView]=useState<View>('swipe'), [index,setIndex]=useState(0), [profile,setProfile]=useState('')
  const [draft,setDraft]=useState(''), [pin,setPin]=useState(''), [votes,setVotes]=useState<Vote[]>([]), [peers,setPeers]=useState(0)
  const [drag,setDrag]=useState(0); const start=useRef(0); const sync=useRef<ReturnType<typeof connectFamily>|null>(null)
  useEffect(()=>{ (async()=>{ setVotes(await getVotes()); const p=await getSetting<string>('profile'); if(p)setProfile(p) })() },[])
  useEffect(()=>{ sync.current=connectFamily(room,getVotes,{onVotes:async incoming=>{await mergeVotes(incoming);setVotes(await getVotes())},onPeers:setPeers}); return()=>{ void sync.current?.leave() } },[])
  const vote=(yes:boolean)=>{ if(!profile){setView('profile');return} if(yes){const v={id:crypto.randomUUID(),recipeId:recipes[index].id,profile,at:Date.now()}; saveVote(v); setVotes(x=>[...x,v]); sync.current?.broadcast([v])} setDrag(yes?520:-520); setTimeout(()=>{setIndex(i=>(i+1)%recipes.length);setDrag(0)},180) }
  const ranks=useMemo(()=>recipes.map(r=>({...r,score:votes.filter(v=>v.recipeId===r.id).length})).sort((a,b)=>b.score-a.score),[votes])
  const saveProfile=async(e:React.FormEvent)=>{e.preventDefault(); if(!draft.trim()||pin.length<4)return; await setSetting('profile',draft.trim()); await setSetting('pinHint',pin.length);setProfile(draft.trim());setView('swipe');setPin('')}
  const r=recipes[index]
  return <main>
    <header><button className="brand" onClick={()=>setView('swipe')}><span>FML</span><small>family meal league</small></button><div className="presence"><i className={peers?'online':''}/><Users size={15}/>{peers?`${peers+1} here`:'just you'}</div></header>
    {view==='swipe'&&<section className="deck">
      <div className="eyebrow"><span>Tonight's contenders</span><b>{index+1} / {recipes.length}</b></div>
      <article className="card" style={{transform:`translateX(${drag}px) rotate(${drag/28}deg)`,opacity:1-Math.abs(drag)/700}}
        onPointerDown={e=>{start.current=e.clientX;e.currentTarget.setPointerCapture(e.pointerId)}}
        onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))setDrag(e.clientX-start.current)}}
        onPointerUp={e=>{e.currentTarget.releasePointerCapture(e.pointerId);Math.abs(drag)>90?vote(drag>0):setDrag(0)}}>
        <img src={r.image} alt={r.name}/><div className="shade"/><div className="source">{r.sourceLabel}</div>
        <div className="cardcopy"><div className="time"><Clock3 size={16}/>{r.minutes} min</div><h1>{r.name}</h1><div className="ingredients">{r.ingredients.map(x=><span key={x}>{x}</span>)}</div></div>
      </article>
      <div className="actions"><button className="no" aria-label="Skip" onClick={()=>vote(false)}><X/></button><button className="undo" aria-label="Start over" onClick={()=>setIndex(0)}><RotateCcw/></button><button className="yes" aria-label="Vote for this meal" onClick={()=>vote(true)}><Heart fill="currentColor"/></button></div>
      <p className="hint">Drag or tap — your yes becomes a vote.</p>
    </section>}
    {view==='ranking'&&<section className="panel"><div className="title"><div><p className="kicker">The family has spoken</p><h1>Meal board</h1></div><select aria-label="Ranking period"><option>All time</option><option>Today</option><option>Last 7 days</option></select></div><div className="leader">{ranks.slice(0,8).map((x,i)=><article key={x.id}><b>{String(i+1).padStart(2,'0')}</b><img src={x.image}/><div><h2>{x.name}</h2><p>{x.ingredients.slice(0,3).join(' · ')}</p></div><strong>{x.score}<Heart size={14} fill="currentColor"/></strong></article>)}</div></section>}
    {view==='profile'&&<section className="panel profile"><ChefHat size={38}/><p className="kicker">Your place at the table</p><h1>{profile?`Hi, ${profile}.`:'Who’s choosing?'}</h1><p>Pick a name and a simple 4-digit PIN. Your profile stays on this device.</p><form onSubmit={saveProfile}><label>Name<input value={draft} onChange={e=>setDraft(e.target.value)} placeholder={profile||'Gonzalo'} autoComplete="nickname"/></label><label>PIN<input value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,'').slice(0,4))} inputMode="numeric" placeholder="••••" type="password"/></label><button>Save profile</button></form><div className="room">Family room <code>{room}</code></div></section>}
    <nav><button className={view==='swipe'?'active':''} onClick={()=>setView('swipe')}><ChefHat/>Discover</button><button className={view==='ranking'?'active':''} onClick={()=>setView('ranking')}><Trophy/>Meal board</button><button onClick={()=>setView('profile')}><Plus/>Add / Profile</button></nav>
  </main>
}
