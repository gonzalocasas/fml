import { openDB } from 'idb'

export type Vote = { id: string; recipeId: string; profile: string; at: number; liked?: boolean }
const db = openDB('fml', 1, { upgrade(db) { db.createObjectStore('votes', { keyPath: 'id' }); db.createObjectStore('settings') } })

export async function getVotes(): Promise<Vote[]> { return (await db).getAll('votes') }
export async function saveVote(vote: Vote) { await (await db).put('votes', vote) }
export async function mergeVotes(votes: Vote[]) { const d = await db; const tx = d.transaction('votes','readwrite'); await Promise.all(votes.map(v => tx.store.put(v))); await tx.done }
export async function renameVotes(from:string,to:string):Promise<Vote[]> { const d=await db;const existing=await d.getAll('votes');const changed=existing.filter(v=>v.profile===from).map(v=>({...v,profile:to}));const tx=d.transaction('votes','readwrite');await Promise.all(changed.map(v=>tx.store.put(v)));await tx.done;return changed }
export async function getSetting<T>(key:string): Promise<T|undefined> { return (await db).get('settings', key) }
export async function setSetting(key:string,value:unknown) { return (await db).put('settings', value, key) }
