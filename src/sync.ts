import { joinRoom } from 'trystero/torrent'
import type { Vote } from './store'

type Handlers = { onVotes: (votes: Vote[]) => void; onPeers: (count:number) => void }
export function connectFamily(roomId:string, getVotes:()=>Promise<Vote[]>, handlers:Handlers) {
  const room = joinRoom({ appId:'gnz.io/fml/v1' }, roomId)
  const [sendVotes, receiveVotes] = room.makeAction<Vote[]>('votes')
  const peers = new Set<string>()
  receiveVotes(handlers.onVotes)
  room.onPeerJoin(async id => { peers.add(id); handlers.onPeers(peers.size); sendVotes(await getVotes(), id) })
  room.onPeerLeave(id => { peers.delete(id); handlers.onPeers(peers.size) })
  return { broadcast: async (votes:Vote[]) => sendVotes(votes), leave: () => room.leave() }
}
