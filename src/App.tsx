import { AppCanvas } from "@/components/avatar/AppCanvas";
import { VRMExpressionControl } from "@/components/avatar/VRMExpressionControl";
import { VRMModelLoader } from "@/components/avatar/VRMModelLoader";
import { Layout } from "@/components/layouts/Layout";

const EXAMPLE_VRM_URL = "/VRM1_Constraint_Twist_Sample.vrm";

function App() {
  return (
    <Layout>
      <AppCanvas>
        <VRMModelLoader url={EXAMPLE_VRM_URL}>
          <VRMExpressionControl />
        </VRMModelLoader>
      </AppCanvas>
    </Layout>
  );
}

export default App;
