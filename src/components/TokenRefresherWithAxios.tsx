// TokenRefresherWithAxios.tsx — версия на axios + js-cookie
import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';

interface Tokens {
  access: string;
  refresh: string;
}

const TokenRefresherWithAxios = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Tokens | null>(null);

  const refreshToken = async () => {
    setLoading(true);
    setError(null);

    const rt = Cookies.get('refresh_token');
    if (!rt) {
      setError('Refresh token не найден в куках');
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post<Tokens>(
        'https://testhackbackend-production.up.railway.app/auth/refresh',
        { refresh_token: rt },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      Cookies.set('access_token', data.access, { sameSite: 'strict' });
      Cookies.set('refresh_token', data.refresh, { sameSite: 'strict' });
      setTokens(data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message || err.message;
        setError(msg);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return
};

export default TokenRefresherWithAxios;
