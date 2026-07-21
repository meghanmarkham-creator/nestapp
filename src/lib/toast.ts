"use client";

// Lightweight toast bridge. ToastHost (components/ui.tsx) registers the handler;
// anywhere in the app calls nestToast(msg, tone).

export type ToastTone = "default" | "success";
type Handler = (msg: string, tone?: ToastTone) => void;

let handler: Handler | null = null;

export function registerToast(fn: Handler) {
  handler = fn;
}
export function nestToast(msg: string, tone: ToastTone = "default") {
  handler?.(msg, tone);
}
