import { ActivityType, GatewayIntentBits, PresenceUpdateStatus } from "discord-api-types/v10";
import Client from "./structs/Client";
import { config } from 'dotenv';

config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
  ],
  token: process.env.TOKEN!,
});

client.connect();

client.on('shardConnect', (_, id) => {
  console.log(`[debug] Shard Connected, Id: ${id} !`);
  client.ws!.shards.get(id)!.updatePresence({
    status: PresenceUpdateStatus.DoNotDisturb
  });
});

client.on('connect', async (user) => {
  console.log(`[debug] Client Connected, Shards Connected: ${client.connectedShards}`);
})