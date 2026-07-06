-- ============================================================================
-- SQL Script: Add Contrast Agent Answers
-- ============================================================================
-- Purpose: Add answer options for the Contrast Agent concept (ID: 200130)
-- Database: epcare
-- Author: Generated for emr-esm-orders implementation
-- Date: 2026-07-03
--
-- Description:
-- This script creates answer concepts for the Contrast Agent concept and adds
-- them to the concept_answer table. The Contrast Agent concept is used in imaging
-- orders to specify what type of contrast media (if any) was used.
--
-- Usage:
-- mysql -u openmrs -p epcare < add-contrast-agent-answers.sql
-- ============================================================================

-- Set variables for consistent IDs
SET @contrast_agent_concept_id = 200130;
SET @creator_user_id = 1; -- Update with actual user ID if different

-- ============================================================================
-- PART 1: Create Answer Concepts
-- ============================================================================

-- Answer 1: No contrast
-- Concept ID: 200201
-- Concept UUID: 7101837b-96be-48be-bbdd-994b234ab262
-- Concept Name UUID: b978030f-6cdc-4ed2-80e2-fc54715a88af
INSERT INTO concept (concept_id, uuid, datatype_id, class_id, creator, date_created, retired)
VALUES (200201, '7101837b-96be-48be-bbdd-994b234ab262', 4, 8, @creator_user_id, NOW(), 0)
ON DUPLICATE KEY UPDATE concept_id = concept_id;

INSERT INTO concept_name (uuid, concept_id, name, locale, creator, date_created, concept_name_type, voided)
VALUES ('b978030f-6cdc-4ed2-80e2-fc54715a88af', 200201, 'No contrast', 'en', @creator_user_id, NOW(), 'FULLY_SPECIFIED', 0)
ON DUPLICATE KEY UPDATE uuid = uuid;

-- Answer 2: With contrast
-- Concept ID: 200202
-- Concept UUID: 9ffad20c-1162-44ef-b551-d06844b33735
-- Concept Name UUID: 355c865a-2909-40ca-99ec-660ff1ce99bb
INSERT INTO concept (concept_id, uuid, datatype_id, class_id, creator, date_created, retired)
VALUES (200202, '9ffad20c-1162-44ef-b551-d06844b33735', 4, 8, @creator_user_id, NOW(), 0)
ON DUPLICATE KEY UPDATE concept_id = concept_id;

INSERT INTO concept_name (uuid, concept_id, name, locale, creator, date_created, concept_name_type, voided)
VALUES ('355c865a-2909-40ca-99ec-660ff1ce99bb', 200202, 'With contrast', 'en', @creator_user_id, NOW(), 'FULLY_SPECIFIED', 0)
ON DUPLICATE KEY UPDATE uuid = uuid;

-- Answer 3: With IV contrast
-- Concept ID: 200203
-- Concept UUID: a0e3cc16-3c06-4142-a8f2-ec54ad4cf9db
-- Concept Name UUID: 544f5101-f5de-40ac-94a8-f7569dee6309
INSERT INTO concept (concept_id, uuid, datatype_id, class_id, creator, date_created, retired)
VALUES (200203, 'a0e3cc16-3c06-4142-a8f2-ec54ad4cf9db', 4, 8, @creator_user_id, NOW(), 0)
ON DUPLICATE KEY UPDATE concept_id = concept_id;

INSERT INTO concept_name (uuid, concept_id, name, locale, creator, date_created, concept_name_type, voided)
VALUES ('544f5101-f5de-40ac-94a8-f7569dee6309', 200203, 'With IV contrast', 'en', @creator_user_id, NOW(), 'FULLY_SPECIFIED', 0)
ON DUPLICATE KEY UPDATE uuid = uuid;

-- Answer 4: With oral contrast
-- Concept ID: 200204
-- Concept UUID: 97118fc7-09c3-4e45-a9cd-8025d8ab7b5c
-- Concept Name UUID: d1af949c-44db-4a51-a19c-63f369387c77
INSERT INTO concept (concept_id, uuid, datatype_id, class_id, creator, date_created, retired)
VALUES (200204, '97118fc7-09c3-4e45-a9cd-8025d8ab7b5c', 4, 8, @creator_user_id, NOW(), 0)
ON DUPLICATE KEY UPDATE concept_id = concept_id;

INSERT INTO concept_name (uuid, concept_id, name, locale, creator, date_created, concept_name_type, voided)
VALUES ('d1af949c-44db-4a51-a19c-63f369387c77', 200204, 'With oral contrast', 'en', @creator_user_id, NOW(), 'FULLY_SPECIFIED', 0)
ON DUPLICATE KEY UPDATE uuid = uuid;

-- Answer 5: With IV and oral contrast
-- Concept ID: 200205
-- Concept UUID: dea3def9-a593-4c43-8f8f-ab75d32ffc75
-- Concept Name UUID: 15d5705e-69a7-4a37-8a8f-a8b782f6edc9
INSERT INTO concept (concept_id, uuid, datatype_id, class_id, creator, date_created, retired)
VALUES (200205, 'dea3def9-a593-4c43-8f8f-ab75d32ffc75', 4, 8, @creator_user_id, NOW(), 0)
ON DUPLICATE KEY UPDATE concept_id = concept_id;

INSERT INTO concept_name (uuid, concept_id, name, locale, creator, date_created, concept_name_type, voided)
VALUES ('15d5705e-69a7-4a37-8a8f-a8b782f6edc9', 200205, 'With IV and oral contrast', 'en', @creator_user_id, NOW(), 'FULLY_SPECIFIED', 0)
ON DUPLICATE KEY UPDATE uuid = uuid;

-- ============================================================================
-- PART 2: Add Answers to Contrast Agent Concept
-- ============================================================================

-- Answer 1: No contrast
INSERT INTO concept_answer (concept_id, answer_concept, creator, date_created, sort_weight, uuid)
VALUES (@contrast_agent_concept_id, 200201, @creator_user_id, NOW(), 1, UUID())
ON DUPLICATE KEY UPDATE concept_id = concept_id;

-- Answer 2: With contrast
INSERT INTO concept_answer (concept_id, answer_concept, creator, date_created, sort_weight, uuid)
VALUES (@contrast_agent_concept_id, 200202, @creator_user_id, NOW(), 2, UUID())
ON DUPLICATE KEY UPDATE concept_id = concept_id;

-- Answer 3: With IV contrast
INSERT INTO concept_answer (concept_id, answer_concept, creator, date_created, sort_weight, uuid)
VALUES (@contrast_agent_concept_id, 200203, @creator_user_id, NOW(), 3, UUID())
ON DUPLICATE KEY UPDATE concept_id = concept_id;

-- Answer 4: With oral contrast
INSERT INTO concept_answer (concept_id, answer_concept, creator, date_created, sort_weight, uuid)
VALUES (@contrast_agent_concept_id, 200204, @creator_user_id, NOW(), 4, UUID())
ON DUPLICATE KEY UPDATE concept_id = concept_id;

-- Answer 5: With IV and oral contrast
INSERT INTO concept_answer (concept_id, answer_concept, creator, date_created, sort_weight, uuid)
VALUES (@contrast_agent_concept_id, 200205, @creator_user_id, NOW(), 5, UUID())
ON DUPLICATE KEY UPDATE concept_id = concept_id;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Run this query to verify the answers were added correctly:
SELECT
  ca.concept_id,
  c.uuid as concept_uuid,
  cn.name as concept_name,
  ca.answer_concept,
  ans.uuid as answer_uuid,
  ans_cn.name as answer_name,
  ca.sort_weight
FROM concept_answer ca
JOIN concept c ON ca.concept_id = c.concept_id
JOIN concept_name cn ON c.concept_id = cn.concept_id AND cn.locale = 'en' AND cn.voided = 0 AND cn.concept_name_type = 'FULLY_SPECIFIED'
JOIN concept ans ON ca.answer_concept = ans.concept_id
JOIN concept_name ans_cn ON ans.concept_id = ans_cn.concept_id AND ans_cn.locale = 'en' AND ans_cn.voided = 0 AND ans_cn.concept_name_type = 'FULLY_SPECIFIED'
WHERE ca.concept_id = 200130
ORDER BY ca.sort_weight;

-- Expected output:
-- concept_id | concept_uuid                        | concept_name  | answer_concept | answer_uuid                        | answer_name                | sort_weight
-- 200130     | 0028c9c3-2bc2-4d75-9cbc-9d06f6951c2e | Contrast Agent | 200201         | 7101837b-96be-48be-bbdd-994b234ab262 | No contrast                | 1
-- 200130     | 0028c9c3-2bc2-4d75-9cbc-9d06f6951c2e | Contrast Agent | 200202         | 9ffad20c-1162-44ef-b551-d06844b33735 | With contrast              | 2
-- 200130     | 0028c9c3-2bc2-4d75-9cbc-9d06f6951c2e | Contrast Agent | 200203         | a0e3cc16-3c06-4142-a8f2-ec54ad4cf9db | With IV contrast           | 3
-- 200130     | 0028c9c3-2bc2-4d75-9cbc-9d06f6951c2e | Contrast Agent | 200204         | 97118fc7-09c3-4e45-a9cd-8025d8ab7b5c | With oral contrast         | 4
-- 200130     | 0028c9c3-2bc2-4d75-9cbc-9d06f6951c2e | Contrast Agent | 200205         | dea3def9-a593-4c43-8f8f-ab75d32ffc75 | With IV and oral contrast  | 5
