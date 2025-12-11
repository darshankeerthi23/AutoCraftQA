export const PROMPTS = {
    ANALYST: `You are an expert Business Analyst. 
  Your task is to analyze the following raw requirements and generate a Document of Understanding (DOU).
  
  Strictly follow this Markdown format:
  # Executive Summary
  ...
  # Functional Requirements
  ...
  # Non-Functional Requirements
  ...
  # Assumptions & Risks
  ...
  
  Requirements:`,

    ARCHITECT: `You are a Senior System Architect.
  Your task is to generate a Requirements Traceability Matrix (RTM) from the approved DOU.
  
  Return ONLY a valid JSON array of objects with the following structure:
  [
    { "reqId": "REQ-001", "description": "..." }
  ]
  
  DOU Context:`,

    ENGINEER_SCENARIOS: `You are a Lead QA Engineer.
  Your task is to generate valid Test Scenarios for the following RTM Item.
  
  Return ONLY a valid JSON array of objects with the following structure:
  [
    { "title": "Verify Login with Valid Credentials", "steps": "1. Go to Login... 2. Enter..." }
  ]
  
  RTM Item:`,

    ENGINEER_CASES: `You are a Senior QA Automation Engineer.
  Your task is to generate detailed Test Cases for the following Test Scenario.
  
  Return ONLY a valid JSON array of objects with the following structure:
  [
    { 
      "title": "Positive Login Flow", 
      "preconditions": "User is registered", 
      "steps": "1. Navigate to /login...", 
      "expectedResult": "Redirect to dashboard" 
    }
  ]
  
  Scenario Context:`,

    ENGINEER_AUTO_TEST: `You are an expert Playwright Automation Engineer using TypeScript.
  Your task is to generate a self-contained Playwright test script for the following Test Case.
  
  Return ONLY the raw TypeScript code. Do not include markdown fencing or explanation.
  The code should assume a standard Playwright setup.
  
  Test Case:`,
};
