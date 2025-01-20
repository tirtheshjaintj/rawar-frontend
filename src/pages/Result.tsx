import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import Cookie from "universal-cookie";
import { addUser } from '../store/userSlice';
import axiosInstance from '../config/axiosConfig';
import Navbar from "../components/Navbar";
import Chatbot from "../components/ChatBot";

// Define the types for the analysis items
interface AnalysisItem {
    question_title: string;
    options: string[];
    user_option: string;
    correct_option: string;
    explanation: string;
    isCorrect: 'Correct' | 'Incorrect'; // Assuming this is a string
}

function Result() {
    const user = useSelector((state: any) => state.user);
    const navigate = useNavigate();
    const cookie = new Cookie();
    const dispatch = useDispatch();
    const { result_id } = useParams();
    const [analysis, setAnalysis] = useState<AnalysisItem[]>([]);

    useEffect(() => {
        const token = cookie.get('user_token');
        if (!user && token) {
            getUser();
        }
    }, [user]);

    const getUser = async () => {
        const userToken = cookie.get('user_token');
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
                cookie.remove('user_token');
            }
        } catch (error: any) {
            if (!error?.response?.data?.status) {
                cookie.remove('user_token');
            }
        }
    };

    useEffect(() => {
        const token = cookie.get('user_token');
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
            const response = await axiosInstance.get(`/quiz/result-analysis/${result_id}`);
            if (response.data.analysis) {
                setAnalysis(response.data.analysis);
                console.log(response.data.analysis);
            }
        } catch (error) {
            console.error("Error fetching result analysis:", error);
        }
    };

    return (
        <>
            <Navbar />
            <Chatbot />
            <div className="container mx-auto p-4 pt-20">
                <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Result Analysis</h1>
                <div className="space-y-4">
                    {analysis.map((item, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{item.question_title}</h2>
                            <div className="mb-2">
                                <p className="text-sm text-gray-600 dark:text-gray-300">Available Options:</p>
                                <ul className="list-disc pl-5">
                                    {item.options.map((option: string, i: number) => (
                                        <li key={i} className="text-gray-900 dark:text-white">{option}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mb-2">
                                <p className="text-sm text-gray-600 dark:text-gray-300">Your Answer:</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">{item.user_option}</p>
                            </div>
                            <div className="mb-2">
                                <p className="text-sm text-gray-600 dark:text-gray-300">Correct Answer:</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">{item.correct_option}</p>
                            </div>
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-300">Explanation:</p>
                                <p className="text-md text-gray-900 dark:text-white">{item.explanation}</p>
                            </div>
                            <div className={`bg-${item.isCorrect === 'Correct' ? 'green' : 'red'}-500 text-white py-1 px-3 rounded-full text-sm`}>
                                {item.isCorrect}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default Result;
