import React, { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as CANNON from "cannon-es";
import { RoboticArm } from "./components/RoboticArm";

const FallingSphere: React.FC = () => {
  const sphereRef = useRef<THREE.Mesh>(null);
  const sphereBodyRef = useRef<CANNON.Body>(new CANNON.Body({ 
    mass: 1, shape: new CANNON.Sphere(0.1) 
  }));
  const worldRef = useRef<CANNON.World>(new CANNON.World());

  useEffect(() => {
    const world = worldRef.current;
    // Definindo a gravidade
    world.gravity.set(0, -9.82, 0); 

    // Definindo o plano do chão
    const groundBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(groundBody);

    // Adicionando o corpo da esfera
    const sphereBody = sphereBodyRef.current;
    sphereBody.position.set(1, 5, 0);
    world.addBody(sphereBody);
  }, []);

  useFrame(() => {
    const world = worldRef.current;
    // Atualizando a simulação
    world.step(1 / 60); 

    // Atualizando a posição da esfera com base na simulação física
    if (sphereRef.current) {
      sphereRef.current.position.copy(
        sphereBodyRef.current.position as unknown as THREE.Vector3
      );
    }
  });

  return (
    <mesh ref={sphereRef}>
      <sphereGeometry args={[0.1, 32, 32]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
};

interface BallPositionProps {
  x: number,
  y: number,
  z: number
}

const App: React.FC = () => {
  const [joint1Rotation, setJoint1Rotation] = useState(0);
  const [joint2Rotation, setJoint2Rotation] = useState(0);
  const [joint3Rotation, setJoint3Rotation] = useState(0);
  const [gripperOpen, setGripperOpen] = useState(false);

  const makeMovement = (ballPosition: BallPositionProps) => {
    // Parâmetros do braço robótico (comprimentos dos elos)

    // comprimento do primeiro elo em cm
    const L1 = 1;
    // comprimento do segundo elo em cm 
    const L2 = 1;
  
    // Coordenadas da bolinha
    const x = ballPosition.x;
    const y = ballPosition.y;
    const z = ballPosition.z;
  
    // Calcular a rotação da base para alinhar o braço 
    // com a posição da bolinha (ângulo em torno do eixo Z)
    // em radianos
    const joint1Rotation = Math.atan2(y, x); 
  
    // Ajuste das coordenadas para cálculo 2D 
    // (considerando projeção no plano XZ após rotação)

    // Distância projetada no plano XZ
    const distanceXZ = Math.sqrt(x ** 2 + y ** 2);
    // Projeção em X após rotação
    const newX = distanceXZ; 
    const newZ = z;
  
    // Cálculo do valor de D para verificar se a posição é alcançável
    const D = (newX ** 2 + newZ ** 2 - L1 ** 2 - L2 ** 2) / (2 * L1 * L2);
  
    // Verificação para garantir que a posição é alcançável
    if (D < -1 || D > 1) {
      console.error("Posição fora do alcance do braço robótico");
      return {
        joint1Rotation: 0,
        joint2Rotation: 0,
        joint3Rotation: 0
      };
    }
  
    // Cálculo dos ângulos das juntas usando cinemática inversa
    // θ3 em radianos
    const joint3Rotation = Math.acos(D);
    const joint2Rotation = 
      Math.atan2(newZ, newX) -
      Math.acos(
        (newX ** 2 + newZ ** 2 + L1 ** 2 - L2 ** 2) / 
        (2 * L1 * Math.sqrt(newX ** 2 + newZ ** 2))
      );
  
    // Retorno dos valores calculados
    return {
      joint1Rotation,
      joint2Rotation,
      // Ajuste do sinal, se necessário
      joint3Rotation: -joint3Rotation 
    };
  };

  const doo = () => {
    // Exemplo de posição da bolinha
    const ballPosition = { x: 1, y: 0, z: 0 };
    const { joint1Rotation, joint2Rotation, joint3Rotation } = makeMovement(ballPosition);
    
    // Atualizando os estados das juntas
    setJoint1Rotation(joint1Rotation);
    setJoint2Rotation(joint2Rotation);
    setJoint3Rotation(joint3Rotation);
  }
  
  useEffect(() => {
    setTimeout(() => {
      doo();
    }, 5000)
  }, []);

  return (
    <>
      <Canvas style={{ height: "100vh", width: "100vw" }}>
        <perspectiveCamera position={[2, 2, 5]} fov={25} />
        <OrbitControls />

        {/* Esfera com física */}
        <FallingSphere />

        {/* Chão */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="gray" />
        </mesh>

        {/* Braço Robótico */}
        <RoboticArm
          joint1Rotation={joint1Rotation}
          joint2Rotation={joint2Rotation}
          joint3Rotation={joint3Rotation}
          gripperOpen={gripperOpen}
        />
      </Canvas>

      <div style={{ position: "absolute", top: 10, left: 10 }}>
        <label>Base (Rotação Y):</label>
        <input
          type="range"
          min={-Math.PI}
          max={+Math.PI}
          step="0.001"
          value={joint1Rotation}
          onChange={(e) => setJoint1Rotation(Number(e.target.value))}
        />
        <br />
        <label>Primeiro Elo (Rotação X):</label>
        <input
          type="range"
          min={-Math.PI / 2}
          max={+Math.PI / 2}
          step="0.001"
          value={joint2Rotation}
          onChange={(e) => setJoint2Rotation(Number(e.target.value))}
        />
        <br />
        <label>Segundo Elo (Rotação X):</label>
        <input
          type="range"
          min={-Math.PI / 2}
          max={+Math.PI / 2}
          step="0.001"
          value={joint3Rotation}
          onChange={(e) => setJoint3Rotation(Number(e.target.value))}
        />
        <br />
        <button onClick={() => setGripperOpen(!gripperOpen)}>
          {gripperOpen ? "Fechar Garra" : "Abrir Garra"}
        </button>
      </div>
    </>
  );
};

export default App;
