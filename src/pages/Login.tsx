import React, { useEffect, useState } from "react";
import EyeToggleSVG from "../components/Eye";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from '../config/axiosConfig'; // Import the configured Axios instance
import toast from 'react-hot-toast';
import Cookie from "universal-cookie";
import Navbar from "../components/Navbar";
import GoogleBox from "../components/GoogleBox";
type event = React.ChangeEvent<HTMLInputElement>;

interface Prop {
    type: `user` | `admin`;
}

function Login({ type }: Prop) {
    const [email, setEmail] = useState(``);
    const [password, setPassword] = useState(``);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const cookie = new Cookie();
    useEffect(() => {
        document.title = `PCTE ${type.charAt(0).toUpperCase() + type.slice(1)} Login`;
        const token = cookie.get(`${type}_token`);
        if (token) navigate("/");
    }, []);


    const handleEmailChange = (e: event) => {
        setEmail(e.target.value);
    };
    const handlePasswordChange = (e: event) => {
        setPassword(e.target.value);
    };
    const handleShowPasswordToggle = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password.length < 8) {
            toast.error("Invalid email or password");
            return;
        }
        try {
            setIsLoading(true);
            const response = await axiosInstance.post(`/${type}/login`, {
                email,
                password
            });
            toast.success(`Logged In Successfully`);
            const token = response.data.token;
            if (token) {
                cookie.set(`${type}_token`, token, { path: `/`, expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) });
                navigate("/");
            }
        } catch (error: any) {
            const error_msg = error.response?.data?.message || "An error occurred";
            toast.error(error_msg);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <>
            <Navbar />
            <section className="min-h-screen pb-8 md:pb-0">
                <div className="flex flex-col items-center justify-center h-screen px-6 py-8 mx-auto lg:py-0">
                    <h1 className="flex items-center pt-10 mb-6 text-4xl font-semibold text-gray-900 dark:text-white">
                        PCTE {type.charAt(0).toUpperCase() + type.slice(1)}
                    </h1>

                    <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                Sign in to your account
                            </h1>
                            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6" action="#">
                                <div>
                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Your email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={email}
                                        onChange={handleEmailChange}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder="name@company.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? `text` : `password`}
                                            name="password"
                                            id="password"
                                            value={password}
                                            onChange={handlePasswordChange}
                                            placeholder="••••••••"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm leading-5 w-100"
                                        >
                                            <EyeToggleSVG handleShowPasswordToggle={handleShowPasswordToggle} />
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full dark:text-white bg-red-600 text-black focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                    disabled={isLoading}  // Disable the button during loading
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="spinner"></div>
                                        </div>) : (
                                        `Sign In`  // Default text when not loading
                                    )}
                                </button>
                                <GoogleBox setIsLoading={setIsLoading} type={type} />
                                <p className="text-sm ">
                                    <span className="text-gray-500 dark:text-gray-400">Don’t have an account yet?{` `}</span>
                                    <Link to={`/${type}/signup`} className="font-medium text-primary-600 hover:underline dark:text-primary-500">
                                        SignUp
                                    </Link>
                                </p>
                                <Link to={`/${type}/forgot`} className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">
                                    Forgot Password?{` `}
                                </Link>
                            </form>
                        </div>
                    </div>

                </div>
            </section>
        </>
    )
}

export default Login;