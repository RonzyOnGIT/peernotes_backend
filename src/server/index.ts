import express from 'express';
import { scrapeCourses } from '../utils/scraper';
import type { Course } from '../utils/scraper';

interface FileMetadata {
    course: string;
}

const app = express();
const PORT = 3001;

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




// set up endpoint for post request

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
