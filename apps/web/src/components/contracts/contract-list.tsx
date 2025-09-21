"use client";

import { useContracts } from "@/hooks/useContracts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { ContractStatus } from "./contract-status";
import Link from "next/link";
import { ContractEditDialog } from "./contract-edit-dialog";
import { ContractDeleteDialog } from "./contract-delete-dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ContractList({ filters = {} }: { filters?: any }) {
    const [page, setPage] = useState(1);
    const { data, isLoading, isFetching } = useContracts(filters, page);

    // Reset to first page whenever filters change
    useEffect(() => {
        setPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(filters)]);

    const pagination = data?.pagination as
        | { total: number; page: number; pageSize: number }
        | undefined;
    const totalPages = useMemo(() => {
        if (!pagination) return 1;
        return Math.max(1, Math.ceil(pagination.total / pagination.pageSize));
    }, [pagination]);

    if (isLoading) return <p>Loading...</p>;

    return (
        <div className="mt-4 space-y-3">
            {/* Current page indicator (also shown in footer) */}
            {pagination && (
                <div className="text-sm text-muted-foreground">
                    Page {pagination.page} of {totalPages}
                </div>
            )}
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
                    {data?.data?.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                No contracts found.
                            </TableCell>
                        </TableRow>
                    )}
                    {data?.data?.map((c: any) => (
                        <TableRow key={c.id}>
                            <TableCell>{c.clientName}</TableCell>
                            <TableCell className="text-muted-foreground">{c.id}</TableCell>
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
            {/* Pagination controls */}
            {pagination && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Page {pagination.page} of {totalPages}
                        {typeof pagination.total === "number" && (
                            <span>
                                {" "}• Showing
                                {" "}
                                {data?.data?.length ? (
                                    <>
                                        {(pagination.page - 1) * pagination.pageSize + 1}–
                                        {(pagination.page - 1) * pagination.pageSize + data.data.length}
                                    </>
                                ) : (
                                    0
                                )}
                                {" "}of {pagination.total}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={pagination.page <= 1 || isFetching}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={pagination.page >= totalPages || isFetching}
                        >
                            Next <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
