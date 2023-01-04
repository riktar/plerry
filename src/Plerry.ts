import EventEmitter from 'events'
import {PlerryEvents, PlerryEventsStrings} from "./core/interfaces/IPlerryEvents";
import {IPlerryRegisterParams, IPlerryRegisterParamsManifest} from "./core/interfaces/IPlerryRegisterParams";
import {PlerryOptions} from "./core/interfaces/IPlerryOptions";


class Plerry {
  private em = new EventEmitter();
  private isReady: boolean = false;
  private isStarted: boolean = false;
  private isReloading: boolean = false;
  private container: Map<string, unknown> = new Map<string, unknown>();
  private pluginsQueue: Array<IPlerryRegisterParams> = [];
  options: PlerryOptions = {
    PLERRY_TIMEOUT: 15000,
    PLERRY_DEBUG: false,
  }

  constructor(opts: PlerryOptions = {}) {
    this.options = {...this.options, ...opts};
    return this.plerryProxied();
  }

  private plerryProxied(): PlerryInstance {
    return new Proxy(this, {
      get(target, name, receiver) {
        const container = target.container;
        if (typeof name === 'string' && container.has(name)) {
          return container.get(name);
        }
        return Reflect.get(target, name, receiver);
      }
    })
  }

  private reset() {
    this.close()
    this.isStarted = false;
    this.isReady = false;
    this.pluginsQueue = this.pluginsQueue.map((plugin) => {
      plugin.loaded = false;
      return plugin;
    })
  }

  private async loadPlugin(plugin: Function | Promise<Function>, manifest: IPlerryRegisterParamsManifest) {
    if (typeof plugin !== 'function') throw new Error(`Plerry: ${plugin} is not a function`)
    try {
      const indexPlugin = this.pluginsQueue.findIndex(p => p.manifest.name === manifest.name)
      if (indexPlugin === -1) {
        this.pluginsQueue.push({
          plugin,
          manifest,
          loaded: true
        })
      } else {
        this.pluginsQueue[indexPlugin].loaded = true;
      }
      await plugin(this, this.options)
    } catch (e) {
      console.error(`There was an error while loading a plugin ${manifest.name}`);
      throw e;
    }
  }

  private async checkPluginQueue() {
    let pluginsQueueNotLoaded = this.pluginsQueue.filter((plugin) => !plugin.loaded);
    // foreach plugin in the queue, check if its dependencies are loaded
    for (const plugin of pluginsQueueNotLoaded) {
      const haveToLoad = plugin.manifest?.dependencies
        ? plugin.manifest?.dependencies.every((dependency) => {
          return this.pluginsQueue.find((plugin) => plugin.manifest.name === dependency)?.loaded;
        })
        : true
      if (haveToLoad) {
        await this.loadPlugin(plugin.plugin, plugin.manifest);
      }
    }

    pluginsQueueNotLoaded = this.pluginsQueue.filter((plugin) => !plugin.loaded);
    if (pluginsQueueNotLoaded.length === 0) return;

    await this.checkPluginQueue()
  }

  register(plugin: Function | Promise<Function>, manifest: IPlerryRegisterParamsManifest): void {
    if (typeof plugin !== 'function') throw new Error(`Plerry: ${plugin} is not a function`)

    if (this.pluginsQueue.find((p) => p.manifest.name === manifest.name)) {
      if (this.isReloading) return;
      throw new Error(`Plerry: ${manifest.name} already exists in plugins queue`)
    }
    this.pluginsQueue.push({plugin, manifest, loaded: false});
  }

  async start() {

    const timeout = setTimeout(() => {
      console.error(`Plerry: Timeout of plugin loading ${this.options.PLERRY_TIMEOUT}ms exceeded`);
      process.exit(1);
    })

    this.em.emit(PlerryEvents["plerry:start"], new Date());
    this.isStarted = true;

    await this.checkPluginQueue()

    this.isReady = this.pluginsQueue.every((plugin) => plugin.loaded);
    if (!this.isReady) throw new Error(`Plerry: Error in start process`)

    clearTimeout(timeout);
    this.em.emit(PlerryEvents["plerry:ready"], new Date());
  }

  close() {
    this.em.emit(PlerryEvents["plerry:close"], new Date());
  }

  async reload(): Promise<PlerryInstance> {
    this.isReloading = true;
    this.em.emit(PlerryEvents["plerry:reload"], new Date());
    this.reset()
    await this.ready();
    this.isReloading = false
    return this.plerryProxied();
  }

  async ready(): Promise<PlerryInstance> {
    const self = this;
    if (!self.isStarted) await this.start()
    return new Promise((resolve) => {
      if (self.isReady) resolve(this.plerryProxied())
      this.em.once(PlerryEvents["plerry:ready"], () => resolve(this.plerryProxied()))
    })
  }

  on(event: PlerryEventsStrings, listener: (...args: any[]) => void): void {
    this.em.on(event, listener);
  };

  decorate(name: string, value: any) {
    if (this.container.has(name)) throw new Error(`Plerry: ${name} already exists in container`)
    this.container.set(name, value);
  }
}

export interface PlerryInstance extends Plerry {
  [key: string]: any;
}

export default Plerry;