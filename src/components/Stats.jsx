import { useEffect, useState } from "react";
import * as Ably from "ably";
import axios from "axios";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { FaGamepad, FaCheckCircle } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Stats() {
  const [responses, setResponses] = useState({ yes: 0, no: 0 });
  const [animateCounter, setAnimateCounter] = useState({ yes: 0, no: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNavbar, setShowNavbar] = useState(false);
  const [particleBurst, setParticleBurst] = useState(false);

  const particlesInit = async (main) => {
    await loadSlim(main);
  };

  // Navbar visibility timeout
  useEffect(() => {
    let timeout;
    const showNav = () => {
      setShowNavbar(true);
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

  useEffect(() => {
    // Fetch initial response counts
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/responses`)
      .then((res) => {
        const data = res.data.reduce(
          (acc, { _id, count }) => ({ ...acc, [_id]: count }),
          { yes: 0, no: 0 }
        );
        setResponses(data);
        setAnimateCounter(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load responses");
        setLoading(false);
      });

    // Set up Ably subscription
    const ably = new Ably.Realtime({
      key: import.meta.env.VITE_ABLY_API_KEY,
      clientId: `client-${Math.random().toString(36).substring(2, 9)}`,
    });

    ably.connection.on("failed", (err) => {
      console.error("Ably connection failed:", err);
      setError("Failed to connect to real-time service");
    });

    ably.connection.on("connected", () => console.log("Ably connected"));

    const channel = ably.channels.get("responses");

    channel.subscribe("response", (msg) => {
      const { response } = msg.data;
      setResponses((prev) => {
        const newResponses = { ...prev, [response]: prev[response] + 1 };
        setAnimateCounter((prevCounter) => ({
          ...prevCounter,
          [response]: prevCounter[response] + 1,
        }));
        setParticleBurst(true);
        setTimeout(() => setParticleBurst(false), 2000);
        return newResponses;
      });
    });

    return () => {
      channel.unsubscribe();
      if (ably.connection.state === "connected") {
        ably.close();
      }
    };
  }, []);

  const total = responses.yes + responses.no;
  const yesPercent = total ? ((responses.yes / total) * 100).toFixed(1) : 0;
  const noPercent = total ? ((responses.no / total) * 100).toFixed(1) : 0;

  // Bar graph data
  const barData = {
    labels: ["Yes", "No"],
    datasets: [
      {
        label: "Responses",
        data: [responses.yes, responses.no],
        backgroundColor: ["#34D399", "#EF4444"],
        borderColor: ["#10B981", "#DC2626"],
        borderWidth: 2,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
      datalabels: {
        display: true,
        color: "#ffffff",
        font: { size: 16, weight: "bold", family: "Poppins" },
        formatter: (value, context) => {
          const percent = context.dataIndex === 0 ? yesPercent : noPercent;
          return `${value} (${percent}%)`;
        },
        anchor: "end",
        align: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#ffffff", font: { size: 14, family: "Poppins" } },
        grid: { color: "rgba(255, 255, 255, 0.2)" },
      },
      x: {
        ticks: { color: "#ffffff", font: { size: 16, family: "Poppins" } },
        grid: { display: false },
      },
    },
    animation: {
      duration: 1200,
      easing: "easeInOutQuad",
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-4xl font-poppins">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 text-4xl font-poppins">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen  flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          particles: {
            number: {
              value: particleBurst ? 120 : 80,
              density: { enable: true, value_area: 800 },
            },
            color: { value: ["#34D399", "#EF4444", "#ffffff", "#8B5CF6"] },
            shape: { type: ["circle", "star"], multiple: true },
            opacity: { value: 0.6, random: true },
            size: { value: particleBurst ? 6 : 4, random: true },
            move: {
              enable: true,
              speed: particleBurst ? 2 : 1,
              direction: "none",
              random: true,
            },
          },
          interactivity: {
            events: {
              onhover: { enable: true, mode: "repulse" },
              onclick: { enable: true, mode: "push" },
            },
          },
        }}
        className="absolute inset-0"
      />
      <nav
        className={`fixed top-0 left-0 right-0 bg-black/70 backdrop-blur-lg z-30 py-4 px-6 flex justify-center space-x-4 transition-all duration-300 ${
          showNavbar ? "animate-nav-show" : "animate-nav-hide"
        }`}
      >
        <a
          href="/"
          className="px-8 py-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 font-poppins text-lg flex items-center"
          aria-label="Go to Response Mode"
        >
          <FaCheckCircle className="mr-2" />
          Respond
        </a>
        <a
          href="/view"
          className="px-8 py-4 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-all duration-300 font-poppins text-lg flex items-center"
          aria-label="Go to View Mode"
        >
          <FaGamepad className="mr-2" />
          View Game
        </a>
      </nav>
      <div className="text-center z-20 w-full max-w-2xl">
        <h1 className="text-8xl font-extrabold text-white mb-10 drop-shadow-2xl font-poppins animate-bounce glow-text">
          Game Stats
        </h1>
        <div className="flex justify-center space-x-12 mb-8">
          <div className="text-4xl font-semibold text-green-200 font-poppins">
            Yes:{" "}
            <span className="animate-counter glow-text">
              {animateCounter.yes}
            </span>{" "}
            ({yesPercent}%)
          </div>
          <div className="text-4xl font-semibold text-red-200 font-poppins">
            No:{" "}
            <span className="animate-counter glow-text">
              {animateCounter.no}
            </span>{" "}
            ({noPercent}%)
          </div>
        </div>
        <div className="w-full h-64 mb-8">
          <Bar data={barData} options={barOptions} className="animate-bar" />
        </div>
        <div className="w-full bg-gray-300/50 rounded-full h-12 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-400 to-green-600 h-12 rounded-full animate-progress"
            style={{ "--progress-width": `${yesPercent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default Stats;
