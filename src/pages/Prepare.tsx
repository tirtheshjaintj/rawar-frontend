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
            <div className="min-h-screen px-4 pt-20 py-6">
                <h1 className="text-2xl font-bold mb-6 text-center">Prepare</h1>
                {loading ? (
                    <div className="text-center text-lg">Loading...</div>
                ) : (
                    <div>
                        <p className="text-lg mb-4">
                            Total Questions: {questions && questions.length}
                        </p>
                        <div className="grid gap-6">
                            {questions.map((question, index) => (
                                <div
                                    key={question._id}
                                    className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6"
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
                                    <ul className="list-disc pl-6 mb-4">
                                        {question.options.map((option, optionIndex) => (
                                            <li key={optionIndex}>{option}</li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={() => toggleAnswerVisibility(question._id)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                                    >
                                        {answersVisibility.get(question._id)
                                            ? "Hide Answer"
                                            : "Show Answer"}
                                    </button>
                                    {answersVisibility.get(question._id) && (
                                        <div className="mt-4 bg-gray-100 dark:bg-gray-700 p-4 rounded">
                                            <p>
                                                <strong>Correct Answer:</strong>{" "}
                                                {question.options[question.correctAnswerIndex]}
                                            </p>
                                            <p>
                                                <strong>Explanation:</strong> {question.explanation}
                                            </p>
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
