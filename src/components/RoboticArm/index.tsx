import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

// Função para criar o segmento do braço
const ArmSegment = React.forwardRef((props, ref) => {
  return (
    <mesh ref={ref} {...props}>
      <boxGeometry args={[0.3, 5.0, 0.3]} />
      <meshStandardMaterial color={"orange"} />
    </mesh>
  );
});

// Componente da Garra
const Gripper = React.forwardRef(({ open }, ref) => {
  const leftFingerRef = useRef();
  const rightFingerRef = useRef();

  // Ajuste da posição dos "dedos" da garra com base no estado `open`
  useFrame(() => {
    if (leftFingerRef.current && rightFingerRef.current) {
      leftFingerRef.current.position.x = open ? -0.15 : -0.05;
      rightFingerRef.current.position.x = open ? 0.15 : 0.05;
    }
  });

  return (
    <group ref={ref} position={[0, 0.5, 0]}>
      {/* Parte central da garra */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.1, 0.2, 0.1]} />
        <meshStandardMaterial color={"gray"} />
      </mesh>

      {/* Dedos da garra */}
      <mesh ref={leftFingerRef} position={[-0.05, -0.15, 0]}>
        <boxGeometry args={[0.05, 0.3, 0.05]} />
        <meshStandardMaterial color={"gray"} />
      </mesh>
      <mesh ref={rightFingerRef} position={[0.05, -0.15, 0]}>
        <boxGeometry args={[0.05, 0.3, 0.05]} />
        <meshStandardMaterial color={"gray"} />
      </mesh>
    </group>
  );
});

export const RoboticArm = (
  { 
    joint1Rotation, 
    joint2Rotation, 
    joint3Rotation, 
    joint4Rotation,
    gripperOpen 
  }
) => {
  const baseRef = useRef();
  const segment1Ref = useRef();
  const segment2Ref = useRef();
  const gripperRef = useRef();

  // Atualiza a rotação da base no eixo Y e dos segmentos nos eixos desejados
  useFrame(() => {
    if (baseRef.current) {
      baseRef.current.rotation.y = joint1Rotation;
    }
    if (segment1Ref.current) {
      segment1Ref.current.rotation.x = joint2Rotation;
    }
    if (segment2Ref.current) {
      segment2Ref.current.rotation.x = joint3Rotation;
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight intensity={0.3} position={[10,10,10]}/>

      {/* Base do braço */}
      <mesh ref={baseRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.2, 32]} />
        <meshStandardMaterial color={"blue"} />

        {/* Primeiro segmento do braço */}
        <group position={[0, 0, 0]} rotation={[joint2Rotation, 0, 0]}>
          <ArmSegment position={[0, 2.5, 0]} />

          {/* Segundo segmento do braço */}
          <group position={[0, 5, 0]} rotation={[joint3Rotation, 0, 0]}>
            <ArmSegment position={[0, 2.5, 0]} />

            {/* Garra */}
            {/* 
              <group 
                position={[0, 1, -0.7]} 
                rotation={[Math.PI / 2, 0, 0]}
              >
                <Gripper 
                  ref={gripperRef} 
                  open={gripperOpen} 
                />
              </group>
            */}
          </group> 
        </group>
      </mesh>
    </>
  );
};
