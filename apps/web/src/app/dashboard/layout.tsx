import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/sidebar";

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main
            className="pb-4"
        >
            <SidebarProvider>
                <AppSidebar />

                <main className="md:flex-1 space-y-2 overflow-hidden relative z-0 w-full md:max-w-5xl">
                    <div className="flex items-center justify-between">
                        <SidebarTrigger className="flex md:hidden h-full" />
                    </div>
                    <div className="mx-4 py-6">{children}</div>
                </main>
            </SidebarProvider>
        </main>

    );
}