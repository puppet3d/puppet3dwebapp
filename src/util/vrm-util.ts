import * as THREE from "three";
import {
  VRM,
  VRMSpringBoneColliderShapeCapsule,
  VRMSpringBoneColliderShapeSphere,
} from "@pixiv/three-vrm";

export const disposeVRM = (vrm: VRM) => {
  // Remove from scene
  if (vrm.scene.parent) {
    vrm.scene.parent.remove(vrm.scene);
  }

  // Reset SpringBoneManager if exists
  if (vrm.springBoneManager) {
    vrm.springBoneManager.reset();
  }

  // Dispose all geometries, materials, and textures
  vrm.scene.traverse((object) => {
    if ((object as THREE.Mesh).isMesh) {
      const mesh = object as THREE.Mesh;

      // Dispose geometry
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }

      // Dispose materials and their textures
      if (mesh.material) {
        const materials = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];

        materials.forEach((material) => {
          // Dispose all textures in the material
          Object.keys(material).forEach((property) => {
            const value = material[property as keyof typeof material];
            if (value && typeof value === "object" && "isTexture" in value) {
              (value as THREE.Texture).dispose();
            }
          });
          material.dispose();
        });
      }
    }
  });

  // Dispose VRM-specific textures from materials array
  if (vrm.materials) {
    vrm.materials.forEach((material) => {
      Object.keys(material).forEach((property) => {
        const value = material[property as keyof typeof material];
        if (value && typeof value === "object" && "isTexture" in value) {
          (value as THREE.Texture).dispose();
        }
      });
    });
  }
};

export const normalizeVRMModel = (vrm: VRM) => {
  // Calculate bounding box to get actual size
  const box = new THREE.Box3().setFromObject(vrm.scene);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  // Target height: 1.6m (standard human height in meters)
  const targetHeight = 1.6;
  const scale = targetHeight / size.y;

  // Apply scale to the scene first
  vrm.scene.scale.multiplyScalar(scale);

  // Scale spring bone parameters proportionally
  if (vrm.springBoneManager) {
    // Scale spring bone joints
    const joints = vrm.springBoneManager.joints;
    for (const joint of joints) {
      joint.settings.stiffness *= scale;
      joint.settings.hitRadius *= scale;
    }

    // Scale colliders
    const colliders = vrm.springBoneManager.colliders;
    for (const collider of colliders) {
      const shape = collider.shape;
      if (shape instanceof VRMSpringBoneColliderShapeCapsule) {
        shape.radius *= scale;
        shape.tail.multiplyScalar(scale);
      } else if (shape instanceof VRMSpringBoneColliderShapeSphere) {
        shape.radius *= scale;
      }
    }
  }

  // Position model so feet (bottom of bounding box) are at Y=0
  vrm.scene.position.y = -box.min.y * scale;
  // Center X and Z
  vrm.scene.position.x = -center.x * scale;
  vrm.scene.position.z = -center.z * scale;
};
