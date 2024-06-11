import { EventEmitter } from "stream";
import Shard from "./Shard";
import Client from "../structs/Client";

export default class DiscordWebSocket extends EventEmitter {
  public shards: Map<number, Shard>;

  public constructor(public client: Client) {
    super();
    this.shards = new Map();
  }

  public async connect() {
    for (let id = 1; id <= this.client.options.shards!; id++) {
      const shard = new Shard({ client: this.client, discordWs: this, id });
      await shard.connect();
      this.shards.set(id, shard);
    }
  }
}