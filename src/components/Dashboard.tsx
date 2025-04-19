import { Link } from "react-router-dom";
import styles from "../styles/dashboard.module.css";
import Header from "./HeaderComp";

export default function Dashboard() {
    return (
        <div>
            <h1>Welcome to Dashboard!</h1>
            <Header />
            <div className={styles.blockling}>
                <Link to="/Auth" >Назад к регистрации</Link>
                <Link to="/dashboard/grouplist">Список групп</Link>
            </div>
        </div>
    );
}

