"use client";

import type { Message } from "./types";
import type { UserProfile } from "./prompts/aurora";

const PROFILE_KEY = "aurora.profile";
const HISTORY_KEY = "aurora.history";
const ALERTS_KEY = "aurora.alerts";

export interface StoredAlert {
  ts: number;
  type: string;
  context: string;
}

function safeParse<T>(s: string | null, fallback: T): T {
  if (!s) return fallback;
  try { return JSON.parse(s) as T; } catch { return fallback; }
}

export function loadProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  return safeParse<UserProfile | null>(localStorage.getItem(PROFILE_KEY), null);
}

export function saveProfile(p: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

export function loadHistory(): Message[] {
  if (typeof window === "undefined") return [];
  return safeParse<Message[]>(localStorage.getItem(HISTORY_KEY), []);
}

export function saveHistory(h: Message[]): void {
  // Mantenemos un máximo razonable para no inflar el contexto.
  const trimmed = h.slice(-200);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

export function appendRemember(fact: string): void {
  const p = loadProfile();
  if (!p) return;
  const prev = p.historia || "";
  const next = prev ? `${prev}\n• ${fact}` : `• ${fact}`;
  saveProfile({ ...p, historia: next });
}

export function loadAlerts(): StoredAlert[] {
  if (typeof window === "undefined") return [];
  return safeParse<StoredAlert[]>(localStorage.getItem(ALERTS_KEY), []);
}

export function pushAlert(a: StoredAlert): void {
  const list = loadAlerts();
  list.push(a);
  localStorage.setItem(ALERTS_KEY, JSON.stringify(list.slice(-100)));
}
