"use client";

import { useContracts } from "@/hooks/useContracts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ContractStatus } from "./contract-status";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { ContractEditDialog } from "./contract-edit-dialog";
import { ContractDeleteDialog } from "./contract-delete-dialog";

export function ContractList({ filters = {} }: { filters?: any }) {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useContracts(filters, page);

    if (isLoading) return <p>Loading...</p>;

    return (
        <div className="mt-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Contract ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data?.data?.map((c: any) => (
                        <TableRow key={c.id}>
                            <TableCell>{c.clientName}</TableCell>
                            <TableCell className="text-muted-foreground">{c.contractId}</TableCell>
                            <TableCell>
                                <ContractStatus status={c.status} />
                            </TableCell>
                            <TableCell className="flex gap-2">
                                <Button variant="secondary" size="sm" asChild>
                                    <Link href={`/dashboard/contracts/${c.id}`}>View</Link>
                                </Button>
                                <ContractEditDialog contract={c} />
                                <ContractDeleteDialog id={c.id} clientName={c.clientName} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
