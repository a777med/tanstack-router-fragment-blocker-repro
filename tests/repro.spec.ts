import { expect, test } from '@playwright/test'

// Expected behaviour: refusing a traversal (the blocker's "Stay here") keeps
// the user on the entry they were on, with their draft. These assertions fail
// on @tanstack/react-router 1.170.39 because the plain fragment link's history
// entry has no router state and is measured as index 0.
for (const direction of ['back', 'go(-2)'] as const) {
  test(`blocked ${direction} across a plain fragment entry stays put`, async ({
    page,
  }) => {
    const dialogs: Array<string> = []
    page.on('dialog', async (dialog) => {
      dialogs.push(dialog.type())
      await dialog.dismiss()
    })

    await page.goto('/')
    await page.getByRole('link', { name: 'Add history entry' }).click()
    await expect(page.getByRole('heading', { name: 'Step 1' })).toBeVisible()
    await page.getByRole('link', { name: 'Plain fragment link' }).click()
    await expect(page).toHaveURL('/?step=1#fragment')
    await page.getByLabel('Draft').fill('Unsaved draft')

    await page.getByRole('button', { name: `History ${direction}` }).click()
    await expect(page.getByText('Blocker status: blocked')).toBeVisible()
    await page.getByRole('button', { name: 'Stay here' }).click()

    await expect(page.getByText('Blocker status: idle')).toBeVisible()
    await expect(page).toHaveURL('/?step=1#fragment')
    await expect(page.getByRole('heading', { name: 'Step 1' })).toBeVisible()
    await expect(page.getByLabel('Draft')).toHaveValue('Unsaved draft')
    expect(dialogs).toEqual([])
  })
}
