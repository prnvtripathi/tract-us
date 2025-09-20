"use client";

import { ContractList } from "@/components/contracts/contract-list";
import { SearchFilters } from "@/components/contracts/search-filters";
import { useState } from "react";

export default function ContractsPage() {
    const [filters, setFilters] = useState<any>({});

    return (
        <main className="">
            <h2 className="text-2xl font-bold mb-4">All Contracts</h2>
            <SearchFilters onSearch={setFilters} />
            <ContractList filters={filters} />
        </main>
    );
}
