"use client";

import { useContracts, useDeleteContract } from "@/hooks/useContracts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ContractStatus } from "./contract-status";
import Link from "next/link";

export function ContractList({ filters = {} }: { filters?: any }) {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useContracts(filters, page);
    const deleteContract = useDeleteContract();

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
                            <TableCell>{c.contractId}</TableCell>
                            <TableCell>
                                <ContractStatus status={c.status} />
                            </TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/dashboard/contracts/${c.id}`}>
                                        View
                                    </Link>
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deleteContract.mutate(c.id)}
                                >
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
