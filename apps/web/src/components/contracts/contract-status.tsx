import { Badge } from "@/components/ui/badge";

export function ContractStatus({ status }: { status: string }) {
    const color =
        status === "FINALIZED" ? "bg-green-500" : "bg-yellow-500";

    return <Badge className={color}>{status}</Badge>;
}
