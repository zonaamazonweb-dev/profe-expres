import { BottomNav } from "@/components/app/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <main className="flex-1 px-5 pb-4 pt-6">{children}</main>
      <BottomNav />
    </div>
  );
}
