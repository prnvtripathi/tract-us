"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4000";

export const useContracts = (filters?: any, page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ["contracts", filters, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters && typeof filters === "object") {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }
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
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_URL}/api/contracts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`${API_URL}/api/contracts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/api/contracts/${id}`, {
        method: "DELETE",
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
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contracts"] }),
  });
};
