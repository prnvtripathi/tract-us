"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, FileText, UploadCloud, ChevronsLeft, Moon, Sun, Dot, Wifi } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";
import { Badge } from "@/components/ui/badge";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { useTheme } from "next-themes"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const menuItems = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Upload Contract",
        url: "/dashboard/upload",
        icon: UploadCloud,
    },
    {
        title: "Contracts",
        url: "/dashboard/contracts",
        icon: FileText,
    },
];

export function AppSidebar() {
    const pathname = usePathname();
    const { isConnected } = useSocket();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { toggleSidebar } = useSidebar();
    const { theme, setTheme } = useTheme();

    const handleThemeChange = () => {
        if (theme === "light") {
            setTheme("dark");
        } else {
            setTheme("light");
        }
    };

    return (
        <Sidebar variant="floating" collapsible="icon">
            <SidebarHeader>
                <div className={`flex items-center space-x-2 ${isSidebarOpen ? "justify-start" : "justify-center"} p-4`}>
                    <h1 className="text-xl font-bold">
                        {isSidebarOpen ? (
                            <>
                                Tract<span className="text-primary">Us</span>
                            </>
                        ) : (
                            <>T<span className="text-primary">U</span></>
                        )}
                    </h1>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.url}
                                        tooltip={item.title}
                                    >
                                        <Link href={item.url as any}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="Expand Sidebar"
                            onClick={() => {
                                toggleSidebar();
                                setIsSidebarOpen(!isSidebarOpen);
                            }}
                        >
                            <ChevronsLeft
                                className={`h-4 w-4 ${isSidebarOpen ? "" : "transform rotate-180"
                                    } transition-transform duration-300`}
                            />
                            <span>Collapse Sidebar</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Change Theme" onClick={handleThemeChange}>
                            {theme === "dark" ? (
                                <Sun className="h-4 w-4" />
                            ) : (
                                <Moon className="h-4 w-4" />
                            )}
                            <span>Change Theme</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <div className="flex items-center justify-between">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge
                                className={cn(
                                    "rounded-full px-2 py-1 text-xs border",
                                    isConnected ? "bg-green-100 dark:bg-green-900 border-green-300" : "bg-red-100 dark:bg-red-900 border-red-200",
                                    isConnected ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
                                )}
                            >
                                <Wifi className="h-4 w-4" />
                                {isSidebarOpen && (isConnected ? "Connected" : "Disconnected")}
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>Socket Status</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}