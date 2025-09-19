"use client";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
	const [showSignIn, setShowSignIn] = useState(false);
	const router = useRouter();
	// If user is already logged in, redirect to dashboard
	authClient.getSession().then((session) => {
		if (session.data) {
			router.push("/dashboard");
		}
	});

	return showSignIn ? (
		<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
	) : (
		<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
	);
}
