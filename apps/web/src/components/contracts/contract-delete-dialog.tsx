"use client";

import { useState } from "react";
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
import { useDeleteContract } from "@/hooks/useContracts";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export function ContractDeleteDialog({
  id,
  clientName,
  trigger,
  onDeleted,
}: {
  id: string;
  clientName?: string;
  trigger?: React.ReactNode;
  onDeleted?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const del = useDeleteContract();

  const onConfirm = () => {
    del.mutate(id, {
      onSuccess: () => {
        toast.success("Contract deleted");
        setOpen(false);
        onDeleted?.();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete contract?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete
            {clientName ? ` the contract for "${clientName}"` : " this contract"}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={del.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={del.isPending}>
            {del.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ContractDeleteDialog;
