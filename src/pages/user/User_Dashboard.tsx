import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Cookie from "universal-cookie";
import { addUser } from "../../store/userSlice";
import axiosInstance from "../../config/axiosConfig";
import Navbar from "../../components/Navbar";
import Chatbot from "../../components/ChatBot";
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

interface Result {
    _id: string;
    marks: number;
    answers: any[];
    createdAt: string;
    category_id: {
        name: string;
        image: string;
        _id: string;
    };
}

function Dashboard() {
    const user = useSelector((state: any) => state.user);
    const navigate = useNavigate();
    const cookie = new Cookie();
    const dispatch = useDispatch();
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const token = cookie.get("user_token");
        if (!user && token) {
            getUser();
        }
    }, [user]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const getUser = async () => {
        const userToken = cookie.get("user_token");
        if (!userToken) {
            return;
        }
        try {
            const response = await axiosInstance.get(`/user/getUser`, {
                withCredentials: true,
            });
            const userData = response.data;
            if (userData.status) {
                dispatch(addUser(userData.user));
            } else {
                cookie.remove("user_token");
            }
        } catch (error: any) {
            if (!error?.response?.data?.status) {
                cookie.remove("user_token");
            }
        }
    };

    useEffect(() => {
        const token = cookie.get("user_token");
        if (!user && !token) {
            navigate("/user/login");
        } else {
            getResults();
        }
    }, [user]);

    const getResults = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/quiz/user-results`);
            if (response.data.results) {
                setResults(response.data.results);
            }
        } catch (error) {
            console.error("Error fetching results:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateAccuracy = (marks: number, total: number) => {
        return Number(((marks / total) * 100).toFixed(2));
    };

    const getTag = (accuracy: number) => {
        if (accuracy >= 90) return "Excellent";
        if (accuracy >= 75) return "Good";
        if (accuracy >= 50) return "Needs Improvement";
        return "Poor";
    };

    const getCategoryColor = (categoryName: string, opacity: number = 1) => {
        switch (categoryName) {
            case "Web Development":
                return `rgba(76, 175, 80, ${opacity})`; // Green
            case "Mobile Development":
                return `rgba(33, 150, 243, ${opacity})`; // Blue
            case "General Aptitude":
                return `rgba(255, 87, 34, ${opacity})`; // Orange
            default:
                return `rgba(156, 39, 176, ${opacity})`; // Default color (Purple)
        }
    };

    const groupedResults = results.slice().reverse().reduce((acc: Record<string, any>, result) => {
        const categoryId = result.category_id._id;
        if (!acc[categoryId]) {
            acc[categoryId] = {
                label: result.category_id.name,
                data: [],
                borderColor: getCategoryColor(result.category_id.name),
                backgroundColor: getCategoryColor(result.category_id.name, 0.2),
                tension: 0.4,
                fill: true,
            };
        }
        acc[categoryId].data.push(calculateAccuracy(result.marks, result.answers.length));
        return acc;
    }, {});
    // Prepare data for the chart
    const chartData = {
        labels: results.slice().reverse().map((result) => new Date(result.createdAt).toLocaleDateString()),
        datasets: Object.values(groupedResults),
    };



    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false, // Disable the legend (top bars)
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const categoryName = context.dataset.label || '';
                        const accuracy = context.raw;
                        return `${categoryName}: Accuracy: ${accuracy}%`; // Show category name and accuracy
                    },
                },
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Date",
                    font: {
                        family: "'Inter', sans-serif",
                        weight: "bold",
                    },
                    color: "rgb(55, 65, 81)", // For readability in dark and light mode
                },
                grid: {
                    color: "rgba(55, 65, 81, 0.1)", // Subtle grid lines
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Accuracy (%)",
                    font: {
                        family: "'Inter', sans-serif",
                        weight: "bold",
                    },
                    color: "rgb(55, 65, 81)", // For readability in dark and light mode
                },
                min: 0,
                max: 100,
                grid: {
                    color: "rgba(55, 65, 81, 0.1)", // Subtle grid lines
                },
            },
        },
    };


    return (
        <>
            <Navbar />
            <Chatbot />
            <div className="container p-4 pt-32 mx-auto">
                <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                    Your Quiz Results
                </h1>

                {/* Chart Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Accuracy Progress
                    </h2>
                    {results.length > 0 ? (
                        <Line data={chartData} options={chartOptions} />
                    ) : (
                        <p className="text-gray-600 dark:text-gray-300">
                            No results to display yet.
                        </p>
                    )}
                </div>

                {/* Results Section */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {loading
                        ? Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="p-4 bg-white rounded-lg shadow-md dark:bg-gray-800 animate-pulse"
                            >
                                <div className="w-full h-32 mb-4 bg-gray-300 rounded-md dark:bg-gray-600"></div>
                                <div className="h-6 mb-2 bg-gray-300 rounded dark:bg-gray-600"></div>
                                <div className="h-5 mb-2 bg-gray-300 rounded dark:bg-gray-600"></div>
                                <div className="w-full h-2 mb-2 bg-gray-200 rounded-full dark:bg-gray-600"></div>
                                <div className="w-20 h-6 bg-gray-300 rounded-full dark:bg-gray-600"></div>
                            </div>
                        ))
                        : results.map((result: any) => {
                            const totalQuestions = result.answers.length;
                            const accuracy = calculateAccuracy(result.marks, totalQuestions);
                            const tag = getTag(accuracy);

                            return (
                                <Link
                                    to={`/result/${result._id}`}
                                    key={result._id}
                                    className="p-4 bg-white rounded-lg shadow-md dark:bg-gray-800"
                                >
                                    <div className="mb-4">
                                        <img
                                            src={result.category_id.image}
                                            alt={result.category_id.name}
                                            className="object-cover w-full h-32 rounded-md"
                                        />
                                    </div>
                                    <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                                        {result.category_id.name}
                                    </h2>
                                    <div className="flex items-center mb-2">
                                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                                            {result.marks} / {totalQuestions}
                                        </span>
                                    </div>
                                    <div className="mb-2">
                                        <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-600">
                                            <div
                                                className="h-2 rounded-full"
                                                style={{
                                                    width: `${accuracy}%`,
                                                    backgroundColor:
                                                        accuracy >= 90
                                                            ? "#4CAF50"
                                                            : accuracy >= 75
                                                                ? "#FFEB3B"
                                                                : "#FF5722",
                                                }}
                                            ></div>
                                        </div>
                                        <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                            Accuracy: {accuracy}%
                                        </div>
                                    </div>
                                    <div
                                        className={`${tag === "Excellent"
                                            ? "bg-green-500"
                                            : tag === "Good"
                                                ? "bg-yellow-500"
                                                : "bg-red-500"
                                            } text-white py-1 px-3 rounded-full text-sm`}
                                    >
                                        {tag}
                                    </div>
                                </Link>
                            );
                        })}
                </div>
            </div>
        </>
    );
}

export default Dashboard;
