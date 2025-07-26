// components/Navigation.js
import Link from 'next/link';
import styles from '../styles/Navigation.module.css'; // We'll create this CSS module next
import { useState, useEffect } from 'react'; // To handle login state and potentially user info

const Navigation = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userId, setUserId] = useState(null); // To store user ID if needed for dashboard link

    // In a real application, you would check for a valid JWT or session cookie here
    // For this example, we'll simulate login state.
    useEffect(() => {
        // Simulate checking for login status (replace with actual authentication check)
        const user = JSON.parse(localStorage.getItem('user')); // Example: Check local storage
        if (user && user._id) {
            setIsLoggedIn(true);
            setIsAdmin(user.is_admin);
            setUserId(user._id);
        } else {
            setIsLoggedIn(false);
            setIsAdmin(false);
            setUserId(null);
        }
    }, []); // Run this effect only once on component mount

    const handleLogout = () => {
        // Simulate logout (replace with actual logout logic)
        localStorage.removeItem('user'); // Example: Remove from local storage
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUserId(null);
        // Redirect to home page or login page after logout
        window.location.href = '/'; // Simple redirect for demonstration
    };


    return (
        <nav className={styles.navigation}>
            <div className={styles.logo}>
                <Link href="/">
                    Car Rental
                </Link>
            </div>
            <ul className={styles.navList}>
                <li>
                    <Link href="/">
                        Home
                    </Link>
                </li>
                <li>
                    <Link href="/cars">
                        Cars
                    </Link>
                </li>
                <li>
                     <Link href="/feedback">
                        Feedback
                     </Link>
                </li>
                {isLoggedIn ? (
                    <>
                        <li>
                            <Link href={isAdmin ? "/admin/dashboard" : "/dashboard"}>
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <button onClick={handleLogout} className={styles.logoutButton}>
                                Logout
                            </button>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <Link href="/auth/login">
                                Login
                            </Link>
                        </li>
                        <li>
                            <Link href="/auth/register">
                                Register
                            </Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navigation;
