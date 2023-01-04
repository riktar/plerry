export enum PlerryEvents {
  'plerry:start' = 'plerry:start',
  'plerry:ready' = 'plerry:ready',
  'plerry:close' = 'plerry:close',
  'plerry:reload' = 'plerry:reloaad'
}

export type PlerryEventsStrings = keyof typeof PlerryEvents;