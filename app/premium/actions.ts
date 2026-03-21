"use server";

import { redirect } from "next/navigation";

export async function upgradeToPremium() {
  redirect("/builder");
}
