import { getRelaySockets, joinRoom, selfId } from 'trystero/nostr'
import type { Vote } from './store'

export type SyncDiagnostics = {
  selfId: string; roomId: string; startedAt: number; relays: { url:string; state:string }[];
  peers: { id:string; connection:string; ice:string }[]; lastEvent: string; error?: string
}
type Handlers = { onVotes: (votes: Vote[]) => void; onPeers: (count:number) => void; onDiagnostics: (d:SyncDiagnostics) => void }
export function connectFamily(roomId:string, getVotes:()=>Promise<Vote[]>, handlers:Handlers) {
  const startedAt=Date.now(); let lastEvent='Starting peer discovery'; const error:string|undefined=undefined
  const room = joinRoom({ appId:'gnz.io/fml/v2' }, roomId)
  const [sendVotes, receiveVotes] = room.makeAction<Vote[]>('votes')
  const peers = new Set<string>()
  const states=['connecting','open','closing','closed']
  function report(){
    const relaySockets=getRelaySockets()
    handlers.onDiagnostics({selfId,roomId,startedAt,lastEvent,error,relays:Object.entries(relaySockets).map(([url,s])=>({url,state:states[s.readyState]||'unknown'})),peers:Object.entries(room.getPeers()).map(([id,p])=>({id,connection:p.connectionState,ice:p.iceConnectionState}))})
  }
  receiveVotes(v=>{lastEvent=`Received ${v.length} vote${v.length===1?'':'s'}`;handlers.onVotes(v);report()})
  room.onPeerJoin(async id => { peers.add(id); lastEvent='Peer connected'; handlers.onPeers(peers.size); report(); sendVotes(await getVotes(), id) })
  room.onPeerLeave(id => { peers.delete(id); lastEvent='Peer disconnected'; handlers.onPeers(peers.size); report() })
  const timer=window.setInterval(report,2500); report()
  return { broadcast: async (votes:Vote[]) => {lastEvent='Broadcasting vote';await sendVotes(votes);report()}, leave: async () => {clearInterval(timer);await room.leave()} }
}
