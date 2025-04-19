import { Link } from "react-router-dom";
import styles from "../styles/dashboard.module.css";
import Header from "./HeaderComp";

export default function Dashboard() {
    return (
        <div>
            <h1>Welcome to Dashboard!</h1>
            <Header />
            <div className={styles.blockling}>
                <Link to="/" >Back to Login</Link>
                <Link to="/dashboard/grouplist">Group List</Link>
            </div>
        </div>
    );
}





// import { Link } from "react-router-dom";
// // import styles from "../styles/dashboard.module.css"; // Создайте соответствующий CSS-файл
//
// export default function Dashboard() {
//     return (
//         <div className={styles.dashboard}>
//             <h1>Welcome to Dashboard!</h1>
//             <p>This is a protected page visible only after successful login.</p>
//             <Link to="/" className={styles.backLink}>← Back to Login</Link>
//         </div>
//     );
// }