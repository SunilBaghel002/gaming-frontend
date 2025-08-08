import { useEffect, useState } from "react";
import * as Ably from "ably";
import Confetti from "react-confetti";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import Lottie from "lottie-react";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import checkmarkAnimation from "../assets/checkmark.json";
import crossAnimation from "../assets/cross.json";

function ViewMode() {
  const [bgState, setBgState] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const [showTextOverlay, setShowTextOverlay] = useState("");
  const [showResultMessage, setShowResultMessage] = useState("");
  const [totalResponses, setTotalResponses] = useState(0);
  const [showNavbar, setShowNavbar] = useState(false);
  const [particleBurst, setParticleBurst] = useState(false);

  const particlesInit = async (main) => {
    await loadSlim(main);
  };

  // Preload audio files
  const [yesAudio] = useState(new Audio("/sounds/correct.mp3"));
  const [noAudio] = useState(new Audio("/sounds/wrong.mp3"));

  // Unlock audio on first interaction
  useEffect(() => {
    const unlockAudio = () => {
      if (!isAudioUnlocked) {
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        const testAudio = new Audio("/sounds/correct.mp3");
        testAudio
          .play()
          .then(() => {
            setIsAudioUnlocked(true);
            audioContext
              .resume()
              .then(() => console.log("Audio context resumed"));
          })
          .catch((err) => console.error("Failed to unlock audio:", err));
        window.removeEventListener("click", unlockAudio);
        window.removeEventListener("mousemove", unlockAudio);
        window.removeEventListener("keypress", unlockAudio);
      }
    };

    window.addEventListener("click", unlockAudio);
    window.addEventListener("mousemove", unlockAudio);
    window.addEventListener("keypress", unlockAudio);

    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("mousemove", unlockAudio);
      window.removeEventListener("keypress", unlockAudio);
    };
  }, [isAudioUnlocked]);

  // Navbar visibility and result message reset on interaction
  useEffect(() => {
    let timeout;
    const showNav = () => {
      setShowNavbar(true);
      setShowResultMessage(""); // Clear result message on interaction
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowNavbar(false), 3000);
    };

    window.addEventListener("mousemove", showNav);
    window.addEventListener("click", showNav);
    window.addEventListener("keypress", showNav);

    return () => {
      window.removeEventListener("mousemove", showNav);
      window.removeEventListener("click", showNav);
      window.removeEventListener("keypress", showNav);
      clearTimeout(timeout);
    };
  }, []);

  const testAudio = () => {
    if (!isMuted && isAudioUnlocked) {
      yesAudio.play().catch((err) => console.error("Test audio failed:", err));
    }
  };

  // Ably subscription
  useEffect(() => {
    const ably = new Ably.Realtime({
      key: import.meta.env.VITE_ABLY_API_KEY,
      clientId: `client-${Math.random().toString(36).substring(2, 9)}`,
    });

    ably.connection.on("failed", (err) =>
      console.error("Ably connection failed:", err)
    );
    ably.connection.on("connected", () => console.log("Ably connected"));

    const channel = ably.channels.get("responses");

    channel.subscribe("response", (msg) => {
      const { response } = msg.data;
      setTotalResponses((prev) => prev + 1);
      setBgState(response);
      setShowTextOverlay(response);
      setShowResultMessage(""); // Clear previous result message
      if (response === "yes") {
        setShowConfetti(true);
        setParticleBurst(true);
        setTimeout(() => {
          setShowConfetti(false);
          setParticleBurst(false);
        }, 3000);
      }

      if (!isMuted && isAudioUnlocked) {
        const audio = response === "yes" ? yesAudio : noAudio;
        audio
          .play()
          .catch((err) =>
            console.error(`Audio playback failed for ${response}:`, err)
          );
      }

      // Show text overlay for 3s, then show result message
      setTimeout(() => {
        setShowTextOverlay("");
        setShowResultMessage(
          response === "yes" ? "You are correct!" : "You are wrong!"
        );
        setBgState(""); // Reset background after text overlay
      }, 3000);
    });

    return () => {
      channel.unsubscribe();
      if (ably.connection.state === "connected") {
        ably.close();
      }
    };
  }, [isMuted, isAudioUnlocked, yesAudio, noAudio]);

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-500 ${
        bgState === "yes"
          ? "bg-green-500"
          : bgState === "no"
          ? "bg-red-500 animate-shake"
          : "bg-gray-900"
      }`}
    >
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={400}
          gravity={0.3}
          colors={["#34D399", "#10B981", "#FFFFFF", "#8B5CF6"]}
        />
      )}
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 bg-black/70 backdrop-blur-lg z-30 py-4 px-6 flex justify-center space-x-4 transition-all duration-300 ${
          showNavbar ? "animate-nav-show" : "animate-nav-hide"
        }`}
      >
        <a
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 font-poppins flex items-center"
          aria-label="Go to Response Mode"
        >
          Respond
        </a>
        <a
          href="/stats"
          className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-all duration-300 font-poppins flex items-center"
          aria-label="View Stats"
        >
          View Stats
        </a>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition-all duration-300 font-poppins flex items-center"
          aria-label={isMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {isMuted ? (
            <FaVolumeMute className="mr-2" />
          ) : (
            <FaVolumeUp className="mr-2" />
          )}
          {isMuted ? "Unmute" : "Mute"}
        </button>
        <button
          onClick={testAudio}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition-all duration-300 font-poppins flex items-center"
          aria-label="Test Audio"
        >
          Test Audio
        </button>
      </nav>
      {/* Main Content */}
      {totalResponses === 0 ? (
        <div className="text-center z-20">
          <h1 className="text-8xl font-extrabold text-white mb-6 drop-shadow-2xl font-poppins animate-bounce glow-text">
            Let's play games!
          </h1>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          {showTextOverlay && (
            <>
              <Lottie
                animationData={
                  showTextOverlay === "yes"
                    ? checkmarkAnimation
                    : crossAnimation
                }
                loop={false}
                className="w-50 h-50 mb-4 animate-icon"
              />
              <span
                className={`text-[20vw] font-extrabold font-poppins ${
                  showTextOverlay === "yes"
                    ? "text-white glow-green animate-text-zoom"
                    : "text-white glow-red animate-pulse"
                }`}
              >
                {showTextOverlay.charAt(0).toUpperCase() +
                  showTextOverlay.slice(1)}
              </span>
            </>
          )}
          {showResultMessage && (
            <span
              className={`text-6xl font-bold font-poppins animate-result ${
                showResultMessage === "You are correct!"
                  ? "text-green-200 glow-green"
                  : "text-red-200 glow-red"
              }`}
            >
              {showResultMessage}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default ViewMode;
