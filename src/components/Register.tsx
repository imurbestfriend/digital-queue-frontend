import { useState } from "react";
import styles from "../styles/login.module.css";

interface RegisterProps {
    onSubmit: (name: string, surname: string, email: string, password: string) => void;
    isLoading: boolean;
}

export default function Register({ onSubmit, isLoading }: RegisterProps) {
    const [name, setName] = useState<string>("");
    const [surname, setSurname] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleSubmit = () => {
        onSubmit(name, surname, email, password);
    };

    return (
        <div className={styles.loginBlock}>
            <input
                className={styles.inputField}
                type="text"
                value={name}
                placeholder="Name"
                onChange={(e) => setName(e.target.value)}
            />
            <input
                className={styles.inputField}
                type="text"
                value={surname}
                placeholder="Surname"
                onChange={(e) => setSurname(e.target.value)}
            />
            <input
                className={styles.inputField}
                type="text"
                value={email}
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                className={styles.inputField}
                type="password"
                value={password}
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
            />
            <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={styles.submitButton}
            >
                {isLoading ? "Processing..." : "Register"}
            </button>
        </div>
    );
}
