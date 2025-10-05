import express from 'express';
import cors from "cors";
import { scrapeCourses } from '../utils/scraper';
import type { Course } from '../utils/scraper';

interface FileMetadata {
    course: string;
}

const app = express();
const PORT = 3001;

// allow request from frontend
app.use(cors({
  origin: "http://localhost:3000", // your frontend URL
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "ngrok-skip-browser-warning", "x-api-key"] // include any custom headers
}));

// returns all courses
app.get('/courses', async (_req, res) => {
    try {
        const courses: Course[] = await scrapeCourses();
        res.json(courses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error scraping courses' });
    }
});





// user will fill out form
/*

    So basically for the post request it will make 
    File name (string)
    Description (string)
    export type Course = {
        department: string | null; // CSE
        code: string | null; // 1325
        course_name: string | null; // Object oriented 
    }

*/
// set up endpoint for post request

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
