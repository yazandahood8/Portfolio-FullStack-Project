-- user_social_links table
CREATE TABLE user_social_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(32) NOT NULL,  -- e.g., 'github', 'linkedin', 'youtube', etc.
    url TEXT NOT NULL,
    display_name VARCHAR(64),       -- e.g., 'GitHub', 'LinkedIn', can be used for label
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add an index for quick lookup by user
CREATE INDEX idx_user_social_links_user_id ON user_social_links(user_id);
