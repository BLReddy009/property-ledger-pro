import { Building2 } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-mist px-4 dark:bg-[#101416]">
      <div className="w-full max-w-md rounded-md border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-[#151b1e]">
        <div className="mb-8 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-pine text-white"><Building2 /></span>
            <div>
              <h1 className="text-xl font-semibold">Property Ledger Pro</h1>
            <p className="text-sm text-slate-500">Choose a demo role. Password: Demo@12345</p>
            </div>
          </div>
        <LoginForm />
      </div>
    </main>
  );
}
