import { redirect } from "next/navigation";

export async function GET(request) {
  redirect("/dashboard");
}
