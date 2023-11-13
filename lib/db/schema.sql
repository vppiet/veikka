CREATE TABLE IF NOT EXISTS reminder(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    nick TEXT NOT NULL,
    channel TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    reminder_datetime INTEGER NOT NULL,
    reminder_text TEXT
);
