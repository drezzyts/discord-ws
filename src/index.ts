import { GatewayIntentBits } from "discord-api-types/v10";
import Client from "./structs/Client";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.MessageContent,
  ],
  token: "",
  shards: 5
});

client.connect();