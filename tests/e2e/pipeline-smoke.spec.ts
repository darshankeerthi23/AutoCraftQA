import { test, expect } from '@playwright/test';

const PROJECT_NAME = `E2E Smoke ${Date.now()}`;

test('AutoCraft Pipeline Smoke Test', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes for Real AI calls
    // 1. Home Page: Create Project
    await page.goto('/');
    await expect(page).toHaveTitle(/AutoCraft QA/);

    await page.getByTestId('project-name').fill(PROJECT_NAME);
    await page.getByTestId('create-project').click();

    // Validate navigation
    await expect(page).toHaveURL(/\/projects\/.+/);
    await expect(page.getByText(PROJECT_NAME)).toBeVisible();

    // 2. Ingest Asset
    // Since the input is a textarea in the current UI, not a file input based on RTMView inspection?
    // User prompt said "Upload tests/fixtures/requirements.txt via the ingest UI"
    // But checking page source, I see a textarea: `placeholder="Paste requirements here..."` and `data-testid="asset-upload"`
    // If the user *meant* file upload but implemented text paste, I should use the textarea.
    // Wait, let's double check data-testid placement.
    // In `src/app/projects/[id]/page.tsx`, `data-testid="asset-upload"` was added to `<textarea ... />`.
    // So I will fill the textarea using the content of the fixture.

    const fixtureContent = `System shall support user login using username and password.
System shall lock account after 3 failed attempts.`;

    await page.getByTestId('asset-upload').fill(fixtureContent);

    // Wait for the ingest API call to finish
    const ingestPromise = page.waitForResponse(response =>
        response.url().includes('/ingest') && response.ok()
    );
    await page.getByRole('button', { name: 'Upload Asset' }).click();
    await ingestPromise;

    // Wait for asset to appear in list
    await expect(page.getByText('Requirement:')).toBeVisible();

    // 3. Generate DOU
    const douPromise = page.waitForResponse(response =>
        response.url().includes('/dou') && response.ok()
    );
    await page.getByTestId('generate-dou').click();
    await douPromise;

    // Wait for DOU output
    const douOutput = page.getByTestId('dou-output');
    await expect(douOutput).toBeVisible({ timeout: 15000 });
    await expect(douOutput).toContainText('Functional Requirements');

    // Approve DOU
    await page.getByText('Approve DOU').click();
    await expect(page.getByText('APPROVED')).toBeVisible();

    // 4. Generate RTM
    const rtmPromise = page.waitForResponse(response =>
        response.url().includes('/rtm') && response.ok()
    );
    await page.getByTestId('generate-rtm').click();
    await rtmPromise;

    const rtmOutput = page.getByTestId('rtm-output');
    await expect(rtmOutput).toBeVisible({ timeout: 15000 });
    await expect(rtmOutput).toContainText('REQ-'); // Check for Requirement ID

    // 5. Generate Scenarios
    // We might have multiple buttons, click the first one available
    const scenariosPromise = page.waitForResponse(response =>
        response.url().includes('/scenarios') && response.ok()
    );
    await page.getByTestId('generate-scenarios').first().click();
    await scenariosPromise;

    const scenariosOutput = page.getByTestId('scenarios-output').first();
    await expect(scenariosOutput).toBeVisible({ timeout: 15000 });
    await expect(scenariosOutput).toContainText('Scenario:');

    // 6. Generate Test Cases
    const casesPromise = page.waitForResponse(response =>
        response.url().includes('/cases') && response.ok()
    );
    await page.getByTestId('generate-cases').first().click();
    await casesPromise;

    const casesOutput = page.getByTestId('cases-output').first();
    await expect(casesOutput).toBeVisible({ timeout: 15000 });
    await expect(casesOutput).toContainText('Steps:');

    // 7. Generate Automated Tests
    const autoPromise = page.waitForResponse(response =>
        response.url().includes('/automated-tests') && response.ok()
    );
    await page.getByTestId('generate-automated-tests').first().click();
    await autoPromise;

    const autoTestOutput = page.getByTestId('automated-tests-output').first();
    await expect(autoTestOutput).toBeVisible({ timeout: 15000 });
    await expect(autoTestOutput).toContainText('import { test'); // Playwright code
});
