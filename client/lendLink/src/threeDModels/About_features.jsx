import React, { useRef, useEffect } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';

const AboutFeatureModel = (props) => {
  const group = useRef();
  const { nodes, materials, animations } = useGLTF('/Model3D/gato_mau_un_gato_con_mala_suerte.glb');
  const { actions, names } = useAnimations(animations, group); 
  useEffect(() => {
    
    if (names.length > 0 && actions[names[0]]) {
      actions[names[0]].reset().fadeIn(0.5).play();
    }
    return () => {
      actions[names[0]]?.fadeOut(0.5).stop();
    };
  }, [actions, names]);

  return (
    <group ref={group} {...props} dispose={null} position={[0, -0.5, 0]}>
      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group name="root">
            <group name="GLTF_SceneRootNode" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Sphere_0" position={[0, 0, 0]} rotation={[0, 5, 2.569]}>
                <mesh
                  name="Object_4"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_4.geometry}
                  material={materials.Material}
                />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

useGLTF.preload('/Model3D/gato_mau_un_gato_con_mala_suerte.glb');

export default AboutFeatureModel;
