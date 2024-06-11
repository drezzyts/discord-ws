import { GatewayIntentBits } from 'discord-api-types/v10';

export interface ClientOptions {
  token: string,
  intents: GatewayIntentBits[], 
  compress?: boolean
  shards?: number,
}