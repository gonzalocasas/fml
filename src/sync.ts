import { getRelaySockets, joinRoom, selfId } from 'trystero/nostr'
import type { Vote } from './store'

export type SyncDiagnostics = {
  selfId: string; roomId: string; startedAt: number; relays: { url:string; state:string }[];
  peers: { id:string; connection:string; ice:string }[]; lastEvent: string; error?: string
}
type Handlers = { onVotes: (votes: Vote[]) => void; onPeers: (users:string[]) => void; onDiagnostics: (d:SyncDiagnostics) => void }
export function connectFamily(roomId:string, getVotes:()=>Promise<Vote[]>, getProfile:()=>string, handlers:Handlers) {
  const startedAt=Date.now(); let lastEvent='Starting peer discovery'; const error:string|undefined=undefined
  const room = joinRoom({ appId:'gnz.io/fml/v2' }, roomId)
  const [sendVotes, receiveVotes] = room.makeAction<Vote[]>('votes')
  const [sendProfile, receiveProfile] = room.makeAction<string>('profile')
  const peers = new Map<string,string>()
  const states=['connecting','open','closing','closed']
  function report(){
    const relaySockets=getRelaySockets()
    handlers.onDiagnostics({selfId,roomId,startedAt,lastEvent,error,relays:Object.entries(relaySockets).map(([url,s])=>({url,state:states[s.readyState]||'unknown'})),peers:Object.entries(room.getPeers()).map(([id,p])=>({id,connection:p.connectionState,ice:p.iceConnectionState}))})
  }
  const reportPeers=()=>handlers.onPeers([...new Set([...peers.values()].filter(Boolean))])
  receiveVotes(v=>{lastEvent=`Received ${v.length} vote${v.length===1?'':'s'}`;handlers.onVotes(v);report()})
  receiveProfile((name,id)=>{peers.set(id,name);lastEvent=`${name} joined`;reportPeers();report()})
  room.onPeerJoin(async id => { peers.set(id,''); lastEvent='Peer connected'; reportPeers(); report(); sendProfile(getProfile(),id); sendVotes(await getVotes(), id) })
  room.onPeerLeave(id => { peers.delete(id); lastEvent='Peer disconnected'; reportPeers(); report() })
  const timer=window.setInterval(report,2500); report()
  return { broadcast: async (votes:Vote[]) => {lastEvent='Broadcasting vote';await sendVotes(votes);report()}, updateProfile: async()=>{await sendProfile(getProfile());report()}, leave: async () => {clearInterval(timer);await room.leave()} }
}
