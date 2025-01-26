import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axiosConfigAdmin";
import Navbar from "../../components/Navbar";
import Chatbot from "../../components/ChatBot";
import toast from "react-hot-toast";
import { addAdmin } from "../../store/adminSlice";
import { useDispatch, useSelector } from "react-redux";
import Cookie from "universal-cookie";

interface Category {
    _id: string;
    name: string;
    image: string;
    total: number;
    totalQuestions: number;
}

interface Question {
    title: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
    level: "easy" | "medium" | "hard";
}

const Admin_Dashboard: React.FC = () => {
    const admin = useSelector((state: any) => state.admin);
    const cookie = new Cookie();
    const dispatch = useDispatch();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null
    );
    const [questions, setQuestions] = useState<Question[]>([
        {
            title: "",
            options: ["", "", "", ""],
            correctAnswerIndex: 0,
            explanation: "",
            level: "easy",
        },
    ]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const getAdmin = async () => {
        const adminToken = cookie.get('admin_token');
        if (!adminToken) {
            return; // Exit if the seller token is not available
        }
        try {
            const response = await axiosInstance.get(`/admin/getAdmin`, {
                withCredentials: true, // Keep this if you need credentials
            });
            const adminData = response.data;
            if (adminData.status) {
                dispatch(addAdmin(adminData.user));
            } else {
                cookie.remove('admin_token');
            }
        } catch (error: any) {
            if (!error.response.data.status) {
                cookie.remove('admin_token');
            }
        }
    };

    useEffect(() => {
        const token = cookie.get("admin_token");
        if (!admin && !token) {
            navigate("/admin/login");
        } else {
            getAdmin();
        }
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axiosInstance.get("/category");
                if (response.data.status) {
                    setCategories(response.data.data);
                } else {
                    console.error("Failed to fetch categories");
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
        window.scrollTo(0, 0);
    }, []);

    const handleAddQuestion = () => {
        setQuestions((prevQuestions) => [
            ...prevQuestions,
            {
                title: "",
                options: ["", "", "", ""],
                correctAnswerIndex: 0,
                explanation: "",
                level: "easy",
            },
        ]);
    };

    const handleRemoveQuestion = (index: number) => {
        setQuestions((prevQuestions) =>
            prevQuestions.filter((_, idx) => idx !== index)
        );
    };

    const handleQuestionChange = (
        index: number,
        field: string,
        value: any
    ) => {
        setQuestions((prevQuestions) => {
            const updatedQuestions = [...prevQuestions];
            if (field === "options") {
                updatedQuestions[index].options = value;
            } else {
                updatedQuestions[index][field] = value;
            }
            return updatedQuestions;
        });
    };

    const handleSelectCorrectAnswer = (index: number, optionIndex: number) => {
        handleQuestionChange(index, "correctAnswerIndex", optionIndex);
    };

    const handleSubmit = async () => {
        if (!selectedCategory) {
            toast.error("No category selected!");
            return;
        }

        // Check if all fields are filled in and valid
        const isValid = questions.every((q, index) => {
            // Check if title is filled
            if (!q.title) {
                toast.error(`Question ${index + 1}: Title is required.`);
                return false;
            }

            // Check if all options are filled and are not empty strings
            const areOptionsValid = q.options.every((option) => option.trim() !== "");
            if (!areOptionsValid) {
                toast.error(`Question ${index + 1}: All options must be filled.`);
                return false;
            }

            // Ensure correctAnswerIndex is between 0 and 3
            if (q.correctAnswerIndex < 0 || q.correctAnswerIndex > 3) {
                toast.error(`Question ${index + 1}: Correct answer index must be between 0 and 3.`);
                return false;
            }

            // Check if explanation is filled
            if (!q.explanation) {
                toast.error(`Question ${index + 1}: Explanation is required.`);
                return false;
            }

            // Check if level is valid (can add more checks for level if needed)
            if (!q.level || !["easy", "medium", "hard"].includes(q.level)) {
                toast.error(`Question ${index + 1}: Level is required and should be 'easy', 'medium', or 'hard'.`);
                return false;
            }

            return true; // If all checks pass, return true
        });

        if (!isValid) {
            return; // Stop the submission if any validation fails
        }

        // Add category_id to each question before sending it to the backend
        const questionsWithCategory = questions.map((question) => ({
            ...question,
            category_id: selectedCategory._id, // Add category_id to each question
        }));
        console.log(questionsWithCategory);
        try {
            setLoading(true);
            const response = await axiosInstance.post("/question/add", {
                category_id: selectedCategory._id,
                questions: questionsWithCategory, // Send updated questions with category_id
            });
            if (response.data.status) {
                toast.success("Questions added successfully!");
                navigate("/admin/dashboard");
                setSelectedCategory(null);
                setQuestions([{
                    title: "",
                    options: ["", "", "", ""],
                    correctAnswerIndex: 0,
                    explanation: "",
                    level: "easy",
                }]);
            } else {
                console.log(response.data);
                toast.error("Failed to add questions.");
            }
        } catch (error) {
            toast.error("An error occurred while adding questions.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    const handleBack = () => {
        setSelectedCategory(null);
    };

    if (!selectedCategory) {
        return (
            <>
                <Navbar />
                <Chatbot />
                <div className="min-h-screen pt-20">
                    <div className="container mx-auto py-12">
                        <h1 className="text-4xl font-extrabold text-center text-gray-800 dark:text-white">
                            Select a Category
                        </h1>
                        <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
                            Choose a category to start adding questions.
                        </p>
                        <div className="grid grid-cols-1 gap-6 mt-10 sm:grid-cols-2 lg:grid-cols-3">
                            {isLoading
                                ? Array.from({ length: 6 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="rounded-xl shadow-md bg-gray-200 animate-pulse"
                                    >
                                        <div className="h-52 bg-gray-300 rounded-t-xl"></div>
                                        <div className="p-4">
                                            <div className="h-6 bg-gray-300 rounded mb-4"></div>
                                            <div className="h-8 bg-gray-300 rounded"></div>
                                        </div>
                                    </div>
                                ))
                                : categories.map((category) => (
                                    <motion.div
                                        key={category._id}
                                        className="rounded-xl shadow-md hover:shadow-lg"
                                        whileHover={{ scale: 1.05 }}
                                        onClick={() => setSelectedCategory(category)}
                                    >
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="w-full h-52 object-cover rounded-t-xl"
                                        />
                                        <div className="p-4 text-center">
                                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                                                {category.name}
                                            </h3>
                                            <h4 className="mt-2">
                                                Total Questions: <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 
                                             font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">
                                                    {category.totalQuestions}</span>

                                            </h4>
                                            <h4 className="mt-2">
                                                Total Tests: <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 
                                             font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">
                                                    {category.total}</span>

                                            </h4>
                                        </div>
                                    </motion.div>
                                ))}
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <Chatbot />
            <div className="min-h-screen pt-20">
                <div className="container mx-auto py-10">
                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={handleBack}
                            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-700 dark:text-white"
                        >
                            Back
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                            Add Questions to "{selectedCategory.name}"
                        </h1>
                    </div>

                    <AnimatePresence>
                        {questions.map((question, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800 mb-4"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">
                                        Question {index + 1}
                                    </h2>
                                    {questions.length > 1 && (
                                        <button
                                            onClick={() => handleRemoveQuestion(index)}
                                            className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Enter question title"
                                        value={question.title}
                                        onChange={(e) =>
                                            handleQuestionChange(index, "title", e.target.value)
                                        }
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                                    />
                                    <div className="space-y-2">
                                        {question.options.map((option, optionIndex) => (
                                            <div
                                                key={optionIndex}
                                                className="flex items-center gap-2"
                                            >
                                                <input
                                                    type="radio"
                                                    id={`option-${index}-${optionIndex}`}
                                                    name={`correct-${index}`}
                                                    checked={question.correctAnswerIndex === optionIndex}
                                                    onChange={() =>
                                                        handleSelectCorrectAnswer(index, optionIndex)
                                                    }
                                                    className="h-4 w-4 text-blue-500"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder={`Option ${optionIndex + 1}`}
                                                    value={option}
                                                    onChange={(e) =>
                                                        handleQuestionChange(index, "options", [
                                                            ...question.options.slice(0, optionIndex),
                                                            e.target.value,
                                                            ...question.options.slice(optionIndex + 1),
                                                        ])
                                                    }
                                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <textarea
                                        placeholder="Enter explanation"
                                        value={question.explanation}
                                        onChange={(e) =>
                                            handleQuestionChange(index, "explanation", e.target.value)
                                        }
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                                    />
                                    <select
                                        value={question.level}
                                        onChange={(e) =>
                                            handleQuestionChange(index, "level", e.target.value)
                                        }
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <div className="flex justify-between mt-6">
                        <button
                            onClick={handleAddQuestion}
                            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Add Another Question
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`px-6 py-2 text-white rounded ${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-600"
                                }`}
                        >
                            {loading ? "Submitting..." : "Submit Questions"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Admin_Dashboard;
