import { useState, useEffect } from "react";
import { Avatar, Dropdown, Navbar } from "flowbite-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import { addUser } from "../store/userSlice";
import toast from "react-hot-toast";
let deferredPrompt: any = null;

export default function Nav() {
    const navigate = useNavigate();
    const cookie = new Cookies();
    const dispatch = useDispatch();
    const user = useSelector((state: any) => state.user);
    const [isInstallable, setIsInstallable] = useState(false);

    const signOut = () => {
        cookie.remove('user_token', { path: '/' });
        navigate("/user/login");
        dispatch(addUser(null));
    };

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            deferredPrompt = e;
            setIsInstallable(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const install = async () => {
        if (deferredPrompt) {
            try {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === "accepted") {
                    console.log("User accepted the install prompt");
                    deferredPrompt = null;
                    setIsInstallable(false);
                } else {
                    console.log("User dismissed the install prompt");
                }
            } catch (err) {
                console.error("Failed to install the app", err);
                toast.error("Failed to install the app");
            }
        }
    };

    return (
        <>
            <Navbar className="bg-white/50 fixed w-[100vw] lg:w-[90vw] z-10 dark:bg-gray-900/50 backdrop-blur-3xl">
                <Link to="/" className="flex flex-grow" onClick={isInstallable ? install : undefined}>
                    <img src="/pcte.jpeg" className="h-12 mr-3" alt="PCTE Placement Preparation" />
                    <h1 className="self-center text-2xl font-semibold cursor-pointer whitespace-nowrap dark:text-white">
                        PCTE&nbsp;
                    </h1>
                </Link>

                <div className="flex justify-end flex-grow md:order-2 ">
                    <Dropdown
                        arrowIcon={false}
                        inline
                        label={<Avatar alt={`${user?.name}`} img="" rounded />}
                    >
                        {user ? (
                            <>
                                <Dropdown.Header>
                                    <span className="block text-sm">{`${user?.name}`}</span>
                                    <span className="block text-sm font-medium truncate">{`${user?.email}`}</span>
                                </Dropdown.Header>
                                <Link to={"../user/dashboard"}>
                                    <Dropdown.Item>
                                        Dashboard
                                    </Dropdown.Item>
                                </Link>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={signOut}>Sign out</Dropdown.Item>
                            </>
                        ) : (
                            <>
                                <Link to={"../user/dashboard"}>
                                    <Dropdown.Item>
                                        Become User
                                    </Dropdown.Item>
                                </Link>
                            </>
                        )}
                    </Dropdown>
                </div>
            </Navbar>
        </>
    );
}
