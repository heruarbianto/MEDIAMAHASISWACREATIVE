import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
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

  const isDragging = useRef(false);
  const lastMouseX = useRef(0);

  // Scroll untuk rotasi
  useEffect(() => {
    let timeout;
    const handleWheel = (event) => {
      setRotationY(prev => prev - event.deltaY * 0.0005);
      setIsRotating(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsRotating(false), 200);
    };

    const canvas = canvasRef.current;
    if (canvas) canvas.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      if (canvas) canvas.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Mouse drag untuk rotasi
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMouseDown = (e) => {
      isDragging.current = true;
      lastMouseX.current = e.clientX;
      setIsRotating(true);
    };
    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - lastMouseX.current;
      lastMouseX.current = e.clientX;
      setRotationY(prev => prev + deltaX * 0.0005);
    };
    const onMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        setIsRotating(false);
      }
    };
    const onMouseLeave = () => {
      if (isDragging.current) {
        isDragging.current = false;
        setIsRotating(false);
      }
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseLeave);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  // Deteksi perubahan stage berdasarkan rotasi
  useEffect(() => {
    const normalizedY = ((rotationY % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    let newStage;
    if (normalizedY >= 0 && normalizedY < Math.PI / 2) {
      newStage = 1;
    } else if (normalizedY >= Math.PI / 2 && normalizedY < Math.PI) {
      newStage = 2;
    } else if (normalizedY >= Math.PI && normalizedY < (3 * Math.PI) / 2) {
      newStage = 3;
    } else {
      newStage = 4;
    }

    if (newStage !== currentStage) {
      setCurrentStage(newStage);
    }
  }, [rotationY, currentStage]);

  // Penyesuaian ukuran
  const adjustIslandForScreenSize = () => {
    let screenScale = [1, 1, 1];
    let screenPosition = [0, -6.5, -43];
    if (window.innerWidth < 768) {
      screenScale = [0.9, 0.9, 0.9];
    }
    return [screenScale, screenPosition];
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

  const [islandScale, islandPosition] = adjustIslandForScreenSize();
  const [PlaneScale, PlanePosition] = adjustPlaneForScreenSize();

  // Komponen auto rotate Island
  const AutoRotateIsland = (props) => {
    const ref = useRef();

    useFrame((state, delta) => {
      if (!isRotating && !isDragging.current) {
        setRotationY(prev => prev - delta * 0.3); // kecepatan rotasi
      }
    });

    const rotation = [0.1, rotationY, 0];

    return <Island ref={ref} {...props} rotation={rotation} />;
  };

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

          <AutoRotateIsland
            position={islandPosition}
            scale={islandScale}
            isRotating={isRotating}
            setIsRotating={setIsRotating}
            setCurrentStage={setCurrentStage}
          />

          <Plane
            isRotating={true}
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
