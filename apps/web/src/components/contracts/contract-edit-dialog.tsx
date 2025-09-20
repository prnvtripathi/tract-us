"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useUpdateContract } from "@/hooks/useContracts";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { ContractStatus as StatusBadge } from "./contract-status";

type Contract = {
    id: string;
    clientName: string;
    contractId?: string;
    status: "DRAFT" | "FINALIZED";
    data?: Record<string, any> | null;
};

export function ContractEditDialog({
    contract,
    trigger,
    onUpdated,
}: {
    contract: Contract;
    trigger?: React.ReactNode;
    onUpdated?: (updated: any) => void;
}) {
    const [open, setOpen] = useState(false);
    const update = useUpdateContract();

    const initial = useMemo(
        () => ({
            clientName: contract?.clientName ?? "",
            status: (contract?.status as "DRAFT" | "FINALIZED") ?? "DRAFT",
            content: (contract?.data as any)?.content ?? "",
        }),
        [contract]
    );

    const [clientName, setClientName] = useState(initial.clientName);
    const [status, setStatus] = useState<"DRAFT" | "FINALIZED">(initial.status);
    const [content, setContent] = useState(initial.content);

    useEffect(() => {
        if (open) {
            setClientName(initial.clientName);
            setStatus(initial.status);
            setContent(initial.content);
        }
    }, [open, initial]);

    const onSave = () => {
        update.mutate(
            {
                id: contract.id,
                data: {
                    clientName,
                    status,
                    data: { ...(contract.data || {}), content },
                },
            },
            {
                onSuccess: (res) => {
                    toast.success("Contract updated");
                    setOpen(false);
                    onUpdated?.(res);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>Edit Contract</DialogTitle>
                    <DialogDescription>
                        Update the contract details below and click save when you're done.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Client name</label>
                        <Input
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            placeholder="Enter client name"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DRAFT">Draft</SelectItem>
                                <SelectItem value="FINALIZED">Finalized</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="pt-1">
                            <StatusBadge status={status} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Content</label>
                        <Textarea
                            rows={8}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write or paste contract content"
                            className="resize-none"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={update.isPending}>
                        Cancel
                    </Button>
                    <Button onClick={onSave} disabled={update.isPending}>
                        {update.isPending ? "Saving..." : "Save changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default ContractEditDialog;
