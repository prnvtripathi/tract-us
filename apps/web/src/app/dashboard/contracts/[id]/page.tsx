"use client";

import { useParams, useRouter } from "next/navigation";
import { useContract } from "@/hooks/useContracts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractStatus } from "@/components/contracts/contract-status";
import { ContractEditDialog } from "@/components/contracts/contract-edit-dialog";
import { ContractDeleteDialog } from "@/components/contracts/contract-delete-dialog";

export default function ContractDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const { data: contract, isLoading } = useContract(id);

    if (isLoading) return <p>Loading...</p>;
    if (!contract) return <p>Contract not found.</p>;

    return (
        <main className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold mb-2">Contract Detail</h2>
                <div className="flex gap-2">
                    <ContractEditDialog contract={contract} />
                    <ContractDeleteDialog id={contract.id} clientName={contract.clientName} onDeleted={() => router.push("/dashboard/contracts")} />
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <span>{contract.clientName}</span>
                        <ContractStatus status={contract.status} />
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                        Contract ID: {contract.contractId}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div>
                            <div className="text-sm font-medium">Client</div>
                            <div>{contract.clientName}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium">Status</div>
                            <div className="mt-1"><ContractStatus status={contract.status} /></div>
                        </div>
                        <div>
                            <div className="text-sm font-medium">Content</div>
                            <div className="mt-1 whitespace-pre-wrap text-sm border rounded-md p-3 bg-muted/30">
                                {contract?.data?.content || "—"}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
