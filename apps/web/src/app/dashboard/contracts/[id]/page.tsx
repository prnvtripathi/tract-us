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
import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Progress } from "@/components/ui/progress";

export default function ContractDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const [copied, setCopied] = useState(false);

    const { data: contract, isLoading, refetch } = useContract(id);
    const { socket } = useSocket();
    const [analysisInProgress, setAnalysisInProgress] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);

    // Socket event listeners for AI analysis lifecycle
    useEffect(() => {
        if (!socket || !id) return;

        const onStarted = (payload: any) => {
            if (payload?.contractId !== id) return;
            setAnalysisInProgress(true);
            setProgress(10);
            setLogs((l) => [...l, "AI processing started"]);
        };
        const onExtraction = (payload: any) => {
            if (payload?.contractId !== id) return;
            setProgress(40);
            setLogs((l) => [...l, payload?.progress || "Text extraction complete"]);
        };
        const onConfidence = (payload: any) => {
            if (payload?.contractId !== id) return;
            setProgress(70);
            if (payload?.confidence != null) {
                setLogs((l) => [...l, `Confidence score received: ${Number(payload.confidence).toFixed(2)}`]);
            } else {
                setLogs((l) => [...l, "Confidence score updated"]);
            }
        };
        const onSuggestion = (payload: any) => {
            if (payload?.contractId !== id) return;
            setProgress(85);
            const count = Array.isArray(payload?.suggestions) ? payload.suggestions.length : 0;
            setLogs((l) => [...l, `Generated ${count} recommendation${count === 1 ? "" : "s"}`]);
        };
        const onComplete = async (payload: any) => {
            if (payload?.contractId !== id) return;
            setProgress(100);
            setLogs((l) => [...l, payload?.error ? `Analysis failed: ${payload.error}` : "Analysis complete"]);
            setAnalysisInProgress(false);
            // Refresh contract to load metadata
            await refetch();
        };

        socket.on("ai:processing_started", onStarted);
        socket.on("ai:extraction_progress", onExtraction);
        socket.on("ai:confidence_update", onConfidence);
        socket.on("ai:suggestion_generated", onSuggestion);
        socket.on("ai:analysis_complete", onComplete);

        return () => {
            socket.off("ai:processing_started", onStarted);
            socket.off("ai:extraction_progress", onExtraction);
            socket.off("ai:confidence_update", onConfidence);
            socket.off("ai:suggestion_generated", onSuggestion);
            socket.off("ai:analysis_complete", onComplete);
        };
    }, [socket, id, refetch]);

    // If metadata already exists, ensure progress shows as complete
    useEffect(() => {
        if (contract?.metadata) {
            setProgress(100);
            setAnalysisInProgress(false);
        }
    }, [contract?.metadata]);

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


    const contractData = typeof contract.data === "string" ? contract.data : JSON.parse(JSON.stringify(contract.data, null, 2))
    // check if contractData has a content property (for parsed PDFs)
    const isString = typeof contractData === "string"

    const parsedContractData = isString ? (() => {
        try {
            return JSON.parse(contractData);
        } catch {
            return { content: contractData };
        }
    })() : contractData;

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

                    {/* AI Analysis */}
                    <Card className="border-0 shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                AI Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {analysisInProgress && (
                                <div className="space-y-3">
                                    <Progress value={progress} />
                                    <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
                                        {logs.map((m, i) => (
                                            <li key={i}>{m}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {!analysisInProgress && !contract?.metadata && (
                                <p className="text-sm text-muted-foreground">No AI analysis available yet.</p>
                            )}
                            {!analysisInProgress && contract?.metadata && (
                                <div className="space-y-4">
                                    {/* Summary */}
                                    {contract.metadata.summary && (
                                        <div>
                                            <h4 className="font-semibold mb-1">Summary</h4>
                                            <p className="text-sm text-muted-foreground">{contract.metadata.summary}</p>
                                        </div>
                                    )}
                                    {/* Parties */}
                                    {Array.isArray(contract.metadata.parties) && contract.metadata.parties.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold mb-1">Parties</h4>
                                            <div className="space-y-2">
                                                {contract.metadata.parties.map((p: any, idx: number) => (
                                                    <div key={idx} className="text-sm">
                                                        <div className="font-medium">{p?.name} {p?.role ? <span className="text-muted-foreground">({p.role})</span> : null}</div>
                                                        {p?.contact_info && <div className="text-muted-foreground">{p.contact_info}</div>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {/* Dates */}
                                    {contract.metadata.dates && (
                                        <div>
                                            <h4 className="font-semibold mb-1">Key Dates</h4>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                {Object.entries(contract.metadata.dates).map(([k, v]: any) => (
                                                    <div key={k} className="flex justify-between">
                                                        <span className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}</span>
                                                        <span>{v || "—"}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {/* Obligations */}
                                    {Array.isArray(contract.metadata.obligations) && contract.metadata.obligations.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold mb-1">Obligations</h4>
                                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                                {contract.metadata.obligations.map((o: any, idx: number) => (
                                                    <li key={idx}>
                                                        <span className="font-medium">{o?.party}:</span> {o?.text}
                                                        {o?.deadline && <span className="text-muted-foreground"> (by {o.deadline})</span>}
                                                        {o?.category && <span className="ml-1 px-1.5 py-0.5 text-xs rounded bg-muted">{o.category}</span>}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {/* Financial Terms */}
                                    {Array.isArray(contract.metadata.financial_terms) && contract.metadata.financial_terms.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold mb-1">Financial Terms</h4>
                                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                                {contract.metadata.financial_terms.map((f: any, idx: number) => (
                                                    <li key={idx}>
                                                        {f?.amount} {f?.currency} {f?.frequency ? `(${f.frequency})` : ""} — <span className="text-muted-foreground">{f?.description}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {/* Risk Assessment */}
                                    {contract.metadata.risk_assessment && (
                                        <div className="space-y-2">
                                            <h4 className="font-semibold mb-1">Risk Assessment</h4>
                                            <div className="text-sm">Level: <span className="font-medium">{contract.metadata.risk_assessment.risk_level}</span></div>
                                            {Array.isArray(contract.metadata.risk_assessment.risk_factors) && (
                                                <div>
                                                    <div className="text-sm font-medium">Risk Factors</div>
                                                    <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                                        {contract.metadata.risk_assessment.risk_factors.map((r: any, idx: number) => (
                                                            <li key={idx}>{r}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {Array.isArray(contract.metadata.risk_assessment.recommendations) && (
                                                <div>
                                                    <div className="text-sm font-medium">Recommendations</div>
                                                    <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                                        {contract.metadata.risk_assessment.recommendations.map((r: any, idx: number) => (
                                                            <li key={idx}>{r}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {/* Confidence */}
                                    {contract.metadata.confidence_score != null && (
                                        <div className="text-sm">Confidence Score: <span className="font-medium">{Number(contract.metadata.confidence_score).toFixed(2)}</span></div>
                                    )}
                                    {/* Unclear sections */}
                                    {Array.isArray(contract.metadata.unclear_sections) && contract.metadata.unclear_sections.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold mb-1">Unclear Sections</h4>
                                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                                {contract.metadata.unclear_sections.map((u: any, idx: number) => (
                                                    <li key={idx}>
                                                        <span className="font-medium">{u?.section}:</span> {u?.issue}
                                                        {u?.priority && <span className="ml-1 text-muted-foreground">({u.priority})</span>}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
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
                                    {parsedContractData.content || (
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