"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function Home() {
	const { data: session, isPending } = authClient.useSession();
	const [apiStatus, setApiStatus] = useState<"unknown" | "ok" | "error">("unknown");
	const apiBase = useMemo(() => process.env.NEXT_PUBLIC_SERVER_URL, []);

	useEffect(() => {
		if (!apiBase) return;
		let cancelled = false;
		const run = async () => {
			try {
				const res = await fetch(`${apiBase}/api/healthz`, {
					credentials: "include",
				});
				if (!cancelled) setApiStatus(res.ok ? "ok" : "error");
			} catch (_) {
				if (!cancelled) setApiStatus("error");
			}
		};
		run();
		return () => {
			cancelled = true;
		};
	}, [apiBase]);

	return (
		<div className="container mx-auto max-w-5xl px-4 py-10">
			<header className="mb-8 flex items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">TractUs Assignment</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Next.js + Express + Prisma + PostgreSQL with Better-Auth, S3, and AI integrations
					</p>
				</div>

				<div className="flex shrink-0 items-center gap-2">
					{isPending ? (
						<span className="text-sm text-muted-foreground">Loading…</span>
					) : session?.user ? (
						<Link
							href="/dashboard"
							className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow hover:opacity-90"
						>
							Go to Dashboard
						</Link>
					) : (
						<Link
							href="/auth/login"
							className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
						>
							Sign in / Sign up
						</Link>
					)}
				</div>
			</header>

			<div className="grid gap-6">
				<section className="rounded-lg border p-4">
					<h2 className="mb-2 font-medium">API Status</h2>
					<div className="flex items-center justify-between text-sm">
						<div>
							<div>
								Base URL: {apiBase ? (
									<a className="underline" href={apiBase} target="_blank" rel="noreferrer">
										{apiBase}
									</a>
								) : (
									<span className="text-muted-foreground">Not configured (NEXT_PUBLIC_SERVER_URL)</span>
								)}
							</div>
							<div className="mt-1">
								Health: {apiStatus === "unknown" && <span className="text-muted-foreground">Checking…</span>}
								{apiStatus === "ok" && <span className="text-green-600">OK</span>}
								{apiStatus === "error" && <span className="text-red-600">Unavailable</span>}
							</div>
						</div>
						{apiBase && (
							<a
								className="rounded-md border px-3 py-2 text-xs font-medium hover:bg-accent"
								href={`${apiBase}/api/healthz`}
								target="_blank"
								rel="noreferrer"
							>
								Open /api/healthz
							</a>
						)}
					</div>
				</section>

				<section className="rounded-lg border p-4">
					<h2 className="mb-2 font-medium">Features</h2>
					<ul className="list-inside list-disc text-sm text-muted-foreground">
						<li>TypeScript across web and server</li>
						<li>Next.js frontend and Express API</li>
						<li>Prisma ORM with PostgreSQL</li>
						<li>Authentication via Better-Auth</li>
						<li>Socket.IO realtime updates</li>
						<li>AWS S3 for file storage</li>
						<li>Mistral OCR + Groq LLM for analysis</li>
						<li>TailwindCSS + shadcn/ui for UI</li>
						<li>Turborepo-managed monorepo</li>
					</ul>
				</section>

				<section className="rounded-lg border p-4">
					<h2 className="mb-2 font-medium">Apps & Ports</h2>
					<ul className="list-inside list-disc text-sm text-muted-foreground">
						<li>Web (Next.js): http://localhost:3000</li>
						<li>API & Socket.IO (Express): http://localhost:4000</li>
					</ul>
				</section>

				<section className="rounded-lg border p-4">
					<h2 className="mb-2 font-medium">Quick start</h2>
					<ol className="list-inside list-decimal text-sm text-muted-foreground">
						<li>Install deps with pnpm</li>
						<li>Create apps/server/.env and apps/web/.env</li>
						<li>Provision database and run pnpm db:push</li>
						<li>Start both apps with pnpm dev</li>
					</ol>
				</section>

				<section className="rounded-lg border p-4">
					<h2 className="mb-2 font-medium">Troubleshooting</h2>
					<ul className="list-inside list-disc text-sm text-muted-foreground">
						<li>Set NEXT_PUBLIC_SERVER_URL to the API base (e.g., http://localhost:4000)</li>
						<li>Ensure CORS_ORIGIN matches your web origin</li>
						<li>Verify DATABASE_URL is reachable for Prisma</li>
					</ul>
				</section>
			</div>
		</div>
	);
}
