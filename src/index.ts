import { GatewayIntentBits, GatewayReadyDispatchData } from "discord-api-types/v10";
import Client from "./structs/Client";
import { config } from 'dotenv';

config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.MessageContent,
  ],
  token: process.env.TOKEN!,
  shards: 5
});

client.connect();

client.on('shardConnect', (_, id) => {
  console.log(`[debug] Shard Connected, Id: ${id} !`)
});

client.on('connect', () => {
  console.log(`[debug] Client Connected, Shards Connected: ${client.connectedShards}`);
})