import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Chatbot from "../components/ChatBot";
import Navbar from "../components/Navbar";
import axiosInstance from "../config/axiosConfig";
import toast from "react-hot-toast";

// Interfaces
interface Question {
    title: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
    level: "easy" | "medium" | "hard";
    _id: string;
}

const getLevelClass = (level: "easy" | "medium" | "hard") => {
    switch (level) {
        case "easy":
            return "bg-green-500 text-white";
        case "medium":
            return "bg-yellow-500 text-white";
        case "hard":
            return "bg-red-500 text-white";
        default:
            return "bg-gray-500 text-white";
    }
};

const Prepare: React.FC = () => {
    const { category_id } = useParams<{ category_id: string }>();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [answersVisibility, setAnswersVisibility] = useState<Map<string, boolean>>(new Map());

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get(`/question/${category_id}/all`);
                setQuestions(response.data.data);

                // Initialize visibility state for all questions
                const initialVisibility = new Map<string, boolean>();
                response.data.data.forEach((question: Question) => {
                    initialVisibility.set(question._id, false);
                });
                setAnswersVisibility(initialVisibility);
                toast.success("Questions loaded successfully!");
            } catch (error) {
                toast.error("Failed to fetch questions. Redirecting to home.");
                navigate("/");
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [category_id, navigate]);

    const toggleAnswerVisibility = (questionId: string) => {
        setAnswersVisibility((prev) => {
            const newVisibility = new Map(prev);
            newVisibility.set(questionId, !newVisibility.get(questionId));
            return newVisibility;
        });
    };

    useEffect(() => {
        window.scroll(0, 0);
    }, []);

    return (
        <>
            <Navbar />
            <Chatbot />
            <div className="min-h-screen px-4 py-6 pt-20">
                <h1 className="mb-6 text-2xl font-bold text-center">Prepare</h1>
                {loading ? (
                    <div className="text-lg text-center">Loading...</div>
                ) : (
                    <div>
                        <p className="mb-4 text-lg">
                            Total Questions: {questions && questions.length}
                        </p>
                        <div className="grid gap-6">
                            {questions.map((question, index) => (
                                <div
                                    key={question._id}
                                    className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xl font-semibold">
                                            {index + 1}. {question.title}
                                        </span>
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelClass(
                                                question.level
                                            )}`}
                                        >
                                            {question.level}
                                        </span>
                                    </div>
                                    <ul className="pl-6 mb-4 list-disc">
                                        {question.options.map((option, optionIndex) => (
                                            <li key={optionIndex}>{option}</li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={() => toggleAnswerVisibility(question._id)}
                                        className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-600"
                                    >
                                        {answersVisibility.get(question._id)
                                            ? "Hide Answer"
                                            : "Show Answer"}
                                    </button>
                                    {answersVisibility.get(question._id) && (
                                        <div className="p-4 mt-4 bg-gray-100 rounded dark:bg-gray-700">
                                            <p>
                                                <strong>Correct Answer:</strong>{" "}
                                            </p>
                                            <p>{question.options[question.correctAnswerIndex]}</p>
                                            <p>
                                                <strong>Explanation:</strong>
                                            </p>
                                            <p>{question.explanation}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Prepare;
