export type IPlerryRegisterParams = {
  plugin: Function | Promise<Function>;
  manifest: IPlerryRegisterParamsManifest
  loaded?: boolean;
}

export type IPlerryRegisterParamsManifest = {
  name: string;
  dependencies?: string[];
};