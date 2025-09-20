"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, type FormEvent } from "react";
import { RefreshCwIcon } from "lucide-react";

export function SearchFilters({ onSearch }: { onSearch?: (filters: any) => void }) {
    const [clientName, setClientName] = useState("");
    const [id, setId] = useState("");
    const [status, setStatus] = useState("");

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    onSearch?.({ clientName, id, status });
    };

    const handleReset = () => {
        setClientName("");
    setId("");
        setStatus("");
        onSearch?.({});
    };

    return (
        <form onSubmit={handleSubmit} onReset={handleReset} className="flex items-center gap-2 mb-4">
            <Input placeholder="Client name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            <Input placeholder="Contract ID" value={id} onChange={(e) => setId(e.target.value)} />
            <Select value={status} onValueChange={(val) => setStatus(val)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="FINALIZED">Finalized</SelectItem>
                </SelectContent>
            </Select>
            <div className="flex gap-2">
                <Button type="submit">Search</Button>
                <Button type="reset" variant="outline">
                    <RefreshCwIcon className="h-4 w-4" />
                </Button>
            </div>
        </form>
    );
}
