import { AppCanvas } from "@/components/avatar/AppCanvas";
import { VRMExpressionControl } from "@/components/avatar/VRMExpressionControl";
import { VRMModelLoader } from "@/components/avatar/VRMModelLoader";
import { CanvasFallback } from "@/components/layouts/CanvasFallback";
import { Layout } from "@/components/layouts/Layout";
import { ErrorBoundary } from "react-error-boundary";

interface ExpressionInfo {
  name: string;
  type: "preset" | "custom";
}

const EXAMPLE_VRM_URL = "/VRM1_Constraint_Twist_Sample.vrm";

function App() {
  const handleExpressionsLoaded = (expressions: ExpressionInfo[]) => {
    console.log("🎭 Available expressions loaded:", expressions);
    console.log("Expression names:", expressions.map(exp => `${exp.name} (${exp.type})`));
  };

  const isTestMode = import.meta.env.MODE === 'development';

  return (
    <Layout>
      <ErrorBoundary fallback={<CanvasFallback type="error" />}>
        <AppCanvas>
          <VRMModelLoader url={EXAMPLE_VRM_URL}>
            {isTestMode && (
              <VRMExpressionControl 
                onExpressionsLoaded={handleExpressionsLoaded}
              />
            )}
          </VRMModelLoader>
        </AppCanvas>
      </ErrorBoundary>
    </Layout>
  );
}

export default App;
