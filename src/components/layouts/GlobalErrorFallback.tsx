import errorAnimation from "@/assets/lottie/error.json";
import Lottie from "lottie-react";
import type { FallbackProps } from "react-error-boundary";

export const GlobalErrorFallback: React.FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  console.error("Unexpected error occurred:", error);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <Lottie
            animationData={errorAnimation}
            loop={true}
            autoplay={true}
            style={{ width: 200, height: 200, margin: "0 auto" }}
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Something went wrong
          </h1>
          <p className="leading-relaxed text-gray-600">
            An unexpected error occurred while loading the application.
            <br />
            Please try refreshing the page or contact support if the problem
            persists.
          </p>
        </div>

        <div className="mt-8">
          <button
            onClick={resetErrorBoundary}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
};
