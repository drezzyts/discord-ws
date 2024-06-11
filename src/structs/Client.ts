import { EventEmitter } from "stream";
import { ClientOptions } from "../types/client";
import DiscordWebSocket from "../ws/WebSocket";

export default class Client extends EventEmitter {
  public connectionTimestamp: number;
  public connectedShards: number;
  public ws?: DiscordWebSocket;

  public constructor(public options: ClientOptions) {
    super();
    
    this.options.shards ??= 1;
    this.connectionTimestamp = 0;
    this.connectedShards = 0;
  }
  
  public uptime(): number {
    return this.connectionTimestamp - Date.now();
  }

  public async connect(token: string = this.options.token): Promise<void> {
    this.options.token = token;
    this.ws = new DiscordWebSocket(this);
    await this.ws.connect();
  }
}