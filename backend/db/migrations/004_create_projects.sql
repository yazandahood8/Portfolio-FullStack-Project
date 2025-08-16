-- db/migrations/004_create_projects.sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL
      REFERENCES users(id) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    short_description TEXT,
    long_description TEXT,
    thumbnail_url TEXT,
    github_url TEXT,
    live_url TEXT,
    tech_stack JSONB,
    priority INTEGER DEFAULT 0,
    video_url TEXT
);
