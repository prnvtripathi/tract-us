"use client"

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { ContractList } from "@/components/contracts/contract-list";
import { SearchFilters } from "@/components/contracts/search-filters";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardSkeleton } from "@/components/skeletons/dashboard";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
	const [filters, setFilters] = useState<any>({});
	const { data: session, isPending, error: sessionError } = authClient.useSession()
	const router = useRouter();


	if (isPending) return <DashboardSkeleton />;
	if (!session) {
		router.push('/auth/login')
		return null;
	}
	if (sessionError) return <p className="text-red-500">Error: {sessionError.message}</p>;

	return (
		<div className="space-y-6">
			<div className="flex items-center">
				<Avatar className="size-10 md:size-16 mr-4">
					<AvatarImage src={session?.user.image || "/noavatar.png"} />
					<AvatarFallback className="text-3xl md:text-5xl">
						{session?.user.name?.[0] ?? "?"}
					</AvatarFallback>
				</Avatar>
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Contracts Dashboard</h2>
					<p className="text-muted-foreground">
						Welcome back, {session?.user.name}
					</p>
				</div>
			</div>
			<SearchFilters onSearch={setFilters} />
			<ContractList filters={filters} />
		</div>
	);
}