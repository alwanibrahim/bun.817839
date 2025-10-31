import { Context, SessionFlavor } from "grammy";

export interface SessionData {
  cart: Record<string, number>;
  step?: string;
}

export type MyContext = Context & SessionFlavor<SessionData>;
