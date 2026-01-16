"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const email = searchParams.get("email");

    // Store email in localStorage for credit tracking
    if (email) {
      localStorage.setItem("user_email", email);
    }

    if (sessionId) {
      // Wait a moment for webhook to process, then redirect
      setTimeout(() => {
        setLoading(false);
        router.push("/");
      }, 2000);
    } else {
      router.push("/");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-blue-900 mb-2">
              Processing Payment...
            </h2>
            <p className="text-gray-600">
              Please wait while we add your credits.
            </p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-blue-900 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your 10 credits have been added to your account.
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Return to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
