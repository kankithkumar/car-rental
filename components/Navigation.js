// components/Navigation.js
import Link from 'next/link';
import styles from '../styles/Navigation.module.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; // Import useRouter

const Navigation = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userId, setUserId] = useState(null);
    const router = useRouter(); // Initialize useRouter

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user._id) {
            setIsLoggedIn(true);
            setIsAdmin(user.is_admin);
            setUserId(user._id);
        } else {
            setIsLoggedIn(false);
            setIsAdmin(false);
            setUserId(null);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUserId(null);
        router.push('/auth/login'); // Redirect to login page
    };

    // Check if the current path is /cars
    const isCarsPage = router.pathname === '/cars';

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
                        {/* Removed Dashboard link */}
                        {isCarsPage && ( // Conditionally render Logout only on the cars page
                             <li>
                                <button onClick={handleLogout} className={styles.logoutButton}>
                                    Logout
                                </button>
                            </li>
                        )}
                         {!isCarsPage && (
                            <li>
                                 {/* You can add other navigation items here that should appear when logged in but not on the cars page */}
                            </li>
                         )}
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
