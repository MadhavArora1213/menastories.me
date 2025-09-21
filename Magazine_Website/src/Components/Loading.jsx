import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Loading = ({ isLoading, setIsLoading }) => {
  const [progress, setProgress] = useState(0);
  const [loadingPhase, setLoadingPhase] = useState('initial');
  const svgRef = useRef(null);
  
  // Controls the loading progress simulation
  useEffect(() => {
    if (!isLoading) return;
    
    // Start with a subtle delay
    setTimeout(() => {
      setLoadingPhase('loading');
      
      // Simulate loading progress with variable speeds - smoother filling
      const interval = setInterval(() => {
        setProgress(prev => {
          // More gradual progress changes for smoother water fill
          let increment = 0;
          if (prev < 30) increment = Math.random() * 2 + 0.5;
          else if (prev < 60) increment = Math.random() * 1.5 + 0.3;
          else if (prev < 90) increment = Math.random() * 0.8 + 0.2;
          else increment = Math.random() * 0.3 + 0.1;
          
          const next = prev + increment;
          
          if (next >= 100) {
            clearInterval(interval);
            setLoadingPhase('complete');
            setTimeout(() => {
              setLoadingPhase('exit');
              
              
              // Complete the loading process after transition
              setTimeout(() => {
                setIsLoading(false);
              }, 2200);
            }, 800);
            return 100;
          }
          return next;
        });
      }, 80);
      
      return () => clearInterval(interval);
    }, 800);
  }, [isLoading, setIsLoading]);
  
  // Animation variants
  const containerVariants = {
    initial: { opacity: 1 },
    exit: { 
      opacity: 0,
      transition: { 
        duration: 0.5, 
        delay: 1.6,
        ease: [0.76, 0, 0.24, 1]
      }
    }
  };
  
  // Reveal animation for text
  const revealVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 1,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div 
            variants={containerVariants}
            initial="initial"
            exit="exit"
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
            style={{ 
              backgroundColor: '#000000',
            }}
          >
            {/* Main content */}
            <div className="flex flex-col items-center justify-center w-full h-full">
              {/* SVG Logo text with fill effect */}
              <div className="relative z-10 mb-4 w-full max-w-[90%] h-[200px] md:h-[300px]">
                <svg 
                  ref={svgRef}
                  width="100%" 
                  height="100%" 
                  viewBox="0 0 1000 200" 
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Definitions for the wave pattern */}
                  <defs>
                    {/* Enhanced water gradient with blue tint for realism */}
                    <linearGradient id="fillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#d4f1ff" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
                    </linearGradient>
                    
                    {/* Highly dynamic wave patterns */}
                    <pattern id="wavePattern1" x="0" y="0" width="200" height="20" patternUnits="userSpaceOnUse">
                      <motion.path
                        d="M0,10 C20,18, 40,2, 60,10 C80,18, 100,2, 120,10 C140,18, 160,2, 180,10 C200,18, 220,2, 240,10"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        animate={{
                          d: [
                            "M0,10 C20,18, 40,2, 60,10 C80,18, 100,2, 120,10 C140,18, 160,2, 180,10 C200,18, 220,2, 240,10",
                            "M0,10 C20,2, 40,18, 60,10 C80,2, 100,18, 120,10 C140,2, 160,18, 180,10 C200,2, 220,18, 240,10",
                          ]
                        }}
                        transition={{
                          repeat: Infinity,
                          repeatType: "reverse",
                          duration: 2.5,
                          ease: "easeInOut"
                        }}
                        initial={{
                          d: "M0,10 C20,18, 40,2, 60,10 C80,18, 100,2, 120,10 C140,18, 160,2, 180,10 C200,18, 220,2, 240,10"
                        }}
                      />
                    </pattern>
                    
                    <pattern id="wavePattern2" x="0" y="0" width="300" height="20" patternUnits="userSpaceOnUse">
                      <motion.path
                        d="M0,10 C25,16, 50,4, 75,10 C100,16, 125,4, 150,10 C175,16, 200,4, 225,10 C250,16, 275,4, 300,10"
                        fill="none"
                        stroke="white"
                        strokeWidth="1.8"
                        animate={{
                          d: [
                            "M0,10 C25,16, 50,4, 75,10 C100,16, 125,4, 150,10 C175,16, 200,4, 225,10 C250,16, 275,4, 300,10",
                            "M0,10 C25,4, 50,16, 75,10 C100,4, 125,16, 150,10 C175,4, 200,16, 225,10 C250,4, 275,16, 300,10",
                          ]
                        }}
                        transition={{
                          repeat: Infinity,
                          repeatType: "reverse",
                          duration: 3.5,
                          ease: "easeInOut"
                        }}
                        initial={{
                          d: "M0,10 C25,16, 50,4, 75,10 C100,16, 125,4, 150,10 C175,16, 200,4, 225,10 C250,16, 275,4, 300,10"
                        }}
                      />
                    </pattern>
                    
                    <pattern id="wavePattern3" x="0" y="0" width="400" height="20" patternUnits="userSpaceOnUse">
                      <motion.path
                        d="M0,10 C33,15, 67,5, 100,10 C133,15, 167,5, 200,10 C233,15, 267,5, 300,10 C333,15, 367,5, 400,10"
                        fill="none"
                        stroke="white"
                        strokeWidth="1.5"
                        animate={{
                          d: [
                            "M0,10 C33,15, 67,5, 100,10 C133,15, 167,5, 200,10 C233,15, 267,5, 300,10 C333,15, 367,5, 400,10",
                            "M0,10 C33,5, 67,15, 100,10 C133,5, 167,15, 200,10 C233,5, 267,15, 300,10 C333,5, 367,15, 400,10",
                          ]
                        }}
                        transition={{
                          repeat: Infinity,
                          repeatType: "reverse",
                          duration: 4.5,
                          ease: "easeInOut"
                        }}
                        initial={{
                          d: "M0,10 C33,15, 67,5, 100,10 C133,15, 167,5, 200,10 C233,15, 267,5, 300,10 C333,15, 367,5, 400,10"
                        }}
                      />
                    </pattern>
                    
                    {/* Enhanced wave effect with filled paths */}
                    <pattern id="filledWave1" x="0" y="0" width="400" height="20" patternUnits="userSpaceOnUse">
                      <motion.path
                        d="M0,20 C50,8, 100,12, 150,4 C200,12, 250,8, 300,12 C350,8, 400,12, 400,20 L400,20 L0,20 Z"
                        fill="white"
                        opacity="0.3"
                        animate={{
                          d: [
                            "M0,20 C50,8, 100,12, 150,4 C200,12, 250,8, 300,12 C350,8, 400,12, 400,20 L400,20 L0,20 Z",
                            "M0,20 C50,12, 100,8, 150,12 C200,4, 250,12, 300,8 C350,12, 400,8, 400,20 L400,20 L0,20 Z"
                          ]
                        }}
                        transition={{
                          repeat: Infinity,
                          repeatType: "reverse",
                          duration: 3,
                          ease: "easeInOut"
                        }}
                        initial={{
                          d: "M0,20 C50,8, 100,12, 150,4 C200,12, 250,8, 300,12 C350,8, 400,12, 400,20 L400,20 L0,20 Z"
                        }}
                      />
                    </pattern>
                    
                    {/* Enhanced water ripple effect */}
                    <filter id="water-ripple" x="-20%" y="-20%" width="140%" height="140%">
                      <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" seed={Date.now()} />
                      <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" />
                    </filter>
                    
                    {/* Improved water surface effect */}
                    <filter id="water-surface" x="0%" y="0%" width="100%" height="100%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
                      <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="glow" />
                      <feBlend in="SourceGraphic" in2="glow" mode="normal" />
                    </filter>
                    
                    {/* Clip path for the fill animation */}
                    <clipPath id="text-clip">
                      <text
                        x="50%"
                        y="70%"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        fontSize="140"
                        fontFamily="Inter, sans-serif"
                        fontWeight="800"
                        letterSpacing="-0.02em"
                      >
                        MENASTORIES
                      </text>
                    </clipPath>
                    
                    {/* Enhanced glow effect */}
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  
                  {/* Outline text (always visible) */}
                  <text
                    x="50%"
                    y="70%"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    fontSize="140"
                    fontFamily="Inter, sans-serif"
                    fontWeight="800"
                    letterSpacing="-0.02em"
                    fill="#333333"
                  >
                    NEONPULSE
                  </text>
                  
                  {/* Fill container with clip path */}
                  <g clipPath="url(#text-clip)">
                    {/* Realistic water fill background with enhanced ripple */}
                    <rect
                      x="0"
                      y={200 - (progress * 2)}
                      width="1000"
                      height={progress * 2}
                      fill="url(#fillGradient)"
                      filter="url(#water-ripple)"
                    />
                    
                    {/* New filled wave layer */}
                    <rect
                      x="0"
                      y={200 - (progress * 2) - 18}
                      width="1000"
                      height="18"
                      fill="url(#filledWave1)"
                      filter="url(#water-surface)"
                    >
                      <animate
                        attributeName="x"
                        from="-100"
                        to="0"
                        dur="4s"
                        repeatCount="indefinite"
                      />
                    </rect>
                    
                    {/* Enhanced wave layers with better positioning */}
                    <rect
                      x="0"
                      y={200 - (progress * 2) - 14}
                      width="1000"
                      height="12"
                      fill="url(#wavePattern1)"
                      opacity="0.9"
                      filter="url(#water-surface)"
                    >
                      <animate
                        attributeName="x"
                        from="-200"
                        to="0"
                        dur="2.7s"
                        repeatCount="indefinite"
                      />
                    </rect>
                    
                    <rect
                      x="0"
                      y={200 - (progress * 2) - 11}
                      width="1000"
                      height="9"
                      fill="url(#wavePattern2)"
                      opacity="0.7"
                    >
                      <animate
                        attributeName="x"
                        from="0"
                        to="-300"
                        dur="3.8s"
                        repeatCount="indefinite"
                      />
                    </rect>
                    
                    <rect
                      x="0"
                      y={200 - (progress * 2) - 8}
                      width="1000"
                      height="6"
                      fill="url(#wavePattern3)"
                      opacity="0.6"
                    >
                      <animate
                        attributeName="x"
                        from="-400"
                        to="0"
                        dur="4.9s"
                        repeatCount="indefinite"
                      />
                    </rect>
                    
                    {/* Enhanced bubbles effect - more of them and more dynamic */}
                    {[...Array(20)].map((_, i) => (
                      <motion.circle
                        key={i}
                        cx={50 + (i * 50)}
                        initial={{ 
                          cy: Math.min(180, 200 - (progress * 1.5)), 
                          opacity: 0,
                          r: Math.random() * 2.5 + 0.8
                        }}
                        animate={{ 
                          cy: [Math.min(180, 200 - (progress * 1.5)), 20],
                          opacity: [0, 0.8, 0],
                          x: [Math.random() * 15 - 7.5, Math.random() * 15 - 7.5],
                        }}
                        transition={{ 
                          duration: Math.random() * 4 + 4,
                          repeat: Infinity,
                          repeatDelay: Math.random() * 3,
                          ease: "easeInOut",
                          times: [0, 0.8, 1]
                        }}
                        fill="white"
                      />
                    ))}
                    
                    {/* Improved "splash" effect when reaching 100% */}
                    {progress >= 98 && (
                      <>
                        {[...Array(12)].map((_, i) => (
                          <motion.circle
                            key={`splash-${i}`}
                            cx={70 + (i * 85)}
                            cy={40}
                            r={Math.random() * 2 + 2}
                            fill="white"
                            initial={{ y: 0, opacity: 0 }}
                            animate={{ 
                              y: [-5, -20], 
                              opacity: [0, 0.8, 0],
                              scale: [1, 1.5, 0.8],
                            }}
                            transition={{ 
                              duration: Math.random() * 0.5 + 0.8, 
                              delay: i * 0.08,
                              times: [0, 0.6, 1]
                            }}
                          />
                        ))}
                      </>
                    )}
                  </g>
                  
                  {/* Final glow effect when complete */}
                  {progress >= 98 && (
                    <motion.text
                      x="50%"
                      y="70%"
                      dominantBaseline="middle"
                      textAnchor="middle"
                      fontSize="140"
                      fontFamily="Inter, sans-serif"
                      fontWeight="800"
                      letterSpacing="-0.02em"
                      fill="white"
                      filter="url(#glow)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      transition={{ duration: 0.8 }}
                    >
                      NEONPULSE
                    </motion.text>
                  )}
                </svg>
              </div>
              
              {/* Loading text and percentage */}
              <motion.div
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                className="absolute bottom-8 right-8 flex items-center text-white text-sm font-light z-10"
                style={{
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <span className="opacity-70">loading...</span>
                <span className="ml-2 font-medium">{Math.round(progress)} %</span>
              </motion.div>
            </div>
            
            {/* Center-breaking page transition */}
            {loadingPhase === 'exit' && (
              <>
                {/* Top half that slides up */}
                <motion.div 
                  className="fixed top-0 left-0 right-0 h-1/2 bg-white z-50"
                  initial={{ y: 0 }}
                  animate={{ y: "-100%" }}
                  transition={{ 
                    duration: 1.2,
                    ease: [0.76, 0, 0.24, 1],
                  }}
                />
                
                {/* Bottom half that slides down */}
                <motion.div 
                  className="fixed bottom-0 left-0 right-0 h-1/2 bg-white z-50"
                  initial={{ y: 0 }}
                  animate={{ y: "100%" }}
                  transition={{ 
                    duration: 1.2,
                    ease: [0.76, 0, 0.24, 1],
                  }}
                />
                
                {/* Background content reveal */}
                <motion.div
                  className="fixed inset-0 bg-black z-[40]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ 
                    duration: 0.5,
                    delay: 0.3
                  }}
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
};

export default Loading;