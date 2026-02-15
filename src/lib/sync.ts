import Gun from 'gun';

// Initialize Gun with peers, but for now local
const gun = Gun();

// For ethereal chunk storage, use IPFS
import * as IPFS from 'ipfs-core';

let ipfsNode: any = null;

export async function initIPFS() {
  if (!ipfsNode) {
    ipfsNode = await IPFS.create();
  }
  return ipfsNode;
}

// Function to store data in IPFS chunks
export async function storeChunk(data: string): Promise<string> {
  const ipfs = await initIPFS();
  const { cid } = await ipfs.add(data);
  return cid.toString();
}

// Retrieve chunk
export async function retrieveChunk(cid: string): Promise<string> {
  const ipfs = await initIPFS();
  const chunks = [];
  for await (const chunk of ipfs.cat(cid)) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString();
}

// For P2P sync using Gun
export const syncDB = gun.get('social-portal');

// Sync identities
export function syncIdentities(identities: any) {
  syncDB.get('identities').put(identities);
}

// Get synced identities
export function getSyncedIdentities(callback: (data: any) => void) {
  syncDB.get('identities').on(callback);
}

// Similarly for other data, like feeds, settings

// To preserve anti-tracking, use local relay or P2P without central server
// Gun can use peers, but for simplicity, keep local