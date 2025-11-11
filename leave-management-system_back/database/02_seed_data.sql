
INSERT INTO teams (name) VALUES
('Human Resources'),
('Information Technology'),
('Marketing'),
('Finance'),
('Sales'),
('Operations'),
('Legal'),
('Customer Support')
ON CONFLICT (name) DO NOTHING;

INSERT INTO leave_types (name, max_days) VALUES
('Annual Leave', 25),
('Sick Leave', 15),
('Personal Leave', 5),
('Maternity Leave', 90),
('Paternity Leave', 14),
('Bereavement Leave', 5),
('Emergency Leave', 3),
('Study Leave', 10),
('Unpaid Leave', 30)
ON CONFLICT (name) DO NOTHING;



INSERT INTO users (id, username, fullname, email, phone_number, password, is_active, roles, team_id, date_of_birth, address) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'sarah.johnson', 'Sarah Johnson', 'sarah.johnson@company.com', '+1-555-0101', '$2b$10$X5H1uTjHwE4zQCKVw.5oXO9KJmhBQVjBQsOwF8vO9gFKPJX9.yh9e', true, '{HR_MANAGER}', 1, '1985-03-15', '123 Oak Street, New York, NY 10001'),
('550e8400-e29b-41d4-a716-446655440002', 'michael.brown', 'Michael Brown', 'michael.brown@company.com', '+1-555-0102', '$2b$10$X5H1uTjHwE4zQCKVw.5oXO9KJmhBQVjBQsOwF8vO9gFKPJX9.yh9e', true, '{EMPLOYEE}', 1, '1990-07-22', '456 Pine Avenue, New York, NY 10002'),

('550e8400-e29b-41d4-a716-446655440003', 'david.wilson', 'David Wilson', 'david.wilson@company.com', '+1-555-0103', '$2b$10$X5H1uTjHwE4zQCKVw.5oXO9KJmhBQVjBQsOwF8vO9gFKPJX9.yh9e', true, '{IT_MANAGER}', 2, '1982-12-08', '789 Maple Drive, New York, NY 10003'),
('550e8400-e29b-41d4-a716-446655440004', 'emily.davis', 'Emily Davis', 'emily.davis@company.com', '+1-555-0104', '$2b$10$X5H1uTjHwE4zQCKVw.5oXO9KJmhBQVjBQsOwF8vO9gFKPJX9.yh9e', true, '{EMPLOYEE}', 2, '1988-05-18', '321 Cedar Lane, New York, NY 10004'),
('550e8400-e29b-41d4-a716-446655440005', 'james.garcia', 'James Garcia', 'james.garcia@company.com', '+1-555-0105', '$2b$10$X5H1uTjHwE4zQCKVw.5oXO9KJmhBQVjBQsOwF8vO9gFKPJX9.yh9e', true, '{EMPLOYEE}', 2, '1991-09-03', '654 Elm Street, New York, NY 10005'),

('550e8400-e29b-41d4-a716-446655440006', 'lisa.martinez', 'Lisa Martinez', 'lisa.martinez@company.com', '+1-555-0106', '$2b$10$X5H1uTjHwE4zQCKVw.5oXO9KJmhBQVjBQsOwF8vO9gFKPJX9.yh9e', true, '{MANAGER}', 3, '1987-01-25', '987 Birch Road, New York, NY 10006'),
('550e8400-e29b-41d4-a716-446655440007', 'robert.anderson', 'Robert Anderson', 'robert.anderson@company.com', '+1-555-0107', '$2b$10$X5H1uTjHwE4zQCKVw.5oXO9KJmhBQVjBQsOwF8vO9gFKPJX9.yh9e', true, '{EMPLOYEE}', 3, '1989-11-12', '147 Walnut Avenue, New York, NY 10007')
ON CONFLICT (id) DO NOTHING;
('550e8400-e29b-41d4-a716-446655440008', 'amanda.taylor', 'Amanda Taylor', 'amanda.taylor@company.com', '+1-555-0108', '$2b$10$X5H1uTjHwE4zQCKVw.5oXO9KJmhBQVjBQsOwF8vO9gFKPJX9.yh9e', true, '{FINANCE_MANAGER}', 4, '1984-06-30', '258 Cherry Street, New York, NY 10008'),
('550e8400-e29b-41d4-a716-446655440009', 'christopher.thomas', 'Christopher Thomas', 'christopher.thomas@company.com', '+1-555-0109', '$2b$10$X5H1uTjHwE4zQCKVw.5oXO9KJmhBQVjBQsOwF8vO9gFKPJX9.yh9e', true, '{EMPLOYEE}', 4, '1992-04-14', '369 Poplar Lane, New York, NY 10009'),

('550e8400-e29b-41d4-a716-446655440010', 'jessica.jackson', 'Jessica Jackson', 'jessica.jackson@company.com', '+1-555-0110', '$2b$10$X5H1uTjHwE4zQCKVw.5oXO9KJmhBQVjBQsOwF8vO9gFKPJX9.yh9e', true, '{SALES_MANAGER}', 5, '1986-10-05', '741 Spruce Drive, New York, NY 10010'),
('550e8400-e29b-41d4-a716-446655440011', 'matthew.white', 'Matthew White', 'matthew.white@company.com', '+1-555-0111', '$2b$10$X5H1uTjHwE4zQCKVw.5oXO9KJmhBQVjBQsOwF8vO9gFKPJX9.yh9e', true, '{EMPLOYEE}', 5, '1993-02-28', '852 Ash Boulevard, New York, NY 10011'),

('550e8400-e29b-41d4-a716-446655440012', 'daniel.harris', 'Daniel Harris', 'daniel.harris@company.com', '+1-555-0112', '$2b$10$X5H1uTjHwE4zQCKVw.5oXO9KJmhBQVjBQsOwF8vO9gFKPJX9.yh9e', true, '{OPERATIONS_MANAGER}', 6, '1983-08-17', '963 Fir Avenue, New York, NY 10012'),
('550e8400-e29b-41d4-a716-446655440013', 'ashley.clark', 'Ashley Clark', 'ashley.clark@company.com', '+1-555-0113', '$2b$10$X5H1uTjHwE4zQCKVw.5oXO9KJmhBQsOwF8vO9gFKPJX9.yh9e', true, '{EMPLOYEE}', 6, '1990-12-11', '159 Hemlock Street, New York, NY 10013'),

('550e8400-e29b-41d4-a716-446655440014', 'joshua.lewis', 'Joshua Lewis', 'joshua.lewis@company.com', '+1-555-0114', '$2b$10$X5H1uTjHwE4zQCKVw.5oXO9KJmhBQVjBQsOwF8vO9gFKPJX9.yh9e', true, '{LEGAL_MANAGER}', 7, '1981-04-09', '357 Redwood Road, New York, NY 10014'),

('550e8400-e29b-41d4-a716-446655440015', 'stephanie.robinson', 'Stephanie Robinson', 'stephanie.robinson@company.com', '+1-555-0115', '$2b$10$X5H1uTjHwE4zQCKVw.5oXO9KJmhBQVjBQsOwF8vO9gFKPJX9.yh9e', true, '{SUPPORT_MANAGER}', 8, '1985-09-26', '468 Sequoia Lane, New York, NY 10015'),
('550e8400-e29b-41d4-a716-446655440016', 'ryan.walker', 'Ryan Walker', 'ryan.walker@company.com', '+1-555-0116', '$2b$10$X5H1uTjHwE4zQCKVw.5oXO9KJmhBQVjBQsOwF8vO9gFKPJX9.yh9e', true, '{EMPLOYEE}', 8, '1994-01-07', '579 Dogwood Drive, New York, NY 10016'),

('550e8400-e29b-41d4-a716-446655440017', 'admin', 'System Administrator', 'admin@company.com', '+1-555-0117', '$2b$10$X5H1uTjHwE4zQCKVw.5oXO9KJmhBQVjBQsOwF8vO9gFKPJX9.yh9e', true, '{ADMIN,HR_MANAGER}', 1, '1980-01-01', '1 Admin Plaza, New York, NY 10017');

INSERT INTO employee_profiles (user_id, employee_id, department, designation, join_date, gender, date_of_birth, phone, emergency_contact_name, emergency_contact_phone, address, marital_status, nationality, salary, bank_account_number, bank_name) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'EMP001', 'Human Resources', 'HR Manager', '2020-01-15', 'FEMALE', '1985-03-15', '+1-555-0101', 'John Johnson', '+1-555-9101', '123 Oak Street, New York, NY 10001', 'MARRIED', 'American', 85000.00, '1234567890', 'First National Bank'),
('550e8400-e29b-41d4-a716-446655440002', 'EMP002', 'Human Resources', 'HR Specialist', '2021-06-01', 'MALE', '1990-07-22', '+1-555-0102', 'Mary Brown', '+1-555-9102', '456 Pine Avenue, New York, NY 10002', 'SINGLE', 'American', 65000.00, '2345678901', 'Second Trust Bank'),

('550e8400-e29b-41d4-a716-446655440003', 'EMP003', 'Information Technology', 'IT Manager', '2019-03-01', 'MALE', '1982-12-08', '+1-555-0103', 'Susan Wilson', '+1-555-9103', '789 Maple Drive, New York, NY 10003', 'MARRIED', 'American', 95000.00, '3456789012', 'Tech Credit Union'),
('550e8400-e29b-41d4-a716-446655440004', 'EMP004', 'Information Technology', 'Senior Developer', '2020-09-15', 'FEMALE', '1988-05-18', '+1-555-0104', 'Robert Davis', '+1-555-9104', '321 Cedar Lane, New York, NY 10004', 'MARRIED', 'American', 80000.00, '4567890123', 'Developer Bank'),
('550e8400-e29b-41d4-a716-446655440005', 'EMP005', 'Information Technology', 'Full Stack Developer', '2022-01-10', 'MALE', '1991-09-03', '+1-555-0105', 'Maria Garcia', '+1-555-9105', '654 Elm Street, New York, NY 10005', 'SINGLE', 'Hispanic', 75000.00, '5678901234', 'Code Bank'),

('550e8400-e29b-41d4-a716-446655440006', 'EMP006', 'Marketing', 'Marketing Manager', '2018-07-01', 'FEMALE', '1987-01-25', '+1-555-0106', 'Carlos Martinez', '+1-555-9106', '987 Birch Road, New York, NY 10006', 'MARRIED', 'Hispanic', 78000.00, '6789012345', 'Creative Bank'),
('550e8400-e29b-41d4-a716-446655440007', 'EMP007', 'Marketing', 'Marketing Specialist', '2021-04-12', 'MALE', '1989-11-12', '+1-555-0107', 'Linda Anderson', '+1-555-9107', '147 Walnut Avenue, New York, NY 10007', 'DIVORCED', 'American', 62000.00, '7890123456', 'Brand Bank'),

('550e8400-e29b-41d4-a716-446655440008', 'EMP008', 'Finance', 'Finance Manager', '2017-11-20', 'FEMALE', '1984-06-30', '+1-555-0108', 'William Taylor', '+1-555-9108', '258 Cherry Street, New York, NY 10008', 'MARRIED', 'American', 88000.00, '8901234567', 'Money Trust Bank'),
('550e8400-e29b-41d4-a716-446655440009', 'EMP009', 'Finance', 'Financial Analyst', '2020-02-28', 'MALE', '1992-04-14', '+1-555-0109', 'Jennifer Thomas', '+1-555-9109', '369 Poplar Lane, New York, NY 10009', 'SINGLE', 'American', 68000.00, '9012345678', 'Numbers Bank'),

('550e8400-e29b-41d4-a716-446655440010', 'EMP010', 'Sales', 'Sales Manager', '2019-08-05', 'FEMALE', '1986-10-05', '+1-555-0110', 'Michael Jackson', '+1-555-9110', '741 Spruce Drive, New York, NY 10010', 'MARRIED', 'American', 82000.00, '0123456789', 'Sales Success Bank'),
('550e8400-e29b-41d4-a716-446655440011', 'EMP011', 'Sales', 'Sales Representative', '2021-11-01', 'MALE', '1993-02-28', '+1-555-0111', 'Sarah White', '+1-555-9111', '852 Ash Boulevard, New York, NY 10011', 'SINGLE', 'American', 58000.00, '1357924680', 'Revenue Bank'),

('550e8400-e29b-41d4-a716-446655440012', 'EMP012', 'Operations', 'Operations Manager', '2018-05-14', 'MALE', '1983-08-17', '+1-555-0112', 'Patricia Harris', '+1-555-9112', '963 Fir Avenue, New York, NY 10012', 'MARRIED', 'American', 86000.00, '2468013579', 'Operations Bank'),
('550e8400-e29b-41d4-a716-446655440013', 'EMP013', 'Operations', 'Operations Specialist', '2020-10-22', 'FEMALE', '1990-12-11', '+1-555-0113', 'Kenneth Clark', '+1-555-9113', '159 Hemlock Street, New York, NY 10013', 'MARRIED', 'American', 64000.00, '3691470258', 'Process Bank'),

('550e8400-e29b-41d4-a716-446655440014', 'EMP014', 'Legal', 'Legal Manager', '2017-02-01', 'MALE', '1981-04-09', '+1-555-0114', 'Barbara Lewis', '+1-555-9114', '357 Redwood Road, New York, NY 10014', 'MARRIED', 'American', 110000.00, '4815162342', 'Legal Trust Bank'),

('550e8400-e29b-41d4-a716-446655440015', 'EMP015', 'Customer Support', 'Support Manager', '2019-12-01', 'FEMALE', '1985-09-26', '+1-555-0115', 'Thomas Robinson', '+1-555-9115', '468 Sequoia Lane, New York, NY 10015', 'MARRIED', 'American', 70000.00, '5927384615', 'Support Bank'),
('550e8400-e29b-41d4-a716-446655440016', 'EMP016', 'Customer Support', 'Support Specialist', '2022-03-07', 'MALE', '1994-01-07', '+1-555-0116', 'Nancy Walker', '+1-555-9116', '579 Dogwood Drive, New York, NY 10016', 'SINGLE', 'American', 48000.00, '6183950472', 'Help Bank'),

('550e8400-e29b-41d4-a716-446655440017', 'ADMIN001', 'Administration', 'System Administrator', '2015-01-01', 'MALE', '1980-01-01', '+1-555-0117', 'Emergency Contact', '+1-555-9117', '1 Admin Plaza, New York, NY 10017', 'MARRIED', 'American', 120000.00, '7405961836', 'Admin Bank');

INSERT INTO holidays (name, date, type, is_optional, description) VALUES
('New Year''s Day 2024', '2024-01-01', 'NATIONAL', false, 'Start of the new year'),
('Martin Luther King Jr. Day 2024', '2024-01-15', 'NATIONAL', false, 'Federal holiday honoring MLK Jr.'),
('Presidents Day 2024', '2024-02-19', 'NATIONAL', false, 'Federal holiday honoring US Presidents'),
('Good Friday 2024', '2024-03-29', 'RELIGIOUS', true, 'Christian holiday before Easter'),
('Memorial Day 2024', '2024-05-27', 'NATIONAL', false, 'Honoring military personnel who died in service'),
('Independence Day 2024', '2024-07-04', 'NATIONAL', false, 'US Independence Day'),
('Labor Day 2024', '2024-09-02', 'NATIONAL', false, 'Federal holiday celebrating workers'),
('Columbus Day 2024', '2024-10-14', 'NATIONAL', true, 'Federal holiday commemorating Columbus'),
('Veterans Day 2024', '2024-11-11', 'NATIONAL', false, 'Honoring military veterans'),
('Thanksgiving 2024', '2024-11-28', 'NATIONAL', false, 'Traditional harvest celebration'),
('Black Friday 2024', '2024-11-29', 'COMPANY', true, 'Day after Thanksgiving'),
('Christmas Eve 2024', '2024-12-24', 'COMPANY', false, 'Day before Christmas'),
('Christmas Day 2024', '2024-12-25', 'NATIONAL', false, 'Christian celebration of Christ''s birth'),
('New Year''s Eve 2024', '2024-12-31', 'COMPANY', true, 'Last day of the year'),

('New Year''s Day 2025', '2025-01-01', 'NATIONAL', false, 'Start of the new year'),
('Martin Luther King Jr. Day 2025', '2025-01-20', 'NATIONAL', false, 'Federal holiday honoring MLK Jr.'),
('Presidents Day 2025', '2025-02-17', 'NATIONAL', false, 'Federal holiday honoring US Presidents'),
('Good Friday 2025', '2025-04-18', 'RELIGIOUS', true, 'Christian holiday before Easter'),
('Memorial Day 2025', '2025-05-26', 'NATIONAL', false, 'Honoring military personnel who died in service'),
('Independence Day 2025', '2025-07-04', 'NATIONAL', false, 'US Independence Day'),
('Labor Day 2025', '2025-09-01', 'NATIONAL', false, 'Federal holiday celebrating workers'),
('Columbus Day 2025', '2025-10-13', 'NATIONAL', true, 'Federal holiday commemorating Columbus'),
('Veterans Day 2025', '2025-11-11', 'NATIONAL', false, 'Honoring military veterans'),
('Thanksgiving 2025', '2025-11-27', 'NATIONAL', false, 'Traditional harvest celebration'),
('Black Friday 2025', '2025-11-28', 'COMPANY', true, 'Day after Thanksgiving'),
('Christmas Eve 2025', '2025-12-24', 'COMPANY', false, 'Day before Christmas'),
('Christmas Day 2025', '2025-12-25', 'NATIONAL', false, 'Christian celebration of Christ''s birth'),
('New Year''s Eve 2025', '2025-12-31', 'COMPANY', true, 'Last day of the year');

-- Insert Leave Balances for 2024 and 2025
-- For each user, create balances for Annual Leave and Sick Leave
INSERT INTO leave_balances (user_id, leave_type_id, year, carryover, used) 
SELECT 
    u.id as user_id,
    1 as leave_type_id, -- Annual Leave
    2024 as year,
    0 as carryover,
    CASE 
        WHEN EXTRACT(MONTH FROM u.created_at) <= 6 THEN FLOOR(RANDOM() * 15 + 5) -- 5-19 days used if joined in first half
        ELSE FLOOR(RANDOM() * 10 + 2) -- 2-11 days used if joined later
    END as used
FROM users u;

INSERT INTO leave_balances (user_id, leave_type_id, year, carryover, used) 
SELECT 
    u.id as user_id,
    2 as leave_type_id,
    2024 as year,
    0 as carryover,
    FLOOR(RANDOM() * 8 + 1) as used 
FROM users u;

INSERT INTO leave_balances (user_id, leave_type_id, year, carryover, used) 
SELECT 
    u.id as user_id,
    1 as leave_type_id, -- Annual Leave
    2025 as year,
    GREATEST(0, 25 - lb.used - 5) as carryover,
    FLOOR(RANDOM() * 5 + 1) as used 
FROM users u
JOIN leave_balances lb ON u.id = lb.user_id 
WHERE lb.leave_type_id = 1 AND lb.year = 2024;

INSERT INTO leave_balances (user_id, leave_type_id, year, carryover, used) 
SELECT 
    u.id as user_id,
    2 as leave_type_id, 
    2025 as year,
    0 as carryover, 
    FLOOR(RANDOM() * 3 + 0) as used 
FROM users u;

-- Insert Personal Leave balances for senior employees
INSERT INTO leave_balances (user_id, leave_type_id, year, carryover, used)
SELECT 
    u.id as user_id,
    3 as leave_type_id, -- Personal Leave
    2024 as year,
    0 as carryover,
    FLOOR(RANDOM() * 3 + 0) as used
FROM users u 
WHERE u.roles && ARRAY['HR_MANAGER', 'IT_MANAGER', 'MANAGER', 'FINANCE_MANAGER', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'LEGAL_MANAGER', 'SUPPORT_MANAGER', 'ADMIN'];

INSERT INTO leave_balances (user_id, leave_type_id, year, carryover, used)
SELECT 
    u.id as user_id,
    3 as leave_type_id, -- Personal Leave
    2025 as year,
    0 as carryover,
    FLOOR(RANDOM() * 2 + 0) as used
FROM users u 
WHERE u.roles && ARRAY['HR_MANAGER', 'IT_MANAGER', 'MANAGER', 'FINANCE_MANAGER', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'LEGAL_MANAGER', 'SUPPORT_MANAGER', 'ADMIN'];
