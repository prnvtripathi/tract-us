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
    const [currentStep, setCurrentStep] = useState<string>("");

    // Socket event listeners for AI analysis lifecycle
    useEffect(() => {
        if (!socket || !id) return;

        const onStarted = (payload: any) => {
            if (payload?.contractId !== id) return;
            console.log("AI processing started:", payload);
            setAnalysisInProgress(true);
            setProgress(10);
            setCurrentStep("Starting analysis...");
            setLogs((prev) => [...prev, "🚀 AI processing started"]);
        };

        const onExtraction = (payload: any) => {
            if (payload?.contractId !== id) return;
            console.log("Extraction progress:", payload);
            // In case the initial started event was missed, ensure the UI shows progress
            setAnalysisInProgress(true);
            setProgress(40);
            setCurrentStep("Extracting text from document...");
            setLogs((prev) => [...prev, `📄 ${payload?.progress || "Text extraction complete"}`]);
        };

        const onConfidence = (payload: any) => {
            if (payload?.contractId !== id) return;
            console.log("Confidence update:", payload);
            // Ensure progress UI remains visible even if 'started' was missed
            setAnalysisInProgress(true);
            setProgress(70);
            setCurrentStep("Calculating confidence score...");
            if (payload?.confidence != null) {
                setLogs((prev) => [...prev, `🎯 Confidence score: ${Number(payload.confidence).toFixed(2)}`]);
            } else {
                setLogs((prev) => [...prev, "🎯 Confidence score updated"]);
            }
        };

        const onSuggestion = (payload: any) => {
            if (payload?.contractId !== id) return;
            console.log("Suggestion generated:", payload);
            // Ensure progress UI remains visible even if 'started' was missed
            setAnalysisInProgress(true);
            setProgress(85);
            setCurrentStep("Generating recommendations...");
            const count = Array.isArray(payload?.suggestions) ? payload.suggestions.length : 0;
            setLogs((prev) => [...prev, `💡 Generated ${count} recommendation${count === 1 ? "" : "s"}`]);
        };

        const onComplete = async (payload: any) => {
            if (payload?.contractId !== id) return;
            console.log("Analysis complete:", payload);
            setProgress(100);
            setCurrentStep(payload?.error ? "Analysis failed" : "Analysis complete!");
            setLogs((prev) => [...prev, payload?.error ? `❌ Analysis failed: ${payload.error}` : "✅ Analysis complete"]);

            // Wait a moment before hiding the progress to show completion
            setTimeout(() => {
                setAnalysisInProgress(false);
                setCurrentStep("");
            }, 2000);

            // reload the page to fetch updated contract data
            router.refresh();

            // Refresh contract to load metadata
            await refetch();
        };

        // Listen to socket events
        socket.on("ai:processing_started", onStarted);
        socket.on("ai:extraction_progress", onExtraction);
        socket.on("ai:confidence_update", onConfidence);
        socket.on("ai:suggestion_generated", onSuggestion);
        socket.on("ai:analysis_complete", onComplete);

        // Ask server for current state in case we missed early events
        socket.emit("ai:state_request", { contractId: id });

        return () => {
            socket.off("ai:processing_started", onStarted);
            socket.off("ai:extraction_progress", onExtraction);
            socket.off("ai:confidence_update", onConfidence);
            socket.off("ai:suggestion_generated", onSuggestion);
            socket.off("ai:analysis_complete", onComplete);
        };
    }, [socket, id, refetch]);

    // Initialize progress if contract already has metadata
    useEffect(() => {
        if (contract?.metadata && JSON.stringify(contract.metadata) !== "{}" && !analysisInProgress) {
            setProgress(100);
            setLogs((prev) => prev.length === 0 ? ["✅ Analysis previously completed"] : prev);
        }
    }, [contract?.metadata, analysisInProgress]);

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

    const hasMetadata = contract.metadata && JSON.stringify(contract.metadata) !== "{}";

    return (
        <main className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/dashboard/contracts")}
                        className="p-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Contract Details</h1>
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
                    {(hasMetadata || analysisInProgress || logs.length > 0) && (
                        <Card className="border-0 shadow-md">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    AI Analysis
                                    {analysisInProgress && (
                                        <Badge variant="secondary" className="ml-2 animate-pulse">
                                            Processing...
                                        </Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Progress Section - Show when analysis is in progress or has logs */}
                                {(analysisInProgress || logs.length > 0) && (
                                    <div className="space-y-3">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    {currentStep || "Analysis Progress"}
                                                </span>
                                                <span className="font-medium">{progress}%</span>
                                            </div>
                                            <Progress value={progress} className="h-2" />
                                        </div>

                                        {logs.length > 0 && (
                                            <div className="bg-muted/30 rounded-lg p-3 max-h-32 overflow-y-auto">
                                                <div className="text-xs font-medium text-muted-foreground mb-2">
                                                    Activity Log:
                                                </div>
                                                <ul className="text-xs text-muted-foreground space-y-1">
                                                    {logs.map((log, i) => (
                                                        <li key={i} className="flex items-start gap-1">
                                                            <span className="opacity-50 shrink-0">•</span>
                                                            <span>{log}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Analysis Results - Show when not in progress and has metadata */}
                                {!analysisInProgress && hasMetadata && (
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

                                {/* No analysis state */}
                                {!analysisInProgress && logs.length === 0 && !hasMetadata && (
                                    <div className="text-center py-8">
                                        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">No AI analysis available yet.</p>
                                        <p className="text-xs text-muted-foreground mt-1">Analysis will start automatically when a contract is uploaded.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

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
                                {/* Analysis Status */}
                                <Separator />
                                {JSON.stringify(contract.metadata) !== "{}" && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">AI Analysis</span>
                                        <Badge
                                            variant={analysisInProgress ? "secondary" : hasMetadata ? "default" : "outline"}
                                            className={analysisInProgress ? "animate-pulse" : ""}
                                        >
                                            {analysisInProgress ? "Processing..." : hasMetadata ? "Complete" : "Pending"}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}