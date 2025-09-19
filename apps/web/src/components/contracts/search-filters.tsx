"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function SearchFilters({ onSearch }: { onSearch?: (filters: any) => void }) {
    const [clientName, setClientName] = useState("");
    const [contractId, setContractId] = useState("");
    const [status, setStatus] = useState("");

    return (
        <div className="flex items-center gap-4 mb-4">
            <Input placeholder="Client name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            <Input placeholder="Contract ID" value={contractId} onChange={(e) => setContractId(e.target.value)} />
            <Select onValueChange={(val) => setStatus(val)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="FINALIZED">Finalized</SelectItem>
                </SelectContent>
            </Select>
            <Button onClick={() => onSearch?.({ clientName, contractId, status })}>Search</Button>
        </div>
    );
}
