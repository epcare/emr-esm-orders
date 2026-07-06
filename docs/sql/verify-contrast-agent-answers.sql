-- ============================================================================
-- SQL Script: Verify Contrast Agent Answers
-- ============================================================================
-- Purpose: Check if contrast agent answers exist in the database
-- Database: epcare
-- Author: Generated for emr-esm-orders implementation
-- Date: 2026-07-03
--
-- Usage:
-- mysql -u openmrs -p epcare < verify-contrast-agent-answers.sql
-- ============================================================================

-- ============================================================================
-- CHECK 1: Verify Contrast Agent Concept Exists
-- ============================================================================

SELECT 'CHECK 1: Contrast Agent Concept' AS check_name;
SELECT
  c.concept_id,
  c.uuid,
  cn.name,
  cc.name AS class_name,
  (SELECT name FROM concept_name WHERE concept_id = c.datatype_id AND locale = 'en' AND concept_name_type = 'FULLY_SPECIFIED' LIMIT 1) AS datatype_name
FROM concept c
JOIN concept_name cn ON c.concept_id = cn.concept_id AND cn.locale = 'en' AND cn.voided = 0 AND cn.concept_name_type = 'FULLY_SPECIFIED'
LEFT JOIN concept_class cc ON c.class_id = cc.concept_class_id
WHERE c.concept_id = 200130;

-- ============================================================================
-- CHECK 2: Count Existing Answers
-- ============================================================================

SELECT 'CHECK 2: Answer Count' AS check_name;
SELECT COUNT(*) AS answer_count
FROM concept_answer
WHERE concept_id = 200130;

-- ============================================================================
-- CHECK 3: List All Answers (if any)
-- ============================================================================

SELECT 'CHECK 3: Answer Details' AS check_name;
SELECT
  ca.answer_concept,
  c.uuid AS answer_uuid,
  cn.name AS answer_name,
  ca.sort_weight
FROM concept_answer ca
JOIN concept c ON ca.answer_concept = c.concept_id
JOIN concept_name cn ON c.concept_id = cn.concept_id AND cn.locale = 'en' AND cn.voided = 0 AND cn.concept_name_type = 'FULLY_SPECIFIED'
WHERE ca.concept_id = 200130
ORDER BY ca.sort_weight;

-- ============================================================================
-- EXPECTED OUTPUT (after running add-contrast-agent-answers.sql)
-- ============================================================================
--
-- CHECK 1: Contrast Agent Concept
-- concept_id | uuid                                | name           | class_name | datatype_name
-- 200130     | 0028c9c3-2bc2-4d75-9cbc-9d06f6951c2e | Contrast Agent | Finding    | ANEMIA, HEMOLYSIS
--
-- CHECK 2: Answer Count
-- answer_count
-- 5
--
-- CHECK 3: Answer Details
-- answer_concept | answer_uuid                        | answer_name               | sort_weight
-- 200201         | 7101837b-96be-48be-bbdd-994b234ab262 | No contrast               | 1
-- 200202         | 9ffad20c-1162-44ef-b551-d06844b33735 | With contrast             | 2
-- 200203         | a0e3cc16-3c06-4142-a8f2-ec54ad4cf9db | With IV contrast          | 3
-- 200204         | 97118fc7-09c3-4e45-a9cd-8025d8ab7b5c | With oral contrast         | 4
-- 200205         | dea3def9-a593-4c43-8f8f-ab75d32ffc75 | With IV and oral contrast | 5
