CREATE TABLE IF NOT EXISTS reminder(
    id INTEGER PRIMARY KEY NOT NULL,
    nick TEXT NOT NULL,
    channel TEXT NOT NULL,
    created_at TEXT NOT NULL,
    reminder_datetime TEXT NOT NULL,
    reminder_text TEXT
);
