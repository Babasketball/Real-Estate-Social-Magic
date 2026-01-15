"use client";

import { useState, useEffect } from "react";

interface SocialMediaPosts {
  instagram: string;
  linkedin: string;
  facebook: string;
  x: string;
  tiktok: string;
}

export default function Home() {
  const [propertyDescription, setPropertyDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [posts, setPosts] = useState<SocialMediaPosts | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkCredits = async () => {
      try {
        // Get email from localStorage (set after Stripe checkout)
        const storedEmail = localStorage.getItem("user_email");
        setUserEmail(storedEmail);

        if (storedEmail) {
          const response = await fetch("/api/credits", {
            headers: {
              "x-user-email": storedEmail,
            },
          });
          const data = await response.json();
          setCredits(data.credits || 0);
        } else {
          // No email = no credits tracking yet
          setCredits(0);
        }
      } catch (error) {
        console.error("Error checking credits:", error);
        setCredits(0);
      } finally {
        setLoadingCredits(false);
      }
    };

    checkCredits();

    // Check for email updates (e.g., after Stripe checkout)
    const interval = setInterval(() => {
      const storedEmail = localStorage.getItem("user_email");
      if (storedEmail !== userEmail) {
        checkCredits();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [userEmail]);

  const handleGenerate = async () => {
    if (!propertyDescription.trim()) {
      setError("Please enter a property description");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setPosts(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      // Add email header if available
      if (userEmail) {
        headers["x-user-email"] = userEmail;
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers,
        body: JSON.stringify({ text: propertyDescription }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate posts");
      }

      const data = await response.json();
      setPosts(data);
      
      // Refresh credits after generation
      if (userEmail) {
        const creditsResponse = await fetch("/api/credits", {
          headers: {
            "x-user-email": userEmail,
          },
        });
        const creditsData = await creditsResponse.json();
        setCredits(creditsData.credits || 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBuyCredits = async () => {
    try {
      // Prompt for email if not stored
      let email = userEmail;
      if (!email) {
        email = prompt("Please enter your email address to purchase credits:");
        if (!email || !email.includes("@")) {
          setError("Valid email address is required");
          return;
        }
        localStorage.setItem("user_email", email);
        setUserEmail(email);
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      });

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        setError("Failed to create checkout session");
      }
    } catch (err) {
      setError("Failed to start checkout process");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-3">
            Real Estate Social Magic
          </h1>
          <p className="text-lg md:text-xl text-blue-700">
            Transform your property descriptions into engaging social media content
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
          <label
            htmlFor="property-description"
            className="block text-sm font-semibold text-blue-900 mb-3"
          >
            Property Description
          </label>
          <textarea
            id="property-description"
            value={propertyDescription}
            onChange={(e) => setPropertyDescription(e.target.value)}
            placeholder="Enter your property description here..."
            className="w-full h-64 md:h-80 p-4 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none text-gray-800 placeholder-gray-400"
          />
          {loadingCredits ? (
            <button
              disabled
              className="mt-4 w-full md:w-auto px-8 py-3 bg-gray-400 text-white font-semibold rounded-lg cursor-not-allowed"
            >
              Loading...
            </button>
          ) : credits < 10 ? (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Credits: <span className="font-semibold text-red-600">{credits}</span>{" "}
                  {userEmail ? "(Need 10 to generate)" : "(Enter email at checkout to track credits)"}
                </span>
              </div>
              <button
                onClick={handleBuyCredits}
                className="w-full md:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Buy 10 Credits - $5.00
              </button>
              <p className="mt-2 text-sm text-gray-500">
                Each prompt costs 10 credits ($5).
              </p>
            </div>
          ) : (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Credits: <span className="font-semibold text-blue-600">{credits}</span>
                </span>
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
              >
                {isGenerating ? "Generating..." : "Generate"}
              </button>
              <p className="mt-2 text-sm text-gray-500">
                Each prompt costs 10 credits ($5).
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {posts && (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-900 text-center">
              Generated Social Media Posts
            </h2>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-pink-500">
              <h3 className="text-lg font-bold text-pink-600 mb-3">📷 Instagram</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{posts.instagram}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600">
              <h3 className="text-lg font-bold text-blue-600 mb-3">💼 LinkedIn</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{posts.linkedin}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-bold text-blue-500 mb-3">👥 Facebook</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{posts.facebook}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-black">
              <h3 className="text-lg font-bold text-gray-800 mb-3">𝕏 X (Twitter)</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{posts.x}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-black">
              <h3 className="text-lg font-bold text-gray-800 mb-3">🎵 TikTok Script</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{posts.tiktok}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
