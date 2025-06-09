import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Loader from '../components/Loader';

import Island from '../models/Island';
import Sky from '../models/Sky';
import Bird from '../models/Bird';
import Plane from '../models/Plane';
import Homeinfo from '../components/Homeinfo';

const Home = () => {
  const canvasRef = useRef();
  const [isRotating, setIsRotating] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [rotationY, setRotationY] = useState(4.7); // default Y rotation

  // Tangani scroll → rotasi model + efek klik
  useEffect(() => {
    let timeout;

    const handleWheel = (event) => {
      setRotationY(prev => prev + event.deltaY * 0.005); // rotasi berdasarkan scroll

      setIsRotating(true); // simulasi klik
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsRotating(false); // simulasi lepas klik setelah delay
      }, 200);
    };

    const canvas = canvasRef.current;
    if (canvas) canvas.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      if (canvas) canvas.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Responsif: sesuaikan ukuran & posisi
  const adjustIslandForScreenSize = () => {
    let screenScale = [1, 1, 1];
    let screenPosition = [0, -6.5, -43];

    if (window.innerWidth < 768) {
      screenScale = [0.9, 0.9, 0.9];
    }

    const rotation = [0.1, rotationY, 0];
    return [screenScale, screenPosition, rotation];
  };

  const adjustPlaneForScreenSize = () => {
    let screenScale, screenPosition;

    if (window.innerWidth < 768) {
      screenScale = [1.5, 1.5, 1.5];
      screenPosition = [0, -1.5, 0];
    } else {
      screenScale = [3, 3, 3];
      screenPosition = [0, -4, -4];
    }

    return [screenScale, screenPosition];
  };

  const [islandScale, islandPosition, islandRotation] = adjustIslandForScreenSize();
  const [PlaneScale, PlanePosition] = adjustPlaneForScreenSize();

  return (
    <section className='w-full h-screen relative overflow-hidden touch-none'>
      <div className='absolute top-28 left-0 right-0 z-10 flex items-center justify-center'>
        {currentStage && <Homeinfo currentStage={currentStage} />}
      </div>

      <Canvas
        ref={canvasRef}
        className={`w-full h-screen bg-transparent touch-none ${isRotating ? 'cursor-grabbing' : 'cursor-grab'}`}
        camera={{ near: 0.1, far: 1000 }}
        gl={{ powerPreference: 'high-performance' }}
      >
        <Suspense fallback={<Loader />}>
          <directionalLight position={[1, 1, 1]} intensity={2} />
          <ambientLight intensity={0.5} />
          <pointLight />
          <spotLight />
          <hemisphereLight skycolor="#b1e1ff" groundColor={"#000000"} intensity={1} />

          <Bird />
          <Sky isRotating={isRotating} />

          <Island
            position={islandPosition}
            scale={islandScale}
            rotation={islandRotation}
            isRotating={isRotating}
            setIsRotating={setIsRotating}
            setCurrentStage={setCurrentStage}
          />

          <Plane
            isRotating={isRotating}
            scale={PlaneScale}
            position={PlanePosition}
            rotation={[0, 20, 0]}
          />
        </Suspense>
      </Canvas>
    </section>
  );
};

export default Home;
