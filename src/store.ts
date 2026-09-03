import { openDB } from 'idb'

export type Vote = { id: string; recipeId: string; profile: string; at: number }
const db = openDB('fml', 1, { upgrade(db) { db.createObjectStore('votes', { keyPath: 'id' }); db.createObjectStore('settings') } })

export async function getVotes(): Promise<Vote[]> { return (await db).getAll('votes') }
export async function saveVote(vote: Vote) { await (await db).put('votes', vote) }
export async function mergeVotes(votes: Vote[]) { const d = await db; const tx = d.transaction('votes','readwrite'); await Promise.all(votes.map(v => tx.store.put(v))); await tx.done }
export async function getSetting<T>(key:string): Promise<T|undefined> { return (await db).get('settings', key) }
export async function setSetting(key:string,value:unknown) { return (await db).put('settings', value, key) }
