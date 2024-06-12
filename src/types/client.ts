import { ActivityType, GatewayIntentBits, PresenceUpdateStatus } from 'discord-api-types/v10';

export interface ClientOptions {
  token: string,
  intents: GatewayIntentBits[], 
  compress?: boolean
  shards?: number,
}

export interface ClientPresence {
  status: PresenceUpdateStatus,
  activities?: ClientPresenceActivity[],
}

export interface ClientPresenceActivity {
  type: ActivityType,
  name: string,
}