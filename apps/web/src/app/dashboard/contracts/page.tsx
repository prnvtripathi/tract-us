import { ContractList } from "@/components/contracts/contract-list";
import { SearchFilters } from "@/components/contracts/search-filters";

export default function ContractsPage() {
    return (
        <main className="">
            <h2 className="text-2xl font-bold mb-4">All Contracts</h2>
            <SearchFilters />
            <ContractList />
        </main>
    );
}
