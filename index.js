const express = require('express');
const cors = require('cors');
require('dotenv').config();
const Groq = require('groq-sdk');

const app = express();
app.use(express.json());
app.use(cors());

const OFFICIAL_EMAIL = process.env.EMAIL || "jiya0704.be23@chitkara.edu.in";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const getFibonacci = (n) => {
    if (n <= 0) return [];
    let series = [0];
    if (n === 1) return series;
    series.push(1);
    for (let i = 2; i < n; i++) {
        series.push(series[i - 1] + series[i - 2]);
    }
    return series;
};

const isPrime = (num) => {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const findHCF = (arr) => arr.reduce((acc, val) => gcd(acc, val));
const findLCM = (arr) => arr.reduce((acc, val) => (acc * val) / gcd(acc, val));

app.get("/", (req, res) => {
    res.status(200).json({
        is_success: true,
        message: "Bajaj Health Challenge API is running 🚀",
        official_email: OFFICIAL_EMAIL
    });
});


app.get('/health', (req, res) => {
    res.status(200).json({ is_success: true, official_email: OFFICIAL_EMAIL });
});

app.post('/bfhl', async (req, res) => {
    try {
        const keys = Object.keys(req.body);
        if (keys.length !== 1) {
            return res.status(400).json({ is_success: false, message: "Provide exactly one functional key." });
        }

        const key = keys[0];
        const value = req.body[key];
        let resultData;

        switch (key) {
            case 'fibonacci':
                if (!Number.isInteger(value) || value < 0) throw new Error("Invalid input");
                resultData = getFibonacci(value);
                break;

            case 'prime':
                if (!Array.isArray(value)) throw new Error("Invalid input");
                resultData = value.filter(n => typeof n === 'number' && isPrime(n));
                break;

            case 'lcm':
                if (!Array.isArray(value) || value.length === 0) throw new Error("Invalid input");
                resultData = findLCM(value);
                break;

            case 'hcf':
                if (!Array.isArray(value) || value.length === 0) throw new Error("Invalid input");
                resultData = findHCF(value);
                break;

            case 'AI':
                if (typeof value !== 'string') throw new Error("Invalid input");
                
                try {
                    const chatCompletion = await groq.chat.completions.create({
                        messages: [
                            {
                                role: "user",
                                content: `Answer the following question in strictly one single word: ${value}`,
                            },
                        ],
                        model: "llama-3.3-70b-versatile",
                    });

                    const text = chatCompletion.choices[0]?.message?.content || "";
                    resultData = text.trim().replace(/[^\w\s]/gi, ''); 
                } catch (aiErr) {
                    throw new Error("Groq AI failed: " + aiErr.message);
                }
                break;

            default:
                return res.status(400).json({ is_success: false, message: "Invalid key." });
        }

        res.status(200).json({
            is_success: true,
            official_email: OFFICIAL_EMAIL,
            data: resultData
        });

    } catch (error) {
        res.status(400).json({
            is_success: false,
            official_email: OFFICIAL_EMAIL,
            message: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));