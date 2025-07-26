// pages/admin/users.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../../styles/AdminUsers.module.css';
import Navigation from '../../components/Navigation';
// You might want to add a link to add a new user later

export default function AdminUsers() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in and is an admin
    const loggedInUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null;

    if (!loggedInUser || !loggedInUser.is_admin) {
      // If not logged in or not an admin, redirect to home page
      router.push('/');
      return;
    }

    setUser(loggedInUser);

    // Fetch all users
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/users`);
        if (!res.ok) {
           if (res.status === 404) {
                setUsers([]); // No users found
           } else {
               throw new Error(`Failed to fetch users: ${res.status}`);
           }
        } else {
            const data = await res.json();
            setUsers(data.users);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users in AdminUsers:", error);
        setError('Failed to load users. Please try again.');
        setLoading(false);
      }
    };

    fetchUsers();
  }, [router]);


   const handleDeleteUser = async (userId) => {
       if (window.confirm('Are you sure you want to delete this user?')) {
           try {
               const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/users/${userId}`, {
                   method: 'DELETE',
                   headers: {
                       // Add authentication header here in a real app
                   },
               });

               const data = await res.json();

               if (res.ok) {
                   // Remove the deleted user from the local state
                   setUsers(users.filter(user => user._id !== userId));
                   console.log(data.message); // Log success message
                   // Optionally show a success message to the user
               } else {
                    setError(data.message || 'Failed to delete user.');
               }
           } catch (error) {
               console.error("Error deleting user:", error);
               setError('An unexpected error occurred while deleting the user.');
           }
       }
   };


  if (loading) {
    return (
      <div className={styles.container}>
        <Navigation />
        <main className={styles.main}>
          <p>Loading users...</p>
        </main>
      </div>
    );
  }

   if (error) {
       return (
           <div className={styles.container}>
               <Navigation />
               <main className={styles.main}>
                   <p className={styles.error}>{error}</p>
               </main>
           </div>
       );
   }


  return (
    <div className={styles.container}>
      <Head>
        <title>Manage Users - Admin - Car Rental App</title>
        <meta name="description" content="Admin panel for managing user accounts" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navigation /> {/* Include the Navigation component */}

      <main className={styles.main}>
        <h1 className={styles.title}>Manage Users</h1>

        {/* Add action buttons if needed (e.g., Add New User) */}

        <div className={styles.userList}>
          {users.length > 0 ? (
            <table className={styles.userTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Address</th>
                  <th>Admin</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone_number}</td>
                    <td>{user.address}</td>
                    <td>{user.is_admin ? 'Yes' : 'No'}</td>
                    <td>
                       {/* <Link href={`/admin/users/edit/${user._id}`} className={styles.actionButton}>
                           Edit
                       </Link> */}
                       {/* Make the Delete button functional */}
                       <button onClick={() => handleDeleteUser(user._id)} className={`${styles.actionButton} ${styles.deleteButton}`}>
                           Delete
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No users found in the system.</p>
          )}
        </div>
      </main>

      {/* Optional Footer */}
    </div>
  );
}
