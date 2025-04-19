import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Login from "./Login";
import Register from "./Register";
import styles from "../styles/auth.module.css";
import Cookies from "js-cookie"


const API_URL = import.meta.env.VITE_API_URL;

// Типы для ответов API
interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

interface RegisterResponse {
  message: string;
}

export interface ErrorResponse {
  code: string;
  details: string;
  message: string;
}

export default function Auth() {
    const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleLogin = async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        
        try {
            const response = await axios.post<AuthResponse>(
                `${API_URL}/auth/login`, 
                { email, password },
                {
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            );
            
            Cookies.set("access_token", response.data.access_token);
            
            Cookies.set("refresh_token", response.data.refresh_token);
            
            setSuccess(true);
            
            // После успешного входа перенаправляем на /dashboard
            navigate("/dashboard");
        } catch (error) {
            console.error("Login Error:", error);
            
            if (axios.isAxiosError(error) && error.response) {
                const statusCode = error.response.status;
                const errorData = error.response.data as ErrorResponse;
                
                switch (statusCode) {
                    case 400:
                        setError(`Ошибка валидации: ${errorData.message}`);
                        break;
                    case 401:
                        setError("Неверный email или пароль");
                        break;
                    case 500:
                        setError(`Ошибка сервера: ${errorData.message}`);
                        break;
                    default:
                        setError(`Произошла ошибка: ${errorData.message}`);
                }
            } else {
                setError("Не удалось подключиться к серверу. Проверьте подключение к интернету.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (name: string, surname: string, email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        
        try {
            const response = await axios.post<RegisterResponse>(
                `${API_URL}/auth/register`, 
                { name, surname, email, password },
                {
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            );
            
            console.log("Registration Success:", response.data);
            setSuccess(true);
            
            // После регистрации переключаем на форму входа
            setIsLoginMode(true);
        } catch (error) {
            console.error("Registration Error:", error);
            
            if (axios.isAxiosError(error) && error.response) {
                const statusCode = error.response.status;
                const errorData = error.response.data as ErrorResponse;
                
                switch (statusCode) {
                    case 400:
                        if (errorData.code === "EMAIL_EXISTS") {
                            setError("Пользователь с таким email уже существует");
                        } 
                        // else {
                        //     setError(`Ошибка валидации: ${errorData.message}`);
                        // }
                        break;
                    case 500:
                        if (errorData.code === "PASSWORD_HASH_ERROR") {
                            setError("Ошибка при обработке пароля");
                        } else if (errorData.code === "DB_ERROR") {
                            setError("Ошибка базы данных");
                        } else {
                            setError(`Ошибка сервера: ${errorData.message}`);
                        }
                        break;
                    default:
                        setError(`Произошла ошибка: ${errorData.message}`);
                }
            } else {
                setError("Не удалось подключиться к серверу. Проверьте подключение к интернету.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLoginMode(!isLoginMode);
        setError(null);
        setSuccess(false);
    };

    return (
        <div className={styles.login}>
            {isLoginMode ? (
                <Login 
                    onSubmit={handleLogin} 
                    isLoading={isLoading} 
                />
            ) : (
                <Register 
                    onSubmit={handleRegister} 
                    isLoading={isLoading} 
                />
            )}
            
            <div className={styles.toggleContainer}>
            {isLoginMode ? "Еще нет профиля?" : "Уже есть профиль?"}
                <button
                    onClick={toggleMode}
                    className={styles.toggleButton}
                >
                   {isLoginMode ? "Зарегистрироваться" : "Войти"}
                </button>
            </div>
            
            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>
                {isLoginMode ? "Login successful!" : "Registration successful!"}
            </div>}
        </div>
    );
}
