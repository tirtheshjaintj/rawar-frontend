import { useEffect, useState } from "react";
import { FaBook, FaPlay } from "react-icons/fa"; // React Icon for play button
import { motion } from "framer-motion"; // For animations
import { Link, useNavigate } from "react-router-dom"; // To navigate to quiz page
import axiosInstance from "../config/axiosConfig";
import Chatbot from "../components/ChatBot";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";

// Define the type for a category
interface Category {
    _id: string;
    name: string;
    image: string;
}

function Home() {
    const [categories, setCategories] = useState<Category[]>([]);
    const navigate = useNavigate(); // To navigate to the quiz page
    const user = useSelector((state: any) => state.user);

    useEffect(() => {
        // Fetch categories when the component is mounted
        const fetchCategories = async () => {
            try {
                const response = await axiosInstance.get("/category");
                if (response.data.status) {
                    setCategories(response.data.data); // Set categories in state
                } else {
                    console.error("Failed to fetch categories");
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
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

                    <div className="grid grid-cols-1 gap-12 mt-12 sm:grid-cols-2 lg:grid-cols-3">
                        {categories.map((category) => (
                            <motion.div
                                key={category._id}
                                className="relative overflow-hidden transition-transform duration-500 shadow-lg cursor-pointer rounded-xl hover:shadow-2xl"
                                whileHover={{ scale: 1.05 }}
                            >
                                {/* Animated Image */}
                                <div className="relative"
                                    onClick={() => handleClick(category._id)}
                                >
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="object-cover w-full h-52 rounded-t-xl"
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
                                    <Link to={`/prepare/${category._id}`}
                                        className="flex my-3 float-right items-center gap-2 px-6 py-3 
                                       bg-black   text-white font-bold rounded-lg shadow-lg  transform hover:scale-105 transition-all duration-500 ease-in-out"
                                    >
                                        <FaBook className="text-xl" />
                                        <span>Prepare</span>
                                    </Link>                                </div>
                                {/* Optional Glow effect on hover */}
                                <div className="absolute inset-0 opacity-0 pointer-events-none rounded-xl hover:opacity-10"></div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </>

    );
}

export default Home;
