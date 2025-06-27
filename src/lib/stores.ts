import { writable } from 'svelte/store';
import type { TacoSession, TacoConsumption } from './types.js';

export const sessions = writable<TacoSession[]>([]);
export const consumptions = writable<TacoConsumption[]>([]);
export const activeTab = writable<'calculator' | 'tracker' | 'stats'>('calculator');
export const showTacoRain = writable(false);
