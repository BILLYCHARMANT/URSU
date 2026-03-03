/**
 * Re-export getServerSession from next-auth for use in server components and routes.
 */
import { getServerSession as nextAuthGetServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";

export async function getServerSession(options: NextAuthOptions) {
  return nextAuthGetServerSession(options);
}


Role	Username	Email	Password
SUPERADMIN	superadmin	superadmin@difarm.local	SuperAdmin1
ADMIN	admin	admin@difarm.local	AdminPass1
MANAGER	manager	manager@difarm.local	ManagerPass1