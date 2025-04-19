import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import styles from "../styles/grouplist.module.css";
import { Link } from "react-router-dom";
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

interface Group {
  id: string;
  number: string;
  name: string;  
}

interface GroupResponse {
  items: Group[];
  limit: number;
  offset: number;
  total: number;
}

export default function GroupList() {
    const API_URL = import.meta.env.VITE_API_URL;
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState<string>(''); 
    const navigate = useNavigate();

    const getGroups = async () => {
        try {
            setLoading(true);
            const response = await axios.get<GroupResponse>(`${API_URL}/groups`);
            setGroups(response.data.items);
            setError(null);
        } catch (err) {
            console.error('Error fetching groups:', err);
            setError('Failed to fetch groups');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getGroups();
    }, []);

    const filteredGroups = groups
        .filter(group => 
            group.number.toLowerCase().includes(search.toLowerCase()) || 
            group.name.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => a.number.localeCompare(b.number));
    //Разбие групп по номеру    
    const grouped = filteredGroups.reduce((acc, group) => {
        const firstChar = group.number[0];
        if (['1', '2', '3', '4', '5', '6'].includes(firstChar)) {
            if (!acc[firstChar]) {
                acc[firstChar] = [];
            }
            acc[firstChar].push(group);
        }
        return acc;
    }, {} as Record<string, Group[]>);

    const handleClick = (id: string, number: string) => { 
        Cookies.set("group_id", id);
        Cookies.set("group_name", number);
        navigate(`/dashboard/schedule`); 
    };

    return (
        
        <div className={styles.container}> 
        <Link to="/Auth" className={styles.dashboardLink}>Выйти</Link>
            <h1 className={styles.header}>Добро пожаловать!</h1>
            <p className={styles.subheader}>Для просмотра расписания выберите свою группу:</p>
            
            
            {loading && 
                <Box sx={{textAlign:'center', width: '50%', margin: '20px auto' }}>
                    <CircularProgress color="inherit" />
                </Box>
            }

            {error && <p className={styles.error}>{error}</p>}
            
            {!loading && !error && groups.length === 0 && (
                <p className={styles.empty}>Группы не найдены</p>
            )}
            
            {!loading && (
                <Box
                    component="form"
                    sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: 2,
                        width: '100%',
                        margin: '20px 0'
                    }}
                    noValidate
                    autoComplete="off"
                >
                    <TextField  
                        id="search-groups"
                        label="Поиск группы"
                        variant="filled"
                        type="text"
                        value={search}
                        sx={{
                            width: '100%',
                            maxWidth: '500px',
                            '& .MuiFilledInput-root': {
                                paddingLeft: '12px',
                                paddingRight: '12px',
                                borderRadius: '8px',
                                backgroundColor: '#f5f5f5'
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
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </Box>
            )}

            <div className={styles.coursesContainer}>
                {Object.entries(grouped).map(([courseNumber, courseGroups]) => (
                    <div key={courseNumber} className={styles.courseSection}>
                        <h2 className={styles.courseTitle}>{courseNumber} курс</h2>
                        <ul className={styles.groupsGrid}>
                            {courseGroups.map((group) => (
                                <li 
                                    key={group.id} 
                                    className={styles.groupCard} 
                                    onClick={() => handleClick(group.id, group.number)}
                                >
                                    <span className={styles.groupNumber}>{group.number}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>        
    );
}