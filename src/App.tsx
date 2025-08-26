import { AppCanvas } from "@/components/avatar/AppCanvas";
import { VRMExpressionControl } from "@/components/avatar/VRMExpressionControl";
import { VRMModelLoader } from "@/components/avatar/VRMModelLoader";
import { CanvasFallback } from "@/components/layouts/CanvasFallback";
import { Layout } from "@/components/layouts/Layout";
import { ErrorBoundary } from "react-error-boundary";

const EXAMPLE_VRM_URL = "/VRM1_Constraint_Twist_Sample.vrm";

function App() {
  return (
    <Layout>
      <ErrorBoundary fallback={<CanvasFallback type="error" />}>
        <AppCanvas>
          <VRMModelLoader url={EXAMPLE_VRM_URL}>
            <VRMExpressionControl />
          </VRMModelLoader>
        </AppCanvas>
      </ErrorBoundary>
    </Layout>
  );
}

export default App;
