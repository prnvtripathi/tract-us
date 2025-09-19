"use client";

import { useParams, useRouter } from "next/navigation";
import { useContract, useUpdateContract, useDeleteContract } from "@/hooks/useContracts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ContractStatus } from "@/components/contracts/contract-status";

export default function ContractDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const { data: contract, isLoading } = useContract(id);
    const updateContract = useUpdateContract();
    const deleteContract = useDeleteContract();

    const [clientName, setClientName] = useState("");
    const [status, setStatus] = useState("DRAFT");
    const [content, setContent] = useState("");

    useEffect(() => {
        if (contract) {
            setClientName(contract.clientName);
            setStatus(contract.status);
            setContent(contract.data?.content || "");
        }
    }, [contract]);

    if (isLoading) return <p>Loading...</p>;
    if (!contract) return <p>Contract not found.</p>;

    const handleSave = () => {
        updateContract.mutate(
            {
                id,
                data: { clientName, status, data: { content } },
            },
            {
                onSuccess: () => {
                    toast.success("Contract updated successfully!");
                },
            }
        );
    };

    const handleDelete = () => {
        deleteContract.mutate(id, {
            onSuccess: () => {
                toast.success("Contract deleted successfully!");
                router.push("/dashboard/contracts");
            },
        });
    };

    return (
        <main className="space-y-4">
            <h2 className="text-2xl font-bold mb-2">Contract Detail</h2>

            <div className="flex items-center gap-4">
                <span className="font-medium">Status:</span>
                <ContractStatus status={status} />
            </div>

            <div className="grid gap-4 max-w-xl">
                <div>
                    <label className="block mb-1 text-sm font-medium">Client Name</label>
                    <Input value={clientName} onChange={(e) => setClientName(e.target.value)} />
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium">Content</label>
                    <Textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)} />
                </div>
            </div>

            <div className="flex gap-3">
                <Button onClick={handleSave} disabled={updateContract.isPending}>
                    Save
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={deleteContract.isPending}>
                    Delete
                </Button>
            </div>
        </main>
    );
}
