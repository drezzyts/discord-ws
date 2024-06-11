import Client from "../structs/Client";
import DiscordWebSocket from "../ws/WebSocket";

export interface ShardOptions {
  id: number,
  discordWs: DiscordWebSocket,
  client: Client
}