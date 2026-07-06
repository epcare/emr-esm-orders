-- Verify if the configured encounter_role UUID exists
-- Run this query against the epcare database

SELECT
    'Configured Role' as check_type,
    'a0b03050-c99b-11e0-9572-0800200c9a66' as configured_uuid,
    er.uuid as actual_uuid,
    er.name as role_name,
    er.description,
    er.retired,
    CASE
        WHEN er.uuid IS NOT NULL THEN 'EXISTS'
        ELSE 'MISSING'
    END as status
FROM encounter_role er
WHERE er.uuid = 'a0b03050-c99b-11e0-9572-0800200c9a66'

UNION ALL

-- List ALL encounter roles in the system
SELECT
    'All Roles' as check_type,
    er.uuid as configured_uuid,
    er.uuid as actual_uuid,
    er.name as role_name,
    er.description,
    er.retired,
    'AVAILABLE' as status
FROM encounter_role er
WHERE er.retired = 0
ORDER BY check_type, role_name;
