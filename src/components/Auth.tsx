import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Login from "./Login";
import Register from "./Register";
import styles from "../styles/auth.module.css";
import Cookies from "js-cookie"
import { Link } from "react-router-dom";



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
            
            // После успешного входа перенаправляем на /grouplist
            navigate("/dashboard/grouplist");
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
            
            console.log("Успешная регистрация:", response.data);
            setSuccess(true);
            
            // После регистрации переключаем на форму входа
            setIsLoginMode(true);
        } catch (error) {
            console.error("Ошибка регистрации:", error);
            
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
        <div className={styles.mainContainer}>
            <Link className={styles.backLink} to="/"><svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.6258 0.264508C9.03201 0.638696 9.05796 1.27133 8.68377 1.67753L3.78081 7.00001H18.5C19.0523 7.00001 19.5 7.44772 19.5 8.00001C19.5 8.55229 19.0523 9.00001 18.5 9.00001H3.78081L8.68377 14.3225C9.05796 14.7287 9.03201 15.3613 8.6258 15.7355C8.2196 16.1097 7.58697 16.0837 7.21278 15.6775L0.764502 8.67753C0.411833 8.29469 0.411833 7.70532 0.764502 7.32248L7.21278 0.322478C7.58697 -0.0837261 8.2196 -0.10968 8.6258 0.264508Z" fill="#00004B"/>
</svg>
Назад</Link>
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
                {isLoginMode ? "Успешный логин!" : "Успешная регистрация!"}
            </div>}
        </div>
        </div>
    );
}
