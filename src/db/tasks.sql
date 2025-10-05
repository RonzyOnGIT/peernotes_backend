-- This file sets up the database tables for the notes sharing project

-- Create tables.
CREATE TABLE courses
(
    id SERIAL PRIMARY KEY,
    department VARCHAR(10) NOT NULL,
    code VARCHAR(10) NOT NULL,
    course_name VARCHAR(500) NOT NULL
);

CREATE TABLE notes
(
    id SERIAL PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    course_id INTEGER REFERENCES courses(id),
    created_at TIMESTAMPTZ DEFAULT now()
);
    