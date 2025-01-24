import React, { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import SimplePeer from "simple-peer";

function Particles({ position }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshBasicMaterial color="yellow" />
    </mesh>
  );
}

function StartScreen({ onStart }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        color: "white",
      }}
    >
      <h1>Welcome to the Game</h1>
      <button
        onClick={onStart}
        style={{
          padding: "10px 20px",
          fontSize: "18px",
          cursor: "pointer",
          borderRadius: "5px",
        }}
      >
        Start Game
      </button>
    </div>
  );
}

function PauseScreen({ onResume, onQuit }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        color: "white",
      }}
    >
      <h1>Game Paused</h1>
      <button
        onClick={onResume}
        style={{
          margin: "10px",
          padding: "10px 20px",
          fontSize: "18px",
          cursor: "pointer",
          borderRadius: "5px",
        }}
      >
        Resume
      </button>
      <button
        onClick={onQuit}
        style={{
          margin: "10px",
          padding: "10px 20px",
          fontSize: "18px",
          cursor: "pointer",
          borderRadius: "5px",
        }}
      >
        Quit
      </button>
    </div>
  );
}

function EndScreen({ score, onRestart }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        color: "white",
      }}
    >
      <h1>Game Over</h1>
      <p>Your Score: {score}</p>
      <button
        onClick={onRestart}
        style={{
          padding: "10px 20px",
          fontSize: "18px",
          cursor: "pointer",
          borderRadius: "5px",
        }}
      >
        Restart Game
      </button>
    </div>
  );
}



// Video Component for Streaming
function Video({ stream }) {
  const videoRef = useRef();

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      style={{
        position: "absolute",
        bottom: 10,
        right: 10,
        width: "200px",
        height: "150px",
        borderRadius: "10px",
        border: "2px solid white",
      }}
    />
  );
}

function Multiplayer({ localStream, remoteStream }) {
  const peerRef = useRef();

  useEffect(() => {
    // Initialize Peer
    const peer = new SimplePeer({
      initiator: window.location.hash === "#host", // Host or Join based on URL
      trickle: false,
      stream: localStream,
    });

    peerRef.current = peer;

    peer.on("signal", (data) => {
      console.log("Signal Data", data); // Send to signaling server
    });

    peer.on("stream", (remoteStream) => {
      console.log("Received remote stream", remoteStream);
    });

    // Handle remote signaling (replace this with actual signaling logic)
    window.addEventListener("signal", (event) => {
      peer.signal(event.detail);
    });

    return () => {
      peer.destroy();
    };
  }, [localStream]);

  return (
    <>
      {remoteStream && <Video stream={remoteStream} />}
    </>
  );
}



function Timer({ timeLeft, onTimeUp }) {
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      onTimeUp();
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  return (
    <div
      style={{
        position: "absolute",
        top: 50,
        right: 10,
        color: "white",
        fontSize: "24px",
      }}
    >
      Time Left: {timeLeft}s
    </div>
  );
}

function Boundaries() {
  return (
    <>
      {/* Left Wall */}
      <RigidBody type="fixed" position={[-10, 1, 0]} userData={{ isBoundary: true }}>
        <mesh>
          <boxGeometry args={[1, 10, 50]} />
          <meshStandardMaterial visible={false} /> {/* Invisible material */}
        </mesh>
      </RigidBody>
      {/* Right Wall */}
      <RigidBody type="fixed" position={[10, 1, 0]} userData={{ isBoundary: true }}>
        <mesh>
          <boxGeometry args={[1, 10, 50]} />
          <meshStandardMaterial visible={false} /> {/* Invisible material */}
        </mesh>
      </RigidBody>
      {/* Top Wall */}
      <RigidBody type="fixed" position={[0, 1, -10]} userData={{ isBoundary: true }}>
        <mesh>
          <boxGeometry args={[50, 10, 1]} />
          <meshStandardMaterial visible={false} /> {/* Invisible material */}
        </mesh>
      </RigidBody>
      {/* Bottom Wall */}
      <RigidBody type="fixed" position={[0, 1, 10]} userData={{ isBoundary: true }}>
        <mesh>
          <boxGeometry args={[50, 10, 1]} />
          <meshStandardMaterial visible={false} /> {/* Invisible material */}
        </mesh>
      </RigidBody>
    </>
  );
}


function Goal({ position, setPosition, onGoal, ballRef }) {
  const goalSize = 2; // Size of the goal area
  const goalArea = {
    xMin: position.x - goalSize / 2,
    xMax: position.x + goalSize / 2,
    zMin: position.z - goalSize / 2,
    zMax: position.z + goalSize / 2,
  };

  const [hasScored, setHasScored] = useState(false); // Track if the goal was already scored

  useFrame(() => {
    if (ballRef.current) {
      const ballPos = ballRef.current.translation();

      if (
        ballPos.x > goalArea.xMin &&
        ballPos.x < goalArea.xMax &&
        ballPos.z > goalArea.zMin &&
        ballPos.z < goalArea.zMax &&
        ballPos.y < 2
      ) {
        if (!hasScored) {
          setHasScored(true);
          onGoal();
          // Move goal to a new random position on the ground
          setPosition(getRandomPositionOnGround(10));
        }
      } else {
        setHasScored(false); // Reset score state if ball leaves the goal
      }
    }
  });

  return (
    <mesh position={[position.x, position.y, position.z]}>
      <boxGeometry args={[goalSize, 0.1, goalSize]} />
      <meshStandardMaterial color="green" opacity={0.3} transparent />
    </mesh>
  );
}





function HealthBar({ health }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        width: "200px",
        height: "20px",
        backgroundColor: "#ddd",
        borderRadius: "5px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${health}%`,
          height: "100%",
          backgroundColor: health > 50 ? "green" : health > 20 ? "orange" : "red",
          transition: "width 0.2s",
        }}
      />
    </div>
  );
}

function Player({ setHealth }) {
  const playerRef = useRef();
  const speed = 18; // Movement speed
  const jumpStrength = 5; // Jump strength

  const [direction, setDirection] = useState({ x: 0, z: 0 });

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case "ArrowUp":
        case "w":
          setDirection((dir) => ({ ...dir, z: -1 }));
          break;
        case "ArrowDown":
        case "s":
          setDirection((dir) => ({ ...dir, z: 1 }));
          break;
        case "ArrowLeft":
        case "a":
          setDirection((dir) => ({ ...dir, x: -1 }));
          break;
        case "ArrowRight":
        case "d":
          setDirection((dir) => ({ ...dir, x: 1 }));
          break;
        case " ":
          if (playerRef.current) {
            const velocity = playerRef.current.linvel(); // Current velocity
            const jumpVector = {
              x: velocity.x, // Preserve horizontal momentum
              y: jumpStrength, // Apply vertical jump force
              z: velocity.z, // Preserve horizontal momentum
            };
            playerRef.current.setLinvel(jumpVector, true);
          }
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.key) {
        case "ArrowUp":
        case "w":
        case "ArrowDown":
        case "s":
          setDirection((dir) => ({ ...dir, z: 0 }));
          break;
        case "ArrowLeft":
        case "a":
        case "ArrowRight":
        case "d":
          setDirection((dir) => ({ ...dir, x: 0 }));
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (playerRef.current) {
      const velocity = { x: direction.x * speed, y: 0, z: direction.z * speed };
      playerRef.current.setLinvel(velocity, true);
    }
  }, [direction]);

  return (
    <RigidBody
      ref={playerRef}
      restitution={0.2} // Less bouncy
      friction={1}      // High friction for player control
      position={[0, 1, 0]}
      userData={{ isPlayer: true }}
    >
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="gold" />
      </mesh>
    </RigidBody>
  );
}



function NewGoalMessage({ visible, onComplete }) {
  useEffect(() => {
    if (visible) {
      const timeout = setTimeout(onComplete, 2000); // Hide message after 2 seconds
      return () => clearTimeout(timeout);
    }
  }, [visible, onComplete]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "20px",
        borderRadius: "10px",
        textAlign: "center",
        fontSize: "32px",
      }}
    >
      <h1>New Goal!</h1>
    </div>
  );
}
const Ball = React.forwardRef(({ position }, ref) => {
  return (
    <RigidBody
      ref={ref}
      restitution={1.3} // Make the ball bouncy
      friction={0.1}    // Reduce friction for smoother rolling
      position={position}
      mass={5}        // Lightweight ball
      userData={{ isBall: true }}
    >
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </RigidBody>
  );
});



function Obstacle({ position }) {
  return (
    <RigidBody
      type="fixed"
      position={position}
      userData={{ isObstacle: true }}
    >
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </RigidBody>
  );
}

function Ground() {
  return (
    <RigidBody type="fixed" position={[0, 0, 0]} userData={{ isGround: true }}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="lightgray" />
      </mesh>
    </RigidBody>
  );
}

function getRandomPositionOnGround(groundSize = 10) {
  const x = Math.random() * groundSize * 2 - groundSize; // Range: [-groundSize, groundSize]
  const z = Math.random() * groundSize * 2 - groundSize; // Range: [-groundSize, groundSize]
  return { x, y: 0.1, z }; // y = 0.1 to place on the ground
}

function getRandomPositionWithinBoundaries(boundarySize = 10) {
  const x = Math.random() * boundarySize * 2 - boundarySize; // Range: [-boundarySize, boundarySize]
  const z = Math.random() * boundarySize * 2 - boundarySize; // Range: [-boundarySize, boundarySize]
  return { x, y: 1, z }; // Ball height is fixed at y = 1
}

function App() {
  const [health, setHealth] = useState(100);
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute timer
  const [score, setScore] = useState(0);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [goalPosition, setGoalPosition] = useState(getRandomPositionOnGround(10));
  const [showNewGoalMessage, setShowNewGoalMessage] = useState(false);
  const [gameState, setGameState] = useState("start"); 
  const [isPhysicsPaused, setIsPhysicsPaused] = useState(false); // Pause physics
  const ballRef = useRef();
  const playerRef = useRef(); 

  const handleStart = () => {
    setGameState("playing");
  };

  const handlePause = () => {
    setGameState("paused");
  };

  const handleResume = () => {
    setGameState("playing");
  };

  const handleQuit = () => {
    setGameState("start");
    setScore(0); // Reset score
  };

  const handleGameOver = () => {
    setGameState("end");
  };

  const handleRestart = () => {
    setGameState("playing");
    setScore(0); // Reset score
  };

    // Set up local video stream
    useEffect(() => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          setLocalStream(stream);
        })
        .catch((error) => {
          console.error("Failed to get local stream:", error);
        });
    }, []);

  const handleGoal = () => {
    setScore((prev) => prev + 1);
    console.log("Score updated:", score + 1);

    if (score + 1 > 1) {
      setShowNewGoalMessage(true);
    }
  };

  const resetBallPosition = () => {
    if (ballRef.current) {
      const newPosition = getRandomPositionWithinBoundaries(10); // Boundary size = 10
      console.log("New Ball Position:", newPosition); // Debugging log
  
      ballRef.current.setTranslation(newPosition, true);
      ballRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true); // Stop motion
      ballRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true); // Stop rotation
    } else {
      console.error("Ball ref is not available!");
    }
  };
  

  const handleNewGoalComplete = () => {
    setShowNewGoalMessage(false);
  };


  const handleTimeUp = () => {
    if (timeLeft > 0) {
      setTimeLeft((prev) => prev - 1);
    } else {
      console.log("Time's up! Final Score:", score);
      // Add a game over screen or reset logic here
    }
  };

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
      {gameState === "start" && <StartScreen onStart={handleStart} />}
      {gameState === "paused" && (
        <PauseScreen onResume={handleResume} onQuit={handleQuit} />
      )}
      {gameState === "end" && <EndScreen score={score} onRestart={handleRestart} />}
      
        <Multiplayer localStream={localStream} remoteStream={remoteStream} />
        {localStream && <Video stream={localStream} />}
      <HealthBar health={health} />
      <Timer timeLeft={timeLeft} onTimeUp={handleTimeUp} />
      <NewGoalMessage
        visible={showNewGoalMessage}
        onComplete={handleNewGoalComplete}
      />
    {gameState === "playing" && (
    <>
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              color: "white",
              fontSize: "24px",
            }}
          >
            Score: {score}
          </div>
       
      <Canvas>
        <OrbitControls />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        <Physics gravity={[0, -9.81, 0]} paused={isPhysicsPaused}>
        <Ground />
        <Boundaries />
          <Player setHealth={() => {}} />
          <Ball ref={ballRef} position={[2, 1, 0]} />
          <Goal
            position={goalPosition}
            setPosition={setGoalPosition}
            onGoal={handleGoal}
            ballRef={ballRef}
          />
        </Physics>
      </Canvas>  <button
            onClick={handlePause}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              padding: "10px",
              fontSize: "16px",
              cursor: "pointer",
              borderRadius: "5px",
            }}
          >
            Pause
          </button>
          
      </>
    )}

    </div>
  );
}

export default App;
