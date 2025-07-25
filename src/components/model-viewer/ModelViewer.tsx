import { DEFAULT_SAMPLE_MODEL } from "@/constants/sampleModels";
import { useState } from "react";
import { FileUpload } from "./FileUpload";
import { ModelRenderer } from "./ModelRenderer";

type UserModelInput = UserUrlInput | UserFileInput;

interface UserUrlInput {
  url: string;
  file?: never;
}

interface UserFileInput {
  file: File;
  url?: never;
}

export const ModelViewer: React.FC = () => {
  const [userModelInput, setUserModelInput] = useState<UserModelInput>();
  const [error, setError] = useState<Error>();

  const handleFileSelect = (file: File) => {
    setUserModelInput({ file });
    setError(undefined);
  };

  const handleSampleModelSelect = () => {
    setUserModelInput({ url: DEFAULT_SAMPLE_MODEL.url });
    setError(undefined);
  };

  const handleModelError = (error: Error) => {
    setError(error);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {!userModelInput ? (
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <FileUpload
            onFileSelect={handleFileSelect}
            onSampleModelSelect={handleSampleModelSelect}
            error={error}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Current Model
              </h2>
              <p className="text-sm text-gray-600">
                {userModelInput.file?.name}
              </p>
              {userModelInput?.url === DEFAULT_SAMPLE_MODEL.url && (
                <p className="mt-1 text-xs text-blue-600">
                  Sample model with bone animation
                </p>
              )}
            </div>
            <button
              onClick={() => {
                setUserModelInput(undefined);
              }}
              className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-300"
            >
              Load New Model
            </button>
          </div>

          <div className="min-h-[600px] overflow-hidden rounded-lg bg-white shadow">
            <ModelRenderer
              vrmFile={userModelInput?.file}
              vrmUrl={userModelInput?.url}
              onError={handleModelError}
              enableControls={true}
              enableExpressionControls={true}
              enableBoneAnimation={
                userModelInput?.url === DEFAULT_SAMPLE_MODEL.url
                  ? DEFAULT_SAMPLE_MODEL.enableBoneAnimation
                  : false
              }
            />
          </div>
        </div>
      )}
    </main>
  );
};
