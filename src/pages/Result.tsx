import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Cookie from "universal-cookie";
import { addUser } from "../store/userSlice";
import axiosInstance from "../config/axiosConfig";
import Navbar from "../components/Navbar";
import Chatbot from "../components/ChatBot";

interface AnalysisItem {
    question_title: string;
    options: string[];
    user_option: string;
    correct_option: string;
    explanation: string;
    isCorrect: boolean;
}

function Result() {
    const user = useSelector((state: any) => state.user);
    const navigate = useNavigate();
    const cookie = new Cookie();
    const dispatch = useDispatch();
    const { result_id } = useParams();
    const [analysis, setAnalysis] = useState<AnalysisItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state

    useEffect(() => {
        const token = cookie.get("user_token");
        if (!user && token) {
            getUser();
        }
    }, [user]);
    /**
     * Fetches the user data from the server if the user is not logged in.
     * If the user is logged in, it dispatches the user data to the store.
     */

    const getUser = async () => {
        const userToken = cookie.get("user_token");
        if (!userToken) {
            return;
        }
        try {
            /**
             * Fetches the result analysis from the server.
             * The result analysis is fetched when the component mounts or when the user logs in.
             */
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
            getResultAnalysis();
        }
    }, [user]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const getResultAnalysis = async () => {
        try {
            /**
             * Fetches the result analysis from the server.
             * The result analysis is stored in the state when it is fetched.
             */
            const response = await axiosInstance.get(
                `/quiz/result-analysis/${result_id}`
            );
            if (response.data.analysis) {
                setAnalysis(response.data.analysis);
                console.log(response.data.analysis);
            }
        } catch (error) {
            console.error("Error fetching result analysis:", error);
        } finally {
            setIsLoading(false); // Stop loading after data is fetched
        }
    };

    return (
        <>
            <Navbar />
            <Chatbot />
            <div className="container mx-auto p-4 pt-20">
                <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                    Result Analysis
                </h1>
                <div className="space-y-4">
                    {isLoading
                        ? // Loading Skeleton
                        Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md animate-pulse"
                            >
                                {/* Skeleton for Question Title */}
                                <div className="h-6 bg-gray-300 dark:bg-gray-600 mb-4 rounded"></div>
                                {/* Skeleton for Options */}
                                <div className="space-y-2 mb-4">
                                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                </div>
                                {/* Skeleton for User and Correct Answer */}
                                <div className="h-5 bg-gray-300 dark:bg-gray-600 mb-4 rounded"></div>
                                <div className="h-5 bg-gray-300 dark:bg-gray-600 mb-4 rounded"></div>
                                {/* Skeleton for Explanation */}
                                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                {/* Skeleton for Status Badge */}
                                <div className="w-20 h-6 bg-gray-300 dark:bg-gray-600 mt-4 rounded-full"></div>
                            </div>
                        ))
                        : // Actual Result Analysis
                        analysis.map((item, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"
                            >
                                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                                    {item.question_title}
                                </h2>
                                <div className="mb-2">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Available Options:
                                    </p>
                                    <ul className="list-disc pl-5">
                                        {item.options.map((option: string, i: number) => (
                                            <li
                                                key={i}
                                                className="text-gray-900 dark:text-white"
                                            >
                                                {option}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mb-2">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Your Answer:
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {item.user_option}
                                    </p>
                                </div>
                                <div className="mb-2">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Correct Answer:
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {item.correct_option}
                                    </p>
                                </div>
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Explanation:
                                    </p>
                                    <p className="text-md text-gray-900 dark:text-white">
                                        {item.explanation}
                                    </p>
                                </div>
                                <div
                                    className={`bg-${(item.isCorrect) ? "green" : "red"
                                        }-500 text-white py-1 px-3 rounded-full text-sm`}
                                >
                                    {item.isCorrect ? "Correct" : "Wrong"}
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </>
    );
}

export default Result;
