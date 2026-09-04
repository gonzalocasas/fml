import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ChefHat, ChevronDown, Clock3, Copy, ExternalLink, Heart, Menu, Plus, RotateCcw, Trophy, UserRound, Users, Wifi, WifiOff, X } from 'lucide-react'
import { recipes } from './data'
import { getSetting, getVotes, mergeVotes, saveVote, setSetting, type Vote } from './store'
import { connectFamily, type SyncDiagnostics } from './sync'

type View = 'swipe'|'ranking'|'profile'
const room = new URLSearchParams(location.search).get('room') || 'the-hungry-council'

export default function App() {
  const [view,setView]=useState<View>('swipe'), [index,setIndex]=useState(0), [profile,setProfile]=useState('')
  const [draft,setDraft]=useState(''), [pin,setPin]=useState(''), [votes,setVotes]=useState<Vote[]>([]), [peers,setPeers]=useState(0)
  const [drag,setDrag]=useState(0), [exit,setExit]=useState<'yes'|'no'|null>(null), [showNetwork,setShowNetwork]=useState(false), [diag,setDiag]=useState<SyncDiagnostics|null>(null)
  const [showMenu,setShowMenu]=useState(false), [details,setDetails]=useState(false)
  const start=useRef({x:0,y:0}); const sync=useRef<ReturnType<typeof connectFamily>|null>(null)
  useEffect(()=>{
    const stop=(event:Event)=>event.preventDefault()
    const stopPinch=(event:TouchEvent)=>{if(event.touches.length>1)event.preventDefault()}
    document.addEventListener('gesturestart',stop,{passive:false}); document.addEventListener('gesturechange',stop,{passive:false}); document.addEventListener('gestureend',stop,{passive:false}); document.addEventListener('touchmove',stopPinch,{passive:false})
    return()=>{document.removeEventListener('gesturestart',stop);document.removeEventListener('gesturechange',stop);document.removeEventListener('gestureend',stop);document.removeEventListener('touchmove',stopPinch)}
  },[])
  useEffect(()=>{ (async()=>{ setVotes(await getVotes()); const p=await getSetting<string>('profile'); if(p)setProfile(p) })() },[])
  useEffect(()=>{ sync.current=connectFamily(room,getVotes,{onVotes:async incoming=>{await mergeVotes(incoming);setVotes(await getVotes())},onPeers:setPeers,onDiagnostics:setDiag}); return()=>{ void sync.current?.leave() } },[])
  const ordered=useMemo(()=>prioritize(recipes,profile),[profile])
  const current=index%ordered.length
  const vote=(yes:boolean)=>{ if(exit)return; if(!profile){setView('profile');return} const recipe=ordered[current]; if(yes){const v={id:crypto.randomUUID(),recipeId:recipe.id,profile,at:Date.now()}; void saveVote(v); setVotes(x=>[...x,v]); void sync.current?.broadcast([v])} setExit(yes?'yes':'no'); setDrag(yes?innerWidth*1.25:-innerWidth*1.25); setTimeout(()=>{setIndex(i=>i+1);setExit(null);setDrag(0)},420) }
  const ranks=useMemo(()=>recipes.map(r=>({...r,score:votes.filter(v=>v.recipeId===r.id).length})).sort((a,b)=>b.score-a.score),[votes])
  const saveProfile=async(e:React.FormEvent)=>{e.preventDefault(); if(!draft.trim()||pin.length<4)return; await setSetting('profile',draft.trim()); await setSetting('pinHint',pin.length);setProfile(draft.trim());setView('swipe');setPin('')}
  const r=ordered[current]
  return <main>
    <header><button className="brand" onClick={()=>setView('swipe')}><span>FML</span><small>family meal league</small></button><div className="headerTools"><button className="presence" onClick={()=>setShowNetwork(x=>!x)} aria-expanded={showNetwork}><i className={peers?'online':''}/><Users size={15}/>{peers?`${peers+1} here`:'just you'}<ChevronDown size={13}/></button><button className="menuButton" onClick={()=>setShowMenu(true)} aria-label="Open menu"><Menu/></button></div></header>
    {showMenu&&<><button className="menuBackdrop" aria-label="Close menu" onClick={()=>setShowMenu(false)}/><aside className="sideMenu"><div className="sideMenuHead"><span>FML</span><button onClick={()=>setShowMenu(false)} aria-label="Close menu"><X/></button></div><button className={view==='swipe'?'active':''} onClick={()=>{setView('swipe');setShowMenu(false)}}><ChefHat/>Discover</button><button className={view==='ranking'?'active':''} onClick={()=>{setView('ranking');setShowMenu(false)}}><Trophy/>Meal board</button><button className={view==='profile'?'active':''} onClick={()=>{setView('profile');setShowMenu(false)}}><UserRound/>Profile</button><button onClick={()=>{setView('profile');setShowMenu(false)}}><Plus/>Add a recipe</button><small>Room: {room}</small></aside></>}
    {showNetwork&&<aside className="network"><div className="networkHead">{peers?<Wifi/>:<WifiOff/>}<div><b>{peers?'Family room connected':'Looking for family…'}</b><small>{diag?.lastEvent||'Initializing'}</small></div></div><dl><div><dt>Room</dt><dd>{room}</dd></div><div><dt>This device</dt><dd>{diag?.selfId.slice(0,10)||'—'}</dd></div><div><dt>Signal relays</dt><dd>{diag?.relays.filter(x=>x.state==='open').length||0}/{diag?.relays.length||0} online</dd></div><div><dt>Peers</dt><dd>{diag?.peers.map(x=>`${x.id.slice(0,6)} · ${x.ice}`).join(', ')||'none discovered'}</dd></div></dl>{diag?.error&&<p className="networkError">{diag.error}</p>}<button className="copy" onClick={()=>navigator.clipboard.writeText(`${location.origin}${location.pathname}?room=${encodeURIComponent(room)}`)}><Copy/>Copy room link</button><p className="networkTip">All devices need this exact room link and the latest app version. Keep the app visible for up to 30 seconds while peers discover each other.</p></aside>}
    {view==='swipe'&&<section className="deck">
      <div className="eyebrow"><span>Tonight's contenders</span><b>{current+1} / {ordered.length}</b></div>
      <article className={`card ${exit?`exiting ${exit}`:''}`} style={{transform:`translateX(${drag}px) rotate(${drag/30}deg) scale(${exit==='yes'?.98:1})`,opacity:1-Math.min(Math.abs(drag)/(innerWidth*1.35),.92)}}
        onDragStart={e=>e.preventDefault()}
        onWheel={e=>{if(e.deltaY>35)setDetails(true)}}
        onPointerDown={e=>{start.current={x:e.clientX,y:e.clientY};window.getSelection()?.removeAllRanges();e.currentTarget.setPointerCapture(e.pointerId)}}
        onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId)){const dx=e.clientX-start.current.x,dy=e.clientY-start.current.y;if(Math.abs(dx)>Math.abs(dy))setDrag(dx)}}}
        onPointerUp={e=>{const dy=e.clientY-start.current.y;e.currentTarget.releasePointerCapture(e.pointerId);if(dy<-70&&Math.abs(dy)>Math.abs(drag)){setDrag(0);setDetails(true)}else if(Math.abs(drag)>90)vote(drag>0);else setDrag(0)}}>
        {exit&&<div className={`verdict ${exit}`}>{exit==='yes'?<Heart fill="currentColor"/>:<span className="puff"><i/><i/><i/><i/><i/></span>}</div>}
        <img src={r.image} alt={r.name} draggable="false"/><div className="shade"/><div className="source">{r.sourceLabel}</div>
        <div className="cardcopy"><div className="time"><Clock3 size={16}/>{r.minutes} min</div><h1>{r.name}</h1><div className="ingredients">{r.ingredients.map(x=><span key={x}>{x}</span>)}</div></div>
      </article>
      <div className="actions"><button className="no" aria-label="Skip" onClick={()=>vote(false)}><X/></button><button className="undo" aria-label="Start over" onClick={()=>setIndex(0)}><RotateCcw/></button><button className="yes" aria-label="Vote for this meal" onClick={()=>vote(true)}><Heart fill="currentColor"/></button></div>
      <p className="hint">Swipe sideways to vote · swipe up for the recipe</p>
    </section>}
    {view==='ranking'&&<section className="panel"><div className="title"><div><p className="kicker">The family has spoken</p><h1>Meal board</h1></div><select aria-label="Ranking period"><option>All time</option><option>Today</option><option>Last 7 days</option></select></div><div className="leader">{ranks.slice(0,8).map((x,i)=><article key={x.id}><b>{String(i+1).padStart(2,'0')}</b><img src={x.image}/><div><h2>{x.name}</h2><p>{x.ingredients.slice(0,3).join(' · ')}</p></div><strong>{x.score}<Heart size={14} fill="currentColor"/></strong></article>)}</div></section>}
    {view==='profile'&&<section className="panel profile"><ChefHat size={38}/><p className="kicker">Your place at the table</p><h1>{profile?`Hi, ${profile}.`:'Who’s choosing?'}</h1><p>Pick a name and a simple 4-digit PIN. Your profile stays on this device.</p><form onSubmit={saveProfile}><label>Name<input value={draft} onChange={e=>setDraft(e.target.value)} placeholder={profile||'Gonzalo'} autoComplete="nickname"/></label><label>PIN<input value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,'').slice(0,4))} inputMode="numeric" placeholder="••••" type="password"/></label><button>Save profile</button></form><div className="room">Family room <code>{room}</code></div></section>}
    {details&&<section className="recipeDetail"><div className="detailHero"><img src={r.image} alt=""/><button onClick={()=>setDetails(false)}><ArrowLeft/>Back</button><span>{r.sourceLabel}</span></div><div className="detailBody"><p className="kicker">Recipe basics</p><h1>{r.name}</h1><div className="detailMeta"><span><Clock3/>{r.minutes} minutes</span>{r.tags.map(tag=><span key={tag}>{tag}</span>)}</div><h2>What you'll need</h2><ul>{r.ingredients.map(item=><li key={item}>{item}</li>)}</ul>{r.source!=='#'&&<a className="sourceLink" href={r.source} target="_blank" rel="noreferrer">Open original recipe <ExternalLink/></a>}<button className="detailVote" onClick={()=>{setDetails(false);vote(true)}}><Heart fill="currentColor"/>I’d eat this</button></div></section>}
  </main>
}

function prioritize<T extends {id:string}>(items:T[], profile:string):T[]{
  const day=Math.floor(Date.now()/86400000)
  const score=(id:string)=>{let h=day;for(const c of `${profile}:${id}`)h=Math.imul(h^c.charCodeAt(0),2654435761);return(h>>>0)/4294967295}
  return [...items].sort((a,b)=>score(b.id)-score(a.id))
}
