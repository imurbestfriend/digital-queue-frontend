import { useState, useRef, KeyboardEvent } from "react";
import styles from "../styles/login.module.css";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

interface LoginProps {
    onSubmit: (email: string, password: string) => void;
    isLoading: boolean;
}

export default function Login({ onSubmit, isLoading }: LoginProps) {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const emailInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const submitButtonRef = useRef<HTMLButtonElement>(null);

    const handleSubmit = () => {
        onSubmit(email, password);
    };

    const handleEmailKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            passwordInputRef.current?.focus();
        }
    };

    const handlePasswordKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className={styles.loginBlock}>
            <div className={styles.logo}>
            <svg width="144" height="144" viewBox="0 0 144 144" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_4_420)">
                    <mask id="mask0_4_420" className="mask-type:luminance" maskUnits="userSpaceOnUse" x="-156" y="-103" width="1330" height="1879">
                    <path d="M-155.163 1775.44H1173.21V-102.14H-155.163V1775.44Z" fill="white"/>
                    </mask>
                    <g mask="url(#mask0_4_420)">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M120.424 24.2233H120.558C112.384 16.0542 102.266 10.0999 91.1554 6.92093C84.9949 5.09977 78.6027 4.1823 72.1786 4.19721C54.0426 4.25016 36.6638 11.4751 23.8355 24.2951C11.0071 37.1151 3.77083 54.4891 3.70605 72.6251C3.77077 90.7534 11.0009 108.121 23.8196 120.939C36.6383 133.758 54.0057 140.988 72.134 141.053C90.2623 140.988 107.63 133.758 120.448 120.939C133.267 108.121 140.497 90.7534 140.562 72.6251C140.562 53.76 132.748 36.7033 120.402 24.2233" fill="white"/>
                    <path d="M120.424 24.2233H120.558C112.384 16.0542 102.266 10.0999 91.1554 6.92093C84.9949 5.09977 78.6027 4.1823 72.1786 4.19721C54.0426 4.25016 36.6638 11.4751 23.8355 24.2951C11.0071 37.1151 3.77083 54.4891 3.70605 72.6251C3.77077 90.7534 11.0009 108.121 23.8196 120.939C36.6383 133.758 54.0057 140.988 72.134 141.053C90.2623 140.988 107.63 133.758 120.448 120.939C133.267 108.121 140.497 90.7534 140.562 72.6251C140.562 53.76 132.748 36.7033 120.402 24.2233H120.424Z" stroke="#00004B" stroke-width="1.53333"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M120.29 24.7367C107.467 11.9242 90.0822 4.72712 71.9553 4.72712C53.8285 4.72712 36.4432 11.9242 23.6205 24.7367C10.808 37.5595 3.61084 54.9448 3.61084 73.0716C3.61084 91.1985 10.808 108.584 23.6205 121.407L120.29 24.7367Z" fill="#00004B"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M15.4494 60.3907H18.0391V54.9209H19.334L18.8205 52.7107H21.6782L21.1647 54.9433H22.4596V60.3907H25.2056V70.4149H44.0708V55.1888C43.9368 54.9209 43.8028 54.5191 43.6689 54.2735L43.9368 54.1395V53.76H44.2047V53.4921H45.9908C45.9908 53.3581 45.8791 53.3581 45.8791 53.2242H46.147V52.9786H46.3926V52.7107H47.0624V52.0633H46.7945V51.2819H47.0624V51.014H47.308C47.308 50.6344 47.308 50.2326 47.4419 49.853H47.9554C48.2233 49.0716 47.9554 48.2902 47.7098 47.7767C48.0894 47.7767 48.2233 47.7767 48.3573 48.1563C48.6029 48.0223 48.6029 48.0223 49.0047 48.0223C49.0047 48.6921 48.8708 49.2056 49.0047 49.853H49.2726V51.014H49.7861V42.0391H49.9201V41.7712H50.1656C50.2996 40.8781 50.054 39.5609 50.947 39.5609L51.2149 38.8019C51.4829 38.6679 51.8847 38.534 52.108 38.4V38.534L52.2642 38.4V35.0512C52.1303 35.0512 51.9963 35.1628 51.8624 35.1628V33.6C52.5322 32.9526 52.6438 31.6577 53.1573 31.3898C53.1573 31.0102 53.0456 30.4967 53.0456 30.3628C53.0456 30.3628 53.1573 30.3628 53.1573 30.2288V29.7153C53.5591 29.4474 53.961 29.1795 54.4745 28.934C54.4745 28.8 54.4745 28.8 54.0726 26.9693L54.7424 26.3219L55.2559 17.347H55.1219V16.8335H55.3898V16.0521C53.827 15.5163 53.4252 13.9758 54.4745 12.9265L54.854 13.44C54.3405 14.3553 54.3405 14.8688 55.3898 15.2707L55.5015 14.8688L54.988 14.3553L55.1219 13.6856L55.6354 12.7926C55.7694 13.1944 56.0373 13.306 56.1489 13.6856L56.4168 14.2214L55.9033 14.8912V15.2707C57.0642 14.6009 56.5508 13.9758 56.4168 13.306C56.4168 13.1944 56.5508 12.9265 56.6847 12.7926C57.7117 13.9758 57.4661 15.6502 56.0149 16.0521V16.8335H56.2828L56.4168 17.347H56.1712C56.4168 20.4726 56.5508 23.3302 56.5508 26.4558C56.8187 26.5898 56.8187 26.5898 57.2205 26.9693C57.0642 27.5051 56.8187 28.3981 56.8187 28.934L57.9796 29.7153C57.8456 29.827 57.8456 29.9609 57.8456 30.0949L58.2475 30.3628C58.1135 30.7423 57.9796 31.0102 57.9796 31.3898C58.6494 31.6577 58.8726 33.0865 59.5424 33.6223C59.4084 34.1358 59.5424 34.6493 59.5424 35.1851C59.2745 35.0512 59.2745 35.0512 59.1628 35.0512V38.5563C59.5424 38.5563 59.6763 38.6902 60.0559 38.8242C60.1898 40.9005 59.9442 39.5833 60.7256 39.5833C61.1052 39.8512 61.1052 41.28 61.1052 41.8158H61.3508V42.0614H61.6187V51.0363H61.7526V49.8754H62.2661C62.4001 48.9823 62.4001 48.4465 62.1322 47.7991C62.4001 47.7991 62.668 47.7991 62.668 48.1786C62.9359 48.0447 62.9359 48.0447 63.3154 48.0447C63.3154 48.5805 63.3154 49.2279 63.4494 49.8754H63.6949V51.0363H64.0968V51.3042H64.2308V52.0856H64.0968V52.7553H64.6103V52.9786H64.8782V53.2465H65.2577V53.5144H66.7089V53.7823H66.9545V54.1619H67.0884C67.0884 54.5637 66.8205 55.0549 66.7089 55.4567V70.4149H72.5582V93.8568H10.3591V70.4149H15.4494V60.3907Z" fill="white"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M40.4094 61.8195H67.7359V52.1972H101.046V61.7972H126.809V109.172H101.046V119.062H67.7359V109.172H40.4094V61.8195Z" fill="white"/>
                    <path d="M40.4094 61.8195H67.7359V52.1972H101.046V61.8195H126.809V109.172H101.046V119.062H67.7359V109.172H40.4094V61.8195Z" stroke="#00004B" stroke-width="0.92"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M43.2894 64.6772H70.5936V55.0549H98.2996V64.6772H124.063V106.426H98.2996V116.339H70.6159V106.448H43.2671L43.2894 64.6772Z" fill="#00004B"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M108.056 77.827V94.08H98.1879V79.1219L108.056 77.827ZM108.056 69.6335H49.4065L70.2139 101.492V78.0726L108.056 73.3842V69.6335ZM98.1879 96.4242H108.056V101.492H98.1879V96.4242ZM108.056 73.4065V69.6112H117.834V72.2233L108.056 73.4065ZM108.056 94.08V77.827L117.834 76.3982V94.08H108.056ZM108.056 96.4242H117.834V101.492H108.056V96.4242Z" fill="white"/>
                    </g>
                    </g>
                    <defs>
                    <clipPath id="clip0_4_420">
                    <rect width="144" height="144" fill="white"/>
                    </clipPath>
                    </defs>
                </svg>
            </div>
            
            <Box
                component="form"
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: 2 
                }}
                noValidate
                autoComplete="off"
            >
                <TextField
                    id="email-input"
                    label="Email"
                    variant="filled"
                    className={styles.inputField}
                    type="email"
                    value={email}
                    inputRef={emailInputRef}
                    onKeyDown={handleEmailKeyDown}
                    sx={{
                        width: '400px',
                        marginBottom: '10px',
                        '& .MuiFilledInput-root': {
                            paddingLeft: '12px',
                            paddingRight: '12px',
                        },
                        '& .MuiInputBase-input': {
                            width: '100%',
                        },
                        '& .MuiFilledInput-underline:before': {
                            borderBottomColor: '#00004B',
                        },
                        '& .MuiFilledInput-underline:after': {
                            borderBottomColor: '#00004B',
                        },
                        '& .Mui-focused': {
                            color: '#00004B',
                        }
                    }}
                    onChange={(e) => setEmail(e.target.value)}
                />
                
                <TextField
                    id="password-input"
                    label="Password"
                    variant="filled"
                    className={styles.inputField}
                    type="password"
                    value={password}
                    inputRef={passwordInputRef}
                    onKeyDown={handlePasswordKeyDown}
                    sx={{
                        width: '400px',
                        marginBottom: '20px',
                        '& .MuiFilledInput-root': {
                            paddingLeft: '12px',
                            paddingRight: '12px',
                        },
                        '& .MuiInputBase-input': {
                            width: '100%',
                        },
                        '& .MuiFilledInput-underline:before': {
                            borderBottomColor: '#00004B',
                        },
                        '& .MuiFilledInput-underline:after': {
                            borderBottomColor: '#00004B',
                        },
                        '& .Mui-focused': {
                            color: '#00004B',
                        }
                    }}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </Box>
            
            <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={isLoading ? styles.loginBtnBlock : styles.loginBtn}
                ref={submitButtonRef}
            >
                Войти
            </button>
        </div>
    );
}