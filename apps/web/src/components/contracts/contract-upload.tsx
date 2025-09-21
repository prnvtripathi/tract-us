"use client";

import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAnalyzeContract, useCreateContract } from "@/hooks/useContracts";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";


const contractSchema = z.object({
    clientName: z.string().min(1, "Client name is required"),
    data: z.string().min(1, "Contract data is required"),
    status: z.enum(["DRAFT", "FINALIZED"]),
});

type ContractFormValues = z.infer<typeof contractSchema>;

export function ContractUpload() {
    const createContract = useCreateContract();
    const analyzeContract = useAnalyzeContract();
    const router = useRouter();
    const [file, setFile] = React.useState<File | null>(null);
    const form = useForm<ContractFormValues>({
        resolver: zodResolver(contractSchema),
        defaultValues: {
            clientName: "",
            data: "",
            status: "DRAFT",
        },
    });

    const onSubmit = async (values: ContractFormValues) => {
        let parsedData: any;
        try {
            parsedData = JSON.parse(values.data);
        } catch {
            parsedData = { content: values.data };
        }

        if (file) {
            analyzeContract.mutate(
                {
                    clientName: values.clientName,
                    data: parsedData,
                    status: values.status,
                    file,
                },
                {
                    onSuccess: (body: any) => {
                        toast.success("Upload started. Redirecting to details...");
                        form.reset();
                        setFile(null);
                        const contractId = body?.contractId;
                        if (contractId) router.push(`/dashboard/contracts/${contractId}`);
                    },
                    onError: (err: any) => {
                        console.error(err);
                        toast.error(err?.message || "Failed to upload and analyze file");
                    },
                }
            );
        } else {
            createContract.mutate(
                {
                    clientName: values.clientName,
                    data: parsedData,
                    status: values.status,
                },
                {
                    onSuccess: (contract: any) => {
                        toast.success("Contract uploaded successfully");
                        form.reset();
                        if (contract?.id) router.push(`/dashboard/contracts/${contract.id}`);
                    },
                    onError: (err: any) => {
                        toast.error(err?.message || "Failed to upload contract");
                    },
                }
            );
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Upload Contract</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    {/* Client Name */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="clientName">Client Name</Label>
                        <Input
                            id="clientName"
                            {...form.register("clientName")}
                            placeholder="Enter client name"
                        />
                        {form.formState.errors.clientName && (
                            <span className="text-sm text-red-500">{form.formState.errors.clientName.message}</span>
                        )}
                    </div>

                    {/* Contract Data */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="data">Contract Data (Text or JSON)</Label>
                        <Textarea
                            id="data"
                            rows={8}
                            {...form.register("data")}
                            placeholder='Enter contract text or {"key":"value"}'
                            className="resize-none"
                        />
                        {form.formState.errors.data && (
                            <span className="text-sm text-red-500">{form.formState.errors.data.message}</span>
                        )}
                    </div>

                    {/* Optional File Upload */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="file">Upload PDF (optional)</Label>
                        <Input
                            id="file"
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                        <p className="text-xs text-muted-foreground">If provided, the file will be analyzed by AI and progress will be shown on the details page.</p>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-2">
                        <Label>Status</Label>
                        <Select
                            value={form.watch("status")}
                            onValueChange={(val) => form.setValue("status", val as "DRAFT" | "FINALIZED")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DRAFT">Draft</SelectItem>
                                <SelectItem value="FINALIZED">Finalized</SelectItem>
                            </SelectContent>
                        </Select>
                        {form.formState.errors.status && (
                            <span className="text-sm text-red-500">{form.formState.errors.status.message}</span>
                        )}
                    </div>

                    {/* Submit */}
                    <Button type="submit" disabled={createContract.isPending || analyzeContract.isPending}>
                        {createContract.isPending || analyzeContract.isPending ? "Saving..." : file ? "Upload & Analyze" : "Save Contract"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}