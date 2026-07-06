-- ============================================================================
-- SQL Script: Rollback Contrast Agent Answers
-- ============================================================================
-- Purpose: Remove contrast agent answers (use with caution!)
-- Database: epcare
-- Author: Generated for emr-esm-orders implementation
-- Date: 2026-07-03
--
-- WARNING: This script will DELETE the contrast agent answers and concepts.
-- Only run this if you need to rollback the add-contrast-agent-answers.sql script.
--
-- Usage:
-- mysql -u openmrs -p epcare < rollback-contrast-agent-answers.sql
-- ============================================================================

-- Set variables
SET @contrast_agent_concept_id = 200130;

-- ============================================================================
-- PART 1: Remove Answers from Contrast Agent Concept
-- ============================================================================

DELETE FROM concept_answer
WHERE concept_id = @contrast_agent_concept_id
  AND answer_concept IN (200201, 200202, 200203, 200204, 200205);

-- ============================================================================
-- PART 2: Remove Answer Concepts
-- ============================================================================

-- Delete concept names first
DELETE FROM concept_name
WHERE concept_id IN (200201, 200202, 200203, 200204, 200205);

-- Delete concepts
DELETE FROM concept
WHERE concept_id IN (200201, 200202, 200203, 200204, 200205);

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Run this query to verify the answers were removed:
SELECT COUNT(*) as remaining_answers
FROM concept_answer
WHERE concept_id = 200130;

-- Expected output: 0 (no remaining answers from this script)
