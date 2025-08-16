-- db/migrations/002_create_skills.sql
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL
      REFERENCES users(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    level TEXT NOT NULL
      CHECK (level IN ('Beginner','Intermediate','Expert')),
    category TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
