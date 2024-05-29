export interface Event {
    kind: number;
    tags: string[][];
    content: string;
    created_at: number;
    pubkey: string;
    id: string;
    sig: string;
  }
  
  export type Filter = {
    ids?: string[];
    kinds?: number[];
    authors?: string[];
    since?: number;
    until?: number;
    limit?: number;
    search?: string;
    [key: `#${string}`]: string[] | undefined;
  };
  
  export type Metadata = {
    name?: string;
    pubkey?: string;
    picture?: string;
    nip05?: string;
  };
  