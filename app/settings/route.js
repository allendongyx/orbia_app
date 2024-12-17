import { redirect } from "next/navigation";

export async function GET(request) {
  redirect("/settings/profile");
}
