import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Cookie from "universal-cookie";
import { addUser } from "../../store/userSlice";
import axiosInstance from "../../config/axiosConfig";
import Navbar from "../../components/Navbar";
import Chatbot from "../../components/ChatBot";

function Dashboard() {
    const user = useSelector((state: any) => state.user);
    const navigate = useNavigate();
    const cookie = new Cookie();
    const dispatch = useDispatch();
    const [results, setResults] = useState<any[]>([]);

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
            return; // Exit if the user token is not available
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
            const response = await axiosInstance.get(`/quiz/user-results`);
            if (response.data.results) {
                setResults(response.data.results);
            }
        } catch (error) {
            console.error("Error fetching results:", error);
        }
    };

    const calculateAccuracy = (marks: number, total: number) => {
        return Number(((marks / total) * 100).toFixed(2)); // Convert to number after rounding
    };

    const getTag = (accuracy: number) => {
        if (accuracy >= 90) return "Excellent";
        if (accuracy >= 75) return "Good";
        if (accuracy >= 50) return "Needs Improvement";
        return "Poor";
    };

    return (
        <>
            <Navbar />
            <Chatbot />
            <div className="container mx-auto p-4 pt-32">
                <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Your Quiz Results</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.map((result: any) => {
                        const totalQuestions = result.answers.length;
                        const accuracy = calculateAccuracy(result.marks, totalQuestions);
                        const tag = getTag(accuracy);

                        return (
                            <Link
                                to={`/result/${result._id}`}
                                key={result._id}
                                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"
                            >
                                <div className="mb-4">
                                    <img
                                        src={result.category_id.image} // Assuming category has bannerImage
                                        alt={result.category_id.name}
                                        className="w-full h-32 object-cover rounded-md"
                                    />
                                </div>
                                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                                    {result.category_id.name}
                                </h2>
                                <div className="flex items-center mb-2">
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                                        {result.marks} / {totalQuestions}
                                    </span>
                                </div>
                                <div className="mb-2">
                                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
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
