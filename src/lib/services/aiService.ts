import OpenAI from 'openai';
import { env } from '@/lib/env';
import { AppError } from '@/lib/utils/apiResponse';
import { PROMPTS } from '@/lib/prompts';

// Initialize OpenAI with fail-fast env check
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export class AIService {
    private static async callOpenAI(systemPrompt: string, userContent: string) {
        // MOCK MODE: If key is placeholder, return deterministic mock data
        if (env.OPENAI_API_KEY.includes('placeholder')) {
            console.warn('USING MOCK AI SERVICE');

            if (systemPrompt.includes('Document of Understanding')) {
                const inputSnippet = userContent.slice(0, 100).replace(/\n/g, ' ');

                // Heuristic: Extract sentences that look like requirements (contain 'shall', 'must', 'user can')
                const potentialReqs = userContent.split(/[.\n]+/)
                    .filter(line => /shall|must|can|should|users/i.test(line))
                    .map(line => line.trim())
                    .filter(line => line.length > 10)
                    .slice(0, 5);

                const dynamicReqs = potentialReqs.length > 0
                    ? potentialReqs.map((req, i) => `${i + 1}. **Requirement:** ${req}`).join('\n')
                    : '1. **Ingested Requirement:** ' + inputSnippet + '...';

                return `# Executive Summary
This is a MOCK Document of Understanding generated for testing purposes.
Based on input: "${inputSnippet}..."

# Functional Requirements
${dynamicReqs}

# Non-Functional Requirements
- Response time < 200ms.

# Assumptions & Risks
- AI model availability.`;
            }

            if (systemPrompt.includes('Requirements Traceability Matrix')) {
                return JSON.stringify([
                    { "reqId": "REQ-001", "description": "User Authentication: Users must be able to log in." },
                    { "reqId": "REQ-002", "description": "Dashboard: Users view a summary of projects." }
                ]);
            }

            if (systemPrompt.includes('Test Scenarios')) {
                return JSON.stringify([
                    { "title": "Verify Login Success", "steps": "1. Enter valid user. 2. Enter valid pass. 3. Submit." },
                    { "title": "Verify Login Failure", "steps": "1. Enter invalid user. 2. Submit." }
                ]);
            }

            if (systemPrompt.includes('Test Cases')) {
                return JSON.stringify([
                    {
                        "title": "Login with correct password",
                        "preconditions": "User exists",
                        "steps": "1. Input user\n2. Input pass",
                        "expectedResult": "Redirect to home"
                    }
                ]);
            }

            if (systemPrompt.includes('Playwright')) {
                return `import { test, expect } from '@playwright/test';

test('Login with correct password', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#username', 'user');
  await page.fill('#password', 'pass');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/home');
});`;
            }
        }

        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userContent },
                ],
                temperature: 0.2, // Low temperature for deterministic outputs
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) throw new AppError('INTERNAL_ERROR', 'AI returned empty response', 500);
            return content;
        } catch (error) {
            console.error('OpenAI Error:', error);
            throw new AppError('INTERNAL_ERROR', 'AI Service Unavailable', 503, error);
        }
    }

    static async generateDOU(requirements: string) {
        return this.callOpenAI(PROMPTS.ANALYST, requirements);
    }

    static async generateRTM(douContent: string) {
        const jsonStr = await this.callOpenAI(PROMPTS.ARCHITECT, douContent);
        try {
            // Basic cleanup to ensure valid JSON parsing if AI adds markdown ticks
            const cleaned = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleaned);
        } catch {
            throw new AppError('INTERNAL_ERROR', 'AI Generated Invalid JSON for RTM', 500);
        }
    }

    static async generateScenarios(rtmDescription: string) {
        const jsonStr = await this.callOpenAI(PROMPTS.ENGINEER_SCENARIOS, rtmDescription);
        try {
            const cleaned = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleaned);
        } catch {
            throw new AppError('INTERNAL_ERROR', 'AI Generated Invalid JSON for Scenarios', 500);
        }
    }

    static async generateTestCases(scenarioContext: string) {
        const jsonStr = await this.callOpenAI(PROMPTS.ENGINEER_CASES, scenarioContext);
        try {
            const cleaned = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleaned);
        } catch {
            throw new AppError('INTERNAL_ERROR', 'AI Generated Invalid JSON for Test Cases', 500);
        }
    }

    static async generateAutomatedTest(testCaseContext: string) {
        // Returns raw code string, no JSON parsing needed
        return this.callOpenAI(PROMPTS.ENGINEER_AUTO_TEST, testCaseContext);
    }
}
