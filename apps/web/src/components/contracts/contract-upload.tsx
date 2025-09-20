"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateContract } from "@/hooks/useContracts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// Function to generate UUID v4
function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const contractSchema = z.object({
    clientName: z.string().min(1, "Client name is required"),
    data: z.string().min(1, "Contract data is required"),
    status: z.enum(["DRAFT", "FINALIZED"]),
});

type ContractFormValues = z.infer<typeof contractSchema>;

export function ContractUpload() {
    const createContract = useCreateContract();

    const form = useForm<ContractFormValues>({
        resolver: zodResolver(contractSchema),
        defaultValues: {
            clientName: "",
            data: "",
            status: "DRAFT",
        },
    });

    const onSubmit = (values: ContractFormValues) => {
        let parsedData: any;
        try {
            parsedData = JSON.parse(values.data);
        } catch {
            parsedData = { content: values.data };
        }

        // Generate UUID for the contract
        const contractId = generateUUID();

        createContract.mutate(
            {
                clientName: values.clientName,
                contractId: contractId,
                data: parsedData,
                status: values.status,
            },
            {
                onSuccess: () => {
                    toast.success("Contract uploaded successfully");
                    form.reset();
                },
                onError: (err: any) => {
                    toast.error(err?.message || "Failed to upload contract");
                },
            }
        );
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
                    <Button type="submit" disabled={createContract.isPending}>
                        {createContract.isPending ? "Uploading..." : "Upload Contract"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}