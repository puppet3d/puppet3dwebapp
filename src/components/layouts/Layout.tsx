import { GlobalErrorFallback } from "@/components/layouts/GlobalErrorFallback";
import { ErrorBoundary } from "react-error-boundary";

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * 모바일, 데스크탑 모두 화면 전체를 차지하고 canvas는 w-full, h-full로 만들어서 화면 전체를 차지하도록 함
 * 추후, setting 버튼이나 채팅 input 추가시 Layout이 relative이므로 absolute로 추가하면 됨
 */
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <ErrorBoundary
      FallbackComponent={GlobalErrorFallback}
      onError={(error, errorInfo) => {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
      }}
      onReset={() => {
        window.location.reload();
      }}
    >
      <main className="relative flex h-screen w-screen flex-col items-center justify-center">
        {children}
      </main>
    </ErrorBoundary>
  );
};
