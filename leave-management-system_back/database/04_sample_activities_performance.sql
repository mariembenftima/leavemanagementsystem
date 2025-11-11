
INSERT INTO activities (profile_id, activity_type, description, activity_date) 
SELECT 
    ep.id,
    'LOGIN',
    'User logged into the system',
    CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL
FROM employee_profiles ep
LIMIT 50;

INSERT INTO activities (profile_id, activity_type, description, activity_date) 
SELECT 
    ep.id,
    'LEAVE_REQUEST',
    'Submitted leave request for ' || (ARRAY['vacation', 'sick leave', 'personal time', 'emergency leave'])[FLOOR(RANDOM() * 4) + 1],
    CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 60) || ' days')::INTERVAL
FROM employee_profiles ep
LIMIT 30;

INSERT INTO activities (profile_id, activity_type, description, activity_date) 
SELECT 
    ep.id,
    'PROFILE_UPDATE',
    'Updated ' || (ARRAY['contact information', 'emergency contacts', 'address', 'bank details'])[FLOOR(RANDOM() * 4) + 1],
    CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 90) || ' days')::INTERVAL
FROM employee_profiles ep
LIMIT 20;

INSERT INTO activities (profile_id, activity_type, description, activity_date) 
SELECT 
    ep.id,
    'PROJECT_COMPLETION',
    'Completed project: ' || (ARRAY['Q3 Marketing Campaign', 'Database Migration', 'Client Onboarding', 'System Upgrade', 'Security Audit'])[FLOOR(RANDOM() * 5) + 1],
    CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 120) || ' days')::INTERVAL
FROM employee_profiles ep
WHERE ep.department IN ('Information Technology', 'Marketing', 'Sales', 'Operations')
LIMIT 25;

INSERT INTO activities (profile_id, activity_type, description, activity_date) 
SELECT 
    ep.id,
    'TRAINING_COMPLETION',
    'Completed training: ' || (ARRAY['Cybersecurity Awareness', 'Leadership Skills', 'Customer Service Excellence', 'Project Management', 'Data Analytics'])[FLOOR(RANDOM() * 5) + 1],
    CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 180) || ' days')::INTERVAL
FROM employee_profiles ep
LIMIT 35;

INSERT INTO performances (profile_id, review_period, rating, goals, achievements, feedback, reviewer_id, created_at) VALUES

((SELECT id FROM employee_profiles WHERE employee_id = 'EMP003'), '2024 Q3', 4.5, 
'Lead digital transformation initiatives, improve system reliability, mentor junior developers', 
'Successfully migrated legacy systems to cloud, reduced downtime by 40%, mentored 3 junior developers', 
'Excellent technical leadership and problem-solving skills. Strong team collaboration.', 
'550e8400-e29b-41d4-a716-446655440017', '2024-10-15 14:30:00'),

((SELECT id FROM employee_profiles WHERE employee_id = 'EMP004'), '2024 Q3', 4.2, 
'Deliver high-quality code, participate in code reviews, learn new technologies', 
'Delivered 15+ features on time, maintained 99% code coverage, earned AWS certification', 
'Consistent performer with strong technical skills. Shows initiative in learning new technologies.', 
'550e8400-e29b-41d4-a716-446655440003', '2024-10-15 15:45:00'),

((SELECT id FROM employee_profiles WHERE employee_id = 'EMP005'), '2024 Q3', 4.0, 
'Complete assigned projects, improve debugging skills, contribute to team discussions', 
'Completed 12 projects successfully, resolved 50+ bugs, actively participated in sprint planning', 
'Good progress in technical skills. Needs to work on time estimation and communication.', 
'550e8400-e29b-41d4-a716-446655440003', '2024-10-15 16:00:00'),

((SELECT id FROM employee_profiles WHERE employee_id = 'EMP001'), '2024 Q3', 4.7, 
'Streamline HR processes, improve employee satisfaction, implement new policies', 
'Reduced hiring time by 30%, achieved 95% employee satisfaction score, launched wellness program', 
'Outstanding leadership in HR transformation. Excellent stakeholder management and strategic thinking.', 
'550e8400-e29b-41d4-a716-446655440017', '2024-10-12 10:30:00'),

((SELECT id FROM employee_profiles WHERE employee_id = 'EMP002'), '2024 Q3', 4.1, 
'Support recruitment activities, maintain employee records, assist with policy implementation', 
'Processed 45+ recruitment requests, maintained 100% accuracy in records, supported 5 policy rollouts', 
'Reliable and detail-oriented. Good support to HR initiatives. Could take more initiative.', 
'550e8400-e29b-41d4-a716-446655440001', '2024-10-12 11:15:00'),

((SELECT id FROM employee_profiles WHERE employee_id = 'EMP006'), '2024 Q3', 4.4, 
'Increase brand awareness, launch new campaigns, improve conversion rates', 
'Increased brand awareness by 25%, launched 3 successful campaigns, improved conversion by 15%', 
'Creative and results-driven. Excellent campaign management and team leadership skills.', 
'550e8400-e29b-41d4-a716-446655440017', '2024-10-18 13:20:00'),

((SELECT id FROM employee_profiles WHERE employee_id = 'EMP007'), '2024 Q3', 3.8, 
'Support marketing campaigns, analyze performance metrics, create content', 
'Supported 8 campaigns, created 25+ content pieces, provided detailed performance analysis', 
'Good analytical skills and creativity. Needs to improve project management and deadline adherence.', 
'550e8400-e29b-41d4-a716-446655440006', '2024-10-18 14:00:00'),

((SELECT id FROM employee_profiles WHERE employee_id = 'EMP010'), '2024 Q3', 4.6, 
'Exceed sales targets, build customer relationships, lead team development', 
'Achieved 120% of sales target, secured 15 new major clients, increased team performance by 18%', 
'Exceptional sales leadership and customer relationship management. Strong business acumen.', 
'550e8400-e29b-41d4-a716-446655440017', '2024-10-20 09:45:00'),

((SELECT id FROM employee_profiles WHERE employee_id = 'EMP011'), '2024 Q3', 3.9, 
'Meet individual sales targets, improve customer follow-up, learn new sales techniques', 
'Achieved 95% of sales target, maintained good customer relationships, completed sales training', 
'Consistent performance with room for growth. Good customer service skills, needs to work on closing techniques.', 
'550e8400-e29b-41d4-a716-446655440010', '2024-10-20 10:30:00'),

((SELECT id FROM employee_profiles WHERE employee_id = 'EMP008'), '2024 Q3', 4.5, 
'Ensure financial accuracy, implement cost control measures, lead financial planning', 
'Maintained 100% accuracy in reports, reduced costs by 12%, completed annual budget planning', 
'Excellent financial management and analytical skills. Strong leadership in financial planning.', 
'550e8400-e29b-41d4-a716-446655440017', '2024-10-22 11:00:00'),

((SELECT id FROM employee_profiles WHERE employee_id = 'EMP009'), '2024 Q3', 4.0, 
'Provide accurate financial analysis, support budget planning, improve reporting efficiency', 
'Delivered timely financial analysis, supported budget planning, automated 3 reporting processes', 
'Strong analytical skills and attention to detail. Good progress in process improvement.', 
'550e8400-e29b-41d4-a716-446655440008', '2024-10-22 11:45:00'),

((SELECT id FROM employee_profiles WHERE employee_id = 'EMP012'), '2024 Q3', 4.3, 
'Optimize operational processes, ensure quality standards, lead continuous improvement', 
'Improved process efficiency by 20%, maintained quality standards above 98%, led 4 improvement projects', 
'Strong operational leadership and process optimization skills. Excellent problem-solving abilities.', 
'550e8400-e29b-41d4-a716-446655440017', '2024-10-25 14:15:00'),

((SELECT id FROM employee_profiles WHERE employee_id = 'EMP013'), '2024 Q3', 4.1, 
'Support operational activities, monitor quality metrics, implement improvements', 
'Supported all major operations, monitored quality metrics daily, implemented 2 process improvements', 
'Reliable and proactive. Good understanding of operational processes. Shows initiative in improvements.', 
'550e8400-e29b-41d4-a716-446655440012', '2024-10-25 15:00:00'),

((SELECT id FROM employee_profiles WHERE employee_id = 'EMP014'), '2024 Q3', 4.8, 
'Provide legal guidance, manage compliance, handle contract negotiations', 
'Provided legal guidance on 50+ matters, achieved 100% compliance, negotiated 25+ contracts', 
'Exceptional legal expertise and strategic thinking. Outstanding compliance management and risk assessment.', 
'550e8400-e29b-41d4-a716-446655440017', '2024-10-28 10:20:00'),

((SELECT id FROM employee_profiles WHERE employee_id = 'EMP015'), '2024 Q3', 4.2, 
'Maintain customer satisfaction, resolve issues efficiently, train support team', 
'Maintained 96% customer satisfaction, reduced resolution time by 25%, trained 5 team members', 
'Excellent customer service skills and team leadership. Strong focus on customer satisfaction and team development.', 
'550e8400-e29b-41d4-a716-446655440017', '2024-10-30 13:45:00'),

((SELECT id FROM employee_profiles WHERE employee_id = 'EMP016'), '2024 Q3', 3.7, 
'Handle customer inquiries, improve response time, learn product knowledge', 
'Handled 200+ customer inquiries, improved response time to 2 hours, completed product training', 
'Good customer service attitude and willingness to learn. Needs to improve technical knowledge and efficiency.', 
'550e8400-e29b-41d4-a716-446655440015', '2024-10-30 14:30:00');


INSERT INTO performances (profile_id, review_period, rating, goals, achievements, feedback, reviewer_id, created_at) VALUES

((SELECT id FROM employee_profiles WHERE employee_id = 'EMP003'), '2024 Q2', 4.3, 
'Improve system stability, lead cloud migration project, develop team skills', 
'Achieved 99.5% system uptime, initiated cloud migration planning, conducted technical workshops', 
'Strong technical leadership. Successfully improved system reliability and team capabilities.', 
'550e8400-e29b-41d4-a716-446655440017', '2024-07-15 14:30:00'),

((SELECT id FROM employee_profiles WHERE employee_id = 'EMP001'), '2024 Q2', 4.5, 
'Improve recruitment process, enhance employee engagement, develop HR policies', 
'Reduced hiring time from 45 to 30 days, increased engagement scores by 10%, drafted 5 new policies', 
'Excellent progress in HR process improvements and employee engagement initiatives.', 
'550e8400-e29b-41d4-a716-446655440017', '2024-07-12 10:30:00'),

((SELECT id FROM employee_profiles WHERE employee_id = 'EMP006'), '2024 Q2', 4.2, 
'Launch summer campaign, improve social media presence, analyze market trends', 
'Successfully launched summer campaign with 30% engagement increase, improved social media followers by 40%', 
'Creative approach to marketing campaigns. Good analytical skills in market trend analysis.', 
'550e8400-e29b-41d4-a716-446655440017', '2024-07-18 13:20:00');
