"use client";

import { useParams, useRouter } from "next/navigation";
import { useContract } from "@/hooks/useContracts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ContractStatus } from "@/components/contracts/contract-status";
import { ContractEditDialog } from "@/components/contracts/contract-edit-dialog";
import { ContractDeleteDialog } from "@/components/contracts/contract-delete-dialog";
import { ArrowLeft, FileText, User, Calendar, Hash, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function ContractDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const [copied, setCopied] = useState(false);

    const { data: contract, isLoading } = useContract(id);

    const copyContractId = async () => {
        if (contract?.id) {
            await navigator.clipboard.writeText(contract.id);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">Contract not found</h3>
                <p className="text-muted-foreground">The contract you're looking for doesn't exist.</p>
                <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard/contracts")}
                    className="mt-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Contracts
                </Button>
            </div>
        );
    }

    console.log({ contract });

    return (
        <main className="container mx-auto p-6 max-w-4xl space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/dashboard/contracts")}
                        className="p-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Contract Details</h1>
                        <p className="text-muted-foreground mt-1">
                            View and manage contract information
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <ContractEditDialog contract={contract} />
                    <ContractDeleteDialog
                        id={contract.id}
                        clientName={contract.clientName}
                        onDeleted={() => router.push("/dashboard/contracts")}
                    />
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Client & Status Card */}
                    <Card className="border-0 shadow-md">
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <CardTitle className="text-2xl flex items-center gap-3">
                                        <User className="h-6 w-6 text-primary" />
                                        <span>{contract.clientName}</span>
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Hash className="h-4 w-4 text-muted-foreground" />
                                        <CardDescription className="font-mono text-sm">
                                            {contract.id}
                                        </CardDescription>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={copyContractId}
                                            className="h-6 w-6 p-0"
                                        >
                                            {copied ? (
                                                <Check className="h-3 w-3 text-green-600" />
                                            ) : (
                                                <Copy className="h-3 w-3" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <ContractStatus status={contract.status} />
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Contract Content */}
                    <Card className="border-0 shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Contract Content
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm max-w-none">
                                <div className="whitespace-pre-wrap text-sm leading-relaxed p-4 bg-muted/30 rounded-lg border-l-4 border-primary/20">
                                    {contract?.data?.content || (
                                        <div className="text-muted-foreground italic flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            No content available
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Quick Info */}
                <div className="space-y-6">
                    {/* Quick Info Card */}
                    <Card className="border-0 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Client</span>
                                    <Badge variant="secondary" className="font-medium">
                                        {contract.clientName}
                                    </Badge>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                                    <ContractStatus status={contract.status} />
                                </div>
                                {contract.createdAt && (
                                    <>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-muted-foreground">Created</span>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(contract.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </main>
    );
}