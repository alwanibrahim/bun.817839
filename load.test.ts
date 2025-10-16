import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://152.42.183.191:3001/api/products';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwibmFtZSI6Im1pbWluIiwiZW1haWwiOiJtYW1hbW5AZ21haWwuY29tIiwic2Vzc2lvbktleSI6MywiZXhwIjoxNzYxMjA5MzA2LCJpYXQiOjE3NjA2MDQ1MDZ9.EB2OweSZBVAXJVEDL4hh74I0Je8RrfyIIiNpg0idzM4';

export const options = {
    // RAMPING bertahap: pemanasan -> puncak -> tahan -> turunkan
    stages: [
        { duration: '15s', target: 20 },    // warmup
        { duration: '30s', target: 100 },   // naik
        { duration: '30s', target: 300 },   // beban menengah
        { duration: '30s', target: 600 },   // beban berat
        { duration: '30s', target: 1000 },  // puncak "ganas"
        { duration: '60s', target: 1000 },  // tahan puncak 60s
        { duration: '30s', target: 200 },   // cooldown
        { duration: '30s', target: 0 },     // selesai
    ],

    thresholds: {
        // kalau error rate > 5% atau p95 > 2s => anggap overload
        http_req_failed: ['rate<0.05'],
        http_req_duration: ['p(95)<2000'],
    },

    // Optional: limit VU per instance jika run terdistribusi
    // discardResponseBodies: true,
};

export default function () {
    const headers = {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
    };

    const res = http.get(BASE_URL, { headers, timeout: '60s' });

    // cek singkat: status dan ada data
    check(res, {
        'status 200': (r) => r.status === 200,
        'has data': (r) => {
            try {
                const j = r.json();
                return j && (Array.isArray(j.data) ? j.data.length >= 0 : Object.keys(j).length > 0);
            } catch (e) {
                return false;
            }
        },
    });

    // logging ringan (hilangkan di produksi untuk performa)
    if (__VU === 1 && __ITER % 10 === 0) {
        console.log(`VU:${__VU} ITER:${__ITER} status:${res.status} time:${res.timings.duration}`);
    }

    sleep(0.5); // kecilkan atau naikkan sesuai realisme
}
