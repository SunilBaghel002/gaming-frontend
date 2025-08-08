import { useState, useEffect } from "react";
import axios from "axios";
import Confetti from "react-confetti";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import Lottie from "lottie-react";
import { FaChartBar, FaGamepad } from "react-icons/fa";
import checkmarkAnimation from "../assets/checkmark.json";
import crossAnimation from "../assets/cross.json";

function ResponseMode() {
  const [message, setMessage] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [showNavbar, setShowNavbar] = useState(false);
  const [particleBurst, setParticleBurst] = useState(false);
  const [responseType, setResponseType] = useState("");

  const particlesInit = async (main) => {
    await loadSlim(main);
  };

  const sendResponse = async (response) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/response`, {
        response,
      });
      setMessage(`You voted: ${response}`);
      setResponseType(response);
      if (response === "yes") {
        setShowConfetti(true);
        setParticleBurst(true);
        setTimeout(() => {
          setShowConfetti(false);
          setParticleBurst(false);
        }, 5000);
      }
    } catch (error) {
      setMessage("Error sending response");
      setResponseType("error");
    }
  };

  // Navbar visibility and message reset on interaction
  useEffect(() => {
    let timeout;
    const showNav = () => {
      setShowNavbar(true);
      setMessage(""); // Clear message on interaction
      setResponseType("");
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

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.2}
          colors={["#34D399", "#10B981", "#FFFFFF", "#8B5CF6"]}
        />
      )}
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 bg-black/70 backdrop-blur-lg z-30 py-2 px-4 sm:py-4 sm:px-6 flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 transition-all duration-300 ${
          showNavbar ? "animate-nav-show" : "animate-nav-hide"
        }`}
      >
        <a
          href="/view"
          className="px-4 py-2 sm:px-8 sm:py-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 font-poppins text-base sm:text-lg flex items-center"
          aria-label="Go to View Mode"
        >
          <FaGamepad className="mr-2" />
          View Game
        </a>
        <a
          href="/stats"
          className="px-4 py-2 sm:px-8 sm:py-4 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-all duration-300 font-poppins text-base sm:text-lg flex items-center"
          aria-label="View Stats"
        >
          <FaChartBar className="mr-2" />
          View Stats
        </a>
      </nav>
      {/* Main Content */}
      <div className="text-center z-20">
        <h1 className="text-5xl sm:text-8xl font-extrabold text-white mb-6 sm:mb-10 drop-shadow-2xl font-poppins animate-bounce glow-text">
          Make Your Choice!
        </h1>
        <div className="flex flex-col sm:flex-row justify-center space-y-6 sm:space-y-0 sm:space-x-12 mb-6 sm:mb-10 choice">
          <button
            onClick={() => sendResponse("yes")}
            className="first-btn relative w-32 h-32 sm:w-48 sm:h-48 flex items-center justify-center bg-gradient-to-r from-green-400 to-green-600 text-white rounded-full shadow-xl hover:scale-110 hover:shadow-green-600/60 transition-all duration-300 ease-in-out animate-pulse-button group"
            aria-label="Vote Yes"
          >
            <span className="relative z-10 text-2xl sm:text-4xl font-bold">
              Yes
            </span>
            <span className="absolute inset-0 bg-green-700/50 scale-0 rounded-full group-active:animate-ripple"></span>
          </button>
          <button
            onClick={() => sendResponse("no")}
            className="relative w-32 h-32 sm:w-48 sm:h-48 flex items-center justify-center bg-gradient-to-r from-red-400 to-red-600 text-white rounded-full shadow-xl hover:scale-110 hover:shadow-red-600/60 transition-all duration-300 ease-in-out animate-pulse-button group"
            aria-label="Vote No"
          >
            <span className="relative z-10 text-2xl sm:text-4xl font-bold">
              No
            </span>
            <span className="absolute inset-0 bg-red-700/50 scale-0 rounded-full group-active:animate-ripple animate-shake-button"></span>
          </button>
        </div>
        {message && (
          <div className="flex flex-col items-center">
            <Lottie
              animationData={
                responseType === "yes" ? checkmarkAnimation : crossAnimation
              }
              loop={false}
              className="w-16 h-16 sm:w-24 sm:h-24 mb-4 animate-icon"
            />
            <p
              className={`text-3xl sm:text-6xl font-bold font-poppins animate-result ${
                responseType === "yes"
                  ? "text-green-200 glow-green"
                  : responseType === "no"
                  ? "text-red-200 glow-red"
                  : "text-gray-200 glow-text"
              }`}
            >
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResponseMode;
