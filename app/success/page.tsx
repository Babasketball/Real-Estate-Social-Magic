import { Suspense } from "react";
import SuccessClient from "./SuccessClient";

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-blue-900 mb-2">
              Processing Payment...
            </h2>
            <p className="text-gray-600">
              Please wait while we add your credits.
            </p>
          </div>
        </div>
      }
    >
      <SuccessClient />
    </Suspense>
  );
}
