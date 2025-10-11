import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:3001';
const USER = {
    email: 'alwanibrahim142@gmail.com',
    password: 'santaikawan',
};

export const options = {
    vus: 1, // cuma 1 virtual user
    iterations: 10, // total 10x login, sequential
};

export default function () {
    const payload = JSON.stringify(USER);
    const headers = { 'Content-Type': 'application/json' };

    const res = http.post(`${BASE_URL}/auth/login`, payload, { headers });

    check(res, {
        'status 200': (r) => r.status === 200,
        'ada token di response': (r) => {
            try {
                const json = r.json();
                return json?.data?.token || json?.token;
            } catch {
                return false;
            }
        },
        'respon cepat (<300ms)': (r) => r.timings.duration < 300,
    });

    console.log(`Durasi: ${res.timings.duration.toFixed(2)} ms`);
    sleep(1);
}
