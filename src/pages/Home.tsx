import { useEffect, useState } from "react";
import { FaBook, FaPlay } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosConfig";
import Chatbot from "../components/ChatBot";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";

interface Category {
    _id: string;
    name: string;
    image: string;
    total: number;
}

function Home() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state
    const navigate = useNavigate();
    const user = useSelector((state: any) => state.user);

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
                setIsLoading(false); // Stop loading after data is fetched
            }
        };

        fetchCategories();
        window.scrollTo(0, 0);

    }, []);


    const handleClick = (categoryId: string) => {
        if (user) {
            navigate(`/quiz/${categoryId}`);
        } else {
            navigate(`/user/login`);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen pt-10 bg-transparent">
                <Chatbot />
                <div className="px-4 py-16 lg:px-8">
                    <h1 className="text-4xl font-extrabold text-center text-gray-800 dark:text-white">
                        Choose a Category
                    </h1>
                    <p className="mt-3 text-center text-gray-600 dark:text-gray-400">
                        Start your quiz journey by selecting a category below!
                    </p>

                    {/* Categories Grid */}
                    <div className="grid grid-cols-1 gap-12 mt-12 sm:grid-cols-2 lg:grid-cols-3">
                        {isLoading
                            ? // Loading Skeleton
                            Array.from({ length: 6 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="relative overflow-hidden rounded-xl shadow-lg bg-gray-200 animate-pulse"
                                >
                                    {/* Skeleton for Image */}
                                    <div className="w-full h-52 bg-gray-300"></div>
                                    {/* Skeleton for Text */}
                                    <div className="p-6">
                                        <div className="h-6 mb-4 bg-gray-300 rounded"></div>
                                        <div className="h-10 bg-gray-300 rounded"></div>
                                    </div>
                                </div>
                            ))
                            : // Actual Categories
                            categories.map((category) => (
                                <motion.div
                                    key={category._id}
                                    className="relative overflow-hidden transition-transform duration-500 shadow-lg cursor-pointer rounded-xl hover:shadow-2xl"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    {/* Animated Image */}
                                    <div
                                        className="relative"
                                        onClick={() => handleClick(category._id)}
                                    >
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="object-fill w-full h-52 rounded-t-xl"
                                        />
                                        {/* Play Icon Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 bg-black/30 hover:opacity-100">
                                            <FaPlay className="text-5xl text-white animate-pulse" />
                                        </div>
                                    </div>
                                    {/* Card Content */}
                                    <div className="p-6 text-center">
                                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                            {category.name}
                                        </h3>
                                        <h4 className="mt-2">
                                            Total Tests: <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 
                                             font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">
                                                {category.total}</span>

                                        </h4>
                                        <Link to={`/prepare/${category._id}`}
                                            className="flex my-3 float-right items-center gap-2 px-6 py-3
                                        bg-black   text-white font-bold rounded-lg shadow-lg  transform hover:scale-105 transition-all duration-500 ease-in-out"
                                        >
                                            <FaBook className="text-xl" />
                                            <span>Prepare</span>
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                    </div>
                </div>
            </div >
        </>
    );
}

export default Home;
