"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4000";

export const useContracts = (filters?: any, page = 1, pageSize = 10) => {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id as string | undefined;

  return useQuery({
    queryKey: ["contracts", filters, page, pageSize],
    queryFn: async () => {
      if (!userId) {
        throw new Error("Not authenticated");
      }
      const params = new URLSearchParams();
      if (filters && typeof filters === "object") {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }
      params.set("userId", userId);
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      const res = await fetch(`${API_URL}/api/contracts?${params.toString()}`);
      if (!res.ok) {
        let message = `Request failed with status ${res.status}`;
        try {
          const body = await res.json();
          message = body?.message || message;
        } catch (error) {
          console.error("Failed to parse error response", error);
        }
        throw new Error(message);
      }
      return res.json();
    },
    enabled: !!userId,
  });
};

export const useContract = (id: string) => {
  return useQuery({
    queryKey: ["contract", id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/contracts/${id}`);
      if (!res.ok) {
        let message = `Request failed with status ${res.status}`;
        try {
          const body = await res.json();
          message = body?.message || message;
        } catch (error) {
          console.error("Failed to parse error response", error);
        }
        throw new Error(message);
      }
      return res.json();
    },
    enabled: !!id,
  });
};

export const useCreateContract = () => {
  const qc = useQueryClient();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id as string | undefined;
  return useMutation({
    mutationFn: async (data: any) => {
      if (!userId) {
        throw new Error("Not authenticated");
      }
      const res = await fetch(`${API_URL}/api/contracts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId }),
      });
      if (!res.ok) {
        let message = `Request failed with status ${res.status}`;
        try {
          const body = await res.json();
          message = body?.message || message;
        } catch (error) {
          console.error("Failed to parse error response", error);
        }
        throw new Error(message);
      }
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contracts"] }),
  });
};

export const useUpdateContract = () => {
  const qc = useQueryClient();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id as string | undefined;
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      if (!userId) {
        throw new Error("Not authenticated");
      }
      const res = await fetch(`${API_URL}/api/contracts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId }),
      });
      if (!res.ok) {
        let message = `Request failed with status ${res.status}`;
        try {
          const body = await res.json();
          message = body?.message || message;
        } catch (error) {
          console.error("Failed to parse error response", error);
        }
        throw new Error(message);
      }
      return res.json();
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["contract", id] });
      qc.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
};

export const useDeleteContract = () => {
  const qc = useQueryClient();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id as string | undefined;
  return useMutation({
    mutationFn: async (id: string) => {
      if (!userId) {
        throw new Error("Not authenticated");
      }
      const res = await fetch(
        `${API_URL}/api/contracts/${id}?userId=${encodeURIComponent(userId)}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        let message = `Request failed with status ${res.status}`;
        try {
          const body = await res.json();
          message = body?.message || message;
        } catch (error) {
          console.error("Failed to parse error response", error);
        }
        throw new Error(message);
      }
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contracts"] }),
  });
};

// Analyze a contract by uploading a PDF (optional metadata included)
export const useAnalyzeContract = () => {
  const qc = useQueryClient();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id as string | undefined;

  return useMutation({
    mutationFn: async ({
      clientName,
      data,
      status,
      file,
    }: {
      clientName: string;
      data: any;
      status?: "DRAFT" | "FINALIZED";
      file: File;
    }) => {
      if (!userId) {
        throw new Error("Not authenticated");
      }
      const formData = new FormData();
      formData.append("file", file);
      formData.append("clientName", clientName);
      formData.append("data", JSON.stringify(data ?? {}));
      formData.append("status", status ?? "DRAFT");
      formData.append("userId", userId);

      const res = await fetch(`${API_URL}/api/ai/analyze`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        let message = `Request failed with status ${res.status}`;
        try {
          const body = await res.json();
          message = body?.message || body?.error || message;
        } catch (error) {
          console.error("Failed to parse error response", error);
        }
        throw new Error(message);
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
};
