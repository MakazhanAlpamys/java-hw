-- Full init for PostgreSQL: schema + seed + mapping + view

-- 1) Base facts table (kept as-is per original seed)
CREATE TABLE IF NOT EXISTS facts (
    id SERIAL PRIMARY KEY,
    fact TEXT NOT NULL
);

-- 2) Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- 3) Add category relation to facts
ALTER TABLE facts
ADD COLUMN IF NOT EXISTS category_id INTEGER NULL,
ADD CONSTRAINT fk_facts_category
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_facts_category_id ON facts(category_id);

-- 4) Seed initial facts (idempotent insert for empty tables)
-- Insert only if table is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM facts) THEN
        INSERT INTO facts (fact) VALUES
        ('Она родилась 31 марта 2005 года — настоящий весенний человек 🌸'),
        ('Родом из Уральска, города, где всё началось.'),
        ('В школе училась блестяще — закончила с золотой медалью 🏅'),
        ('У неё есть твёрдое мнение: блогершу Шаих она недолюбливает и не раз открыто об этом говорила 😅'),
        ('Во время учёбы в университете была частью группы SE-2214 👩‍💻'),
        ('Тогда же жила в ЖК Нура Есиль, на Аль-Фараби 21/1 — классическая студенческая история 🏙'),
        ('В детстве занималась гимнастикой или танцами — могла спокойно сесть на шпагат 🤸‍♀️'),
        ('Летом часто играла в «Мафию» в Telegram, собирая компанию друзей 🕵️‍♀️'),
        ('Очень социальная и активная онлайн — у неё несколько аккаунтов и море энергии 🌐'),
        ('И, пожалуй, самое главное: она такая же, как мы, просто чуть старше — на 2–3 года. Настоящий зуммер, только с опытом 😎');
    END IF;
END$$;

-- 5) Seed categories
INSERT INTO categories (name) VALUES
('фильмы'), ('книги'), ('хобби'), ('цитаты'), ('мемы')
ON CONFLICT (name) DO NOTHING;

-- 6) Map existing 10 facts to categories (heuristic mapping)
UPDATE facts SET category_id = (SELECT id FROM categories WHERE name = 'цитаты') WHERE id IN (1, 3, 10);
UPDATE facts SET category_id = (SELECT id FROM categories WHERE name = 'мемы')   WHERE id IN (4, 8);
UPDATE facts SET category_id = (SELECT id FROM categories WHERE name = 'хобби')  WHERE id IN (7);
UPDATE facts SET category_id = (SELECT id FROM categories WHERE name = 'книги')  WHERE id IN (2);
UPDATE facts SET category_id = (SELECT id FROM categories WHERE name = 'фильмы') WHERE id IN (5, 6);

-- 7) View for convenient selects
CREATE OR REPLACE VIEW facts_with_category AS
SELECT f.id, f.fact, c.name AS category
FROM facts f
LEFT JOIN categories c ON c.id = f.category_id;


