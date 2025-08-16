-- db/seeds/002_seed_demo_records.sql

-- two skills for the demo user
INSERT INTO skills (id, user_id, skill_name, level, category)
VALUES
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'JavaScript',    'Intermediate', 'Frontend'),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Node.js',       'Intermediate', 'Backend');

-- one past experience
INSERT INTO experiences (
    id, user_id, job_title, company_name, location,
    start_date, end_date, is_current, description
) VALUES (
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'Software Engineer Intern',
    'Tech Corp',
    'Test City',
    '2024-01-01',
    '2024-06-30',
    FALSE,
    'Implemented and tested RESTful APIs in Node.js.'
);

-- one example project
INSERT INTO projects (
    id, user_id, project_name, short_description, long_description,
    thumbnail_url, github_url, live_url, tech_stack, priority, video_url
) VALUES (
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'Demo Project',
    'A simple demo project',
    'This project demonstrates the full backend setup with Express and PostgreSQL.',
    'https://example.com/thumb.png',
    'https://github.com/demo/demo-project',
    'https://demo-project.example.com',
    '["Node.js","Express","PostgreSQL"]',
    1,
    NULL
);

-- one sample blog post
INSERT INTO blog_posts (
    id, user_id, title, slug, excerpt, content,
    cover_image_url, published_at
) VALUES (
    '55555555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    'Demo Blog Post',
    'demo-blog-post',
    'This is an example blog post.',
    '<p>Hello, world! This is a demo.</p>',
    'https://example.com/cover.png',
    NOW()
);
