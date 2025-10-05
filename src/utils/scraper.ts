//scraper.ts
import puppeteer from 'puppeteer';
import { connectDB, disconnectDB } from '../db/db.js';
import mongoose from 'mongoose';

export type Course = {
    department: string | null; // CSE
    code: string | null; // 1325
    course_name: string | null; // Object oriented 
}

// MongoDB Schema
const courseSchema = new mongoose.Schema<Course>({
    department: String,
    code: String,
    course_name: String,
});
  
const CourseModel = mongoose.model<Course>('Course', courseSchema);

// // returns array of strings like ["Accounting (ACCT)", ""]
// async function scrapeDepartments() {

//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();
//     await page.goto('https://catalog.uta.edu/coursedescriptions/');

//     const selector: string = '#content-container .wrap #col-content #contentarea #textcontainer .sitemap ul li';
    
//     const limit: number = 3;

//     const items: string[] = await page.$$eval(selector, (elements: Element[]) =>
//         elements.map(element => element.textContent?.trim() || '')
//     );

//     await browser.close();
//     return items;

// }

// only returns first 2 departments for now
async function scrapeDepartments() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://catalog.uta.edu/coursedescriptions/');

    const selector: string = '#content-container .wrap #col-content #contentarea #textcontainer .sitemap ul li';
    const limit: number = 2; // only take first 2 departments

    const items: string[] = await page.$$eval(selector, (elements: Element[], limit: number) => 
        Array.from(elements)           // convert NodeList to array
             .slice(0, limit)         // take only first `limit` items
             .map(el => el.textContent?.trim() || '')
    , limit); // pass limit as second argument to $$eval

    await browser.close();
    return items;
}

async function scrapeCoursesForDepartment(dep: string): Promise<string[]> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(`https://catalog.uta.edu/coursedescriptions/${dep}`, {
        waitUntil: "domcontentloaded",
    });

    const selector = "#content-container .wrap #col-content #contentarea #courseinventorycontainer .courses .courseblock .courseblocktitle strong";

    // return an array of text from all <strong> elements
    const courses: string[] = await page.$$eval(selector, (elements: Element[]) =>
        Array.from(elements).map(el => el.textContent?.trim() || "")
    );

    await browser.close();
    return courses; // now you can console.log outside
}

function parseCourse(courseStr: string): Course {

    // Tokenize DEPT CODE. COURSE NAME. anything else
    const regex = /^([A-Z]+)\s+(\d+)\.\s+(.+?)\./;
    const match = courseStr.match(regex);

    if (!match) {
        return { department: null, code: null, course_name: null };
    }

    const [, department, code, course_name] = match;

    return { department, code, course_name };
}

// need another function to return
export async function scrapeCourses(): Promise<Course[]> {

    const allCourses: Course[] = [];

    try {
        const scrapedDepartments = await scrapeDepartments();

        for (const department of scrapedDepartments) {
            const code = department.split('(')[1].split(')')[0].toLowerCase();

            const courses = await scrapeCoursesForDepartment(code);
            const coursesTrimmed = courses.map(courseStr => parseCourse(courseStr));

            allCourses.push(...coursesTrimmed);
        }
        console.log(allCourses);

        return allCourses; // <--- THIS RETURNS THE ARRAY
    } catch (e) {
        console.error('Scraping error:', e);
        return []; // return empty array on error
    }
}

// --- Main script to run scraper and save to MongoDB ---
async function main() {
    await connectDB();
  
    const courses = await scrapeCourses();
  
    // Insert courses to MongoDB (avoid duplicates if needed)
    for (const course of courses) {
      if (course.department && course.code && course.course_name) {
        try {
          await CourseModel.create(course);
          console.log(`Inserted: ${course.department} ${course.code}`);
        } catch (err) {
          console.error(`Failed to insert ${course.department} ${course.code}:`, err);
        }
      }
    }
  
    await disconnectDB();
  }
  
  main();


