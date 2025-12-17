import { test, expect } from '@playwright/test';

const PROJECT_NAME = `Delete Me ${Date.now()}`;

test('Project Soft Delete Flow', async ({ page }) => {
    // 1. Create Project
    await page.goto('/');
    await page.getByTestId('project-name').fill(PROJECT_NAME);
    await page.getByTestId('create-project').click();

    // Wait to see dashboard (implies creation success)
    await expect(page).toHaveURL(/\/projects\/.+/);

    // 2. Go back to Home
    await page.getByText('Back').click();
    await expect(page).toHaveURL('/');

    // 3. Verify Project is in List
    const projectCard = page.getByText(PROJECT_NAME).first();
    await expect(projectCard).toBeVisible();

    // 4. Click Delete
    page.on('dialog', dialog => dialog.accept()); // Helper to auto-accept confirm dialog
    await page.getByTestId('delete-project').first().click();

    // 5. Verify Project is Gone
    await expect(page.getByText(PROJECT_NAME)).not.toBeVisible();
});
