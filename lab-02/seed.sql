CREATE TABLE book (
  id INTEGER PRIMARY KEY,
  title TEXT,
  author TEXT,
  price INTEGER,
  pages INTEGER
);

INSERT INTO book (title, author, price, pages) VALUES
  ('Designing Data-Intensive Applications', 'Martin Kleppmann', 750, 616),
  ('JavaScript: The Definitive Guide', 'David Flanagan', 680, 704),
  ('Node.js Design Patterns', 'Mario Casciaro', 599, 664),
  ('Database Internals', 'Alex Petrov', 620, 370),
  ('You Don''t Know JS: Scope & Closures', 'Kyle Simpson', 320, 98),
  ('Site Reliability Engineering', 'Betsy Beyer', 799, 550),
  ('Learning SQL', 'Alan Beaulieu', 450, 380),
  ('Building Microservices', 'Sam Newman', 640, 612),
  ('Refactoring', 'Martin Fowler', 850, 448),
  ('Pragmatic Programmer', 'Andrew Hunt', 580, 352);
