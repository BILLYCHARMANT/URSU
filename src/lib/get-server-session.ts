/**
 * Re-export getServerSession from next-auth for use in server components and routes.
 */
import { getServerSession as nextAuthGetServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";

export async function getServerSession(options: NextAuthOptions) {
  return nextAuthGetServerSession(options);
}
