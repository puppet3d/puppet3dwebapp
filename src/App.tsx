import { AppCanvas } from "@/components/avatar/AppCanvas";
import { VRMModelLoader } from "@/components/avatar/VRMModelLoader";
import { Layout } from "@/components/layouts/Layout";

function App() {
  return (
    <Layout>
      <AppCanvas>
        <VRMModelLoader url="/VRM1_Constraint_Twist_Sample.vrm" />
      </AppCanvas>
    </Layout>
  );
}

export default App;
