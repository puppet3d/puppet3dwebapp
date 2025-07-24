import { useState } from "react";
import { FileUpload } from "./components/FileUpload";
import { ModelViewer } from "./components/ModelViewer";
import { DEFAULT_SAMPLE_MODEL } from "./constants/sampleModels";
import "./App.css";

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sampleModelUrl, setSampleModelUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setSampleModelUrl(null);
    setError(undefined);
  };

  const handleSampleModelSelect = () => {
    setSampleModelUrl(DEFAULT_SAMPLE_MODEL.url);
    setSelectedFile(null);
    setError(undefined);
  };

  const handleModelError = (error: Error) => {
    setError(error.message);
  };

  const isModelLoaded = selectedFile || sampleModelUrl;
  const currentModelName = selectedFile 
    ? selectedFile.name 
    : sampleModelUrl 
      ? DEFAULT_SAMPLE_MODEL.name 
      : null;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Puppet3D WebApp</h1>
          <p className="text-sm text-gray-600 mt-1">Upload and view your VRM 3D models</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!isModelLoaded ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <FileUpload
              onFileSelect={handleFileSelect}
              onSampleModelSelect={handleSampleModelSelect}
              error={error}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Current Model</h2>
                <p className="text-sm text-gray-600">{currentModelName}</p>
                {sampleModelUrl && (
                  <p className="text-xs text-blue-600 mt-1">Sample model with bone animation</p>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setSampleModelUrl(null);
                }}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Load New Model
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '600px' }}>
              <ModelViewer
                vrmFile={selectedFile}
                vrmUrl={sampleModelUrl}
                onError={handleModelError}
                enableControls={true}
                enableExpressionControls={true}
                enableBoneAnimation={sampleModelUrl ? DEFAULT_SAMPLE_MODEL.enableBoneAnimation : false}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
