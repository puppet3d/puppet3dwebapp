import Lottie from "lottie-react";
import errorAnimation from "../../assets/lottie/error.json";

const WebGLFallback = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-md text-center">
        {/* Lottie Animation */}
        <div className="mb-8">
          <Lottie
            animationData={errorAnimation}
            loop={true}
            autoplay={true}
            style={{ width: 200, height: 200, margin: "0 auto" }}
          />
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-800">
            WebGL is not supported in your browser
          </h1>
          <p className="leading-relaxed text-gray-600">
            Puppet3D uses WebGL technology for 3D graphics.
            <br />
            Please update to the latest browser or use a browser that supports
            WebGL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-blue-700"
          >
            Refresh Page
          </button>
          <button
            onClick={() => window.history.back()}
            className="w-full rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-300"
          >
            Go Back
          </button>
        </div>

        {/* Browser Support Info */}
        <div className="mt-8 rounded-lg bg-blue-50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-blue-800">
            Supported Browsers
          </h3>
          <div className="space-y-1 text-xs text-blue-700">
            <p>• Chrome 9+ (Recommended)</p>
            <p>• Firefox 4+</p>
            <p>• Safari 5.1+</p>
            <p>• Edge 12+</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebGLFallback;
