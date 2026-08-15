import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-medium tracking-[-0.03em]">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Signed in as <span className="text-foreground">{user.email}</span></p>
        <form action="/auth/signout" method="post">
          <button type="submit" className="mt-4 px-6 py-2 rounded-full border border-border text-sm hover:bg-accent transition-colors">
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
