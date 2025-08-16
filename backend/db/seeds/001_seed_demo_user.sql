-- db/seeds/001_seed_demo_user.sql

INSERT INTO users (
    id, full_name, email, phone, location,
    profile_image_url, linkedin_url, github_url, youtube_url,
    bio, password_hash
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Demo User',
    'demo@example.com',
    '+1-555-555-5555',
    'Test City',
    'https://example.com/avatar.png',
    'https://linkedin.com/in/demo',
    'https://github.com/demo',
    'https://youtube.com/demo',
    'This is a demo user for testing purposes.',
    -- bcrypt hash for “password123”
    '$2b$10$N9qo8uLOickgx2ZMRZo5e.4FQbl1BpFA9vTtYlAdQAuAZajics/pW'
);
