import http from 'k6/http';
import { check, sleep } from 'k6';

// Ganti token ini pakai hasil login kamu
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6ImFsd2FuIGlicmFoaW0iLCJlbWFpbCI6ImFsd2FuaWJyYWhpbTE0MkBnbWFpbC5jb20iLCJzZXNzaW9uS2V5Ijo4LCJleHAiOjE3NjA3NzUzNDEsImlhdCI6MTc2MDE3MDU0MX0.GctYILN_0caW5ixTrOre84tS1EMxe4HV_Wv2CmgOt78';

const BASE_URL = 'http://localhost:3001';

export const options = {
    stages: [
        { duration: '5s', target: 10 },  // warmup 10 user
        { duration: '10s', target: 50 }, // stress 50 user
        { duration: '5s', target: 0 },   // cooldown
    ],
};

export default function () {
    const headers = {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
    };

    // GET semua produk
    const res = http.get(`${BASE_URL}/products`, { headers });

    check(res, {
        'status 200': (r) => r.status === 200,
        'respon cepat (<200ms)': (r) => r.timings.duration < 200,
    });

    sleep(1); // biar user simulasi gak brutal terus
}
