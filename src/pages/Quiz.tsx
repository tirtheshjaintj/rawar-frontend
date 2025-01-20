import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaCheckCircle, FaClock, FaArrowLeft, FaArrowRight, FaPlayCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Modal from "react-modal";
import axiosInstance from "../config/axiosConfig";
import { useSelector } from "react-redux";

// Define types for question and answer structures
interface Question {
    _id: string;
    title: string;
    options: string[];
    level: "easy" | "medium" | "hard";
}

interface ReduxState {
    user: any; // Replace `any` with your user type if available
}

function Quiz() {
    const { category_id } = useParams<{ category_id: string }>();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes
    const [quizStarted, setQuizStarted] = useState(false);
    const [modalOpen, setModalOpen] = useState(true);
    const navigate = useNavigate();
    const user = useSelector((state: ReduxState) => state.user);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const getQuestions = async () => {
        try {
            const response = await axiosInstance.get(`/question/${category_id}`);
            const questions: Question[] = response.data.data;
            setQuestions(questions);
            setAnswers(Array(questions.length).fill(-1));
        } catch (error) {
            toast.error("Failed to load questions.");
            navigate("/");
        }
    };

    useEffect(() => {
        if (category_id) getQuestions();
    }, [category_id]);

    useEffect(() => {
        if (quizStarted && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev % 60 === 0) {
                        toast(`Time left: ${Math.floor(prev / 60)} minutes`, { icon: "⏱️" });
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
        if (timeLeft === 0) {
            toast.error("Time's up! Submitting quiz...");
            handleSubmit();
        }
    }, [quizStarted, timeLeft]);

    useEffect(() => {
        if (!user) {
            navigate("/");
        }
        window.scrollTo(0, 0);

        const handleFullScreenChange = () => {
            if (!document.fullscreenElement) {
                toast.error("Cheating attempt detected: Exiting fullscreen mode.");
                navigate("/");
            }
        };

        document.addEventListener("fullscreenchange", handleFullScreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullScreenChange);
        };
    }, [navigate, user]);

    const handleAnswerChange = (index: number) => {
        const updatedAnswers = [...answers];
        updatedAnswers[currentQuestion] = index;
        setAnswers(updatedAnswers);
        if (currentQuestion < questions.length - 1) {
            setTimeout(() => setCurrentQuestion((prev) => prev + 1), 500);
        }
    };

    const handleBack = () => setCurrentQuestion((prev) => prev - 1);

    const handleNext = () => {
        if (answers[currentQuestion] === -1) {
            toast.error("Please select an answer before proceeding!");
            return;
        }
        setCurrentQuestion((prev) => prev + 1);
    };

    const handleSubmit = () => {
        if (answers.includes(-1)) {
            toast.error("You have unanswered questions!");
            return;
        }

        setIsLoading(true); // Set loading state to true when submission starts

        const submissionData = questions.map((q, i) => ({
            question_id: q._id,
            user_answer: answers[i],
        }));

        axiosInstance
            .post("/quiz/submit-quiz", { category_id, answers: submissionData })
            .then(() => {
                toast.success("Quiz submitted successfully!");
                navigate("/user/dashboard");
            })
            .catch((error) => {
                toast.error("Failed to submit the quiz.");
                console.error(error);
            })
            .finally(() => {
                setIsLoading(false); // Set loading state back to false once submission finishes
            });
    };


    const startQuiz = () => {
        if (questions.length === 0) {
            toast.error("No questions available!");
            return;
        }
        setQuizStarted(true);
        setModalOpen(false);
        toast("Good luck! Let's ace this quiz! 🎉", { icon: "🚀" });
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }
    };

    const progress = (currentQuestion / questions.length) * 100;

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

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen">
            {/* Green Progress Bar */}
            {quizStarted && (
                <div
                    className="absolute top-0 left-0 h-2 transition-all bg-green-500 rounded lg:h-4"
                    style={{ width: `${progress}%` }}
                />
            )}

            {/* Start Quiz Modal */}
            <Modal
                isOpen={modalOpen}
                className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-md"
                overlayClassName="fixed inset-0 bg-black/20"
            >
                <div className="w-full max-w-sm p-8 mx-auto rounded-lg shadow-2xl">
                    <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white">
                        Ready to start the quiz?
                    </h2>
                    <ul className="mt-6 space-y-3 text-lg text-gray-600 dark:text-gray-300">
                        <li>📋 <strong>{questions.length} Questions</strong></li>
                        <li>⏱️ <strong>Time Limit: 10 minutes</strong></li>
                        <li>✅ <strong>1 point per question</strong></li>
                    </ul>
                    <motion.button
                        onClick={startQuiz}
                        className="w-full px-6 py-3 mt-6 text-xl font-semibold text-white rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Start Quiz <FaPlayCircle className="inline ml-2" />
                    </motion.button>
                </div>
            </Modal>

            {/* Timer */}
            {quizStarted && (
                <div className="absolute flex items-center p-4 text-black transform -translate-x-1/2 bg-white rounded-full shadow-lg top-2 left-1/2 dark:bg-gray-900 dark:text-white">
                    <FaClock className="mr-2 text-blue-500" />
                    <span className="lg:text-2xl">
                        {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? "0" : ""}
                        {timeLeft % 60}
                    </span>
                </div>
            )}

            {/* Quiz Content */}
            {quizStarted && questions.length > 0 && (
                <motion.div
                    className="w-full max-w-3xl p-8 bg-white rounded-lg shadow-lg dark:bg-gray-800"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="mb-4 text-2xl font-bold text-center text-gray-800 dark:text-white">
                        Question {currentQuestion + 1} of {questions.length}
                    </h2>
                    <p className="p-3 mb-6 text-xl text-gray-700 dark:text-gray-300">
                        {questions[currentQuestion].title}
                    </p>
                    <div className="space-y-4">
                        {questions[currentQuestion].options.map((option, index) => (
                            <motion.div
                                key={index}
                                className={`p-4 rounded-lg text-center cursor-pointer transition-all ${answers[currentQuestion] === index
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                                    }`}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleAnswerChange(index)}
                            >
                                {option}
                            </motion.div>
                        ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8">
                        <motion.button
                            onClick={handleBack}
                            disabled={currentQuestion === 0}
                            className="px-6 py-3 text-gray-800 bg-gray-300 rounded-lg shadow-md disabled:opacity-50 dark:bg-gray-700 dark:text-gray-400"
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaArrowLeft className="inline mr-2" />
                            Back
                        </motion.button>
                        <span
                            className={`inline-block px-4 py-2 text-sm rounded-full font-semibold ${getLevelClass(
                                questions[currentQuestion].level
                            )}`}
                        >
                            {questions[currentQuestion].level.toUpperCase()}
                        </span>
                        {currentQuestion < questions.length - 1 && (
                            <motion.button
                                onClick={handleNext}
                                className="px-6 py-3 text-white bg-blue-500 rounded-lg shadow-md"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Next <FaArrowRight className="inline ml-2" />
                            </motion.button>
                        )}
                        {currentQuestion === questions.length - 1 && (
                            <motion.button
                                onClick={handleSubmit}
                                className="px-6 py-3 text-white bg-green-500 rounded-lg shadow-md"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={isLoading} // Disable the button while loading
                            >
                                {isLoading ? "Submitting..." : "Submit"} <FaCheckCircle className="inline ml-2" />
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export default Quiz;
