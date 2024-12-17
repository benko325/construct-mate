import { test, expect } from '@playwright/test';

let cookie;

test.describe("Login Page", () => {
    test('should display the correct title', async ({ page }) => {
        await page.goto('/login');
        await expect(page).toHaveTitle("Construct Mate");
    });
    test('should render login form with email and password fields', async ({ page }) => {
        await page.goto('/login');
    
        await expect(page.locator('input[placeholder="Zadajte email"]')).toBeVisible();
        await expect(page.locator('input[placeholder="Zadajte heslo"]')).toBeVisible();
    });
    test('should display error message for form submission for non registered user', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[placeholder="Zadajte email"]', 'test@example.com');
        await page.fill('input[placeholder="Zadajte heslo"]', 'Password123');
    
        await page.click('button[type="submit"]');
        
        await expect(page.locator('.text-red-500')).toBeVisible();
    });
    test('should disable submit button when submitting', async ({ page }) => {
        await page.goto('/login');
    
        await page.fill('input[placeholder="Zadajte email"]', 'test@example.com');
        await page.fill('input[placeholder="Zadajte heslo"]', 'Password123');
    
        await page.click('button[type="submit"]');
    
        await expect(page.locator('button[type="submit"]')).toBeDisabled();
    });
    test('should display error for invalid field formats', async ({ page }) => {
        await page.goto('/login');
    
        await page.fill('input[placeholder="Zadajte email"]', 'invalid-email');
        await page.fill('input[placeholder="Zadajte heslo"]', '');
    
        await page.click('button[type="submit"]');
    
        const emailError = page.locator('p#\\:r1\\:-form-item-message');
        await expect(emailError).toBeVisible();
        await expect(emailError).toHaveText('Neplatný tvar emailovej adresy');

        const passwordError = page.locator('p#\\:r3\\:-form-item-message');
        await expect(passwordError).toBeVisible();
        await expect(passwordError).toHaveText('Heslo musí mať aspoň 6 znakov');
    });
    test('should navigate to registration page when button to create a new account is clicked', async ({ page }) => {
        await page.goto('/login');
    
        await page.click('text=Vytvoriť nový účet');
        
        await expect(page).toHaveURL('/register');
    });
    test('should navigate to dashboard after login', async ({ page }) => {
        await page.goto('/login');
    
        // suppose that the user is already made in app
        await page.fill('input[name="email"]', 'playwright@test.com');
        await page.fill('input[name="password"]', '1Astring');
        await page.click('button[type="submit"]');

        await page.waitForURL('/dashboard');
        cookie = (await page.context().cookies()).find(c => c.name == 'cm-jwt');
        console.log(cookie);
        expect(cookie).toBeDefined();

        await expect(page).toHaveURL('/dashboard');
    });
});

test.describe('Protected Routes', () => {
    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        
        await page.goto('/login');

        await page.fill('input[name="email"]', 'playwright@test.com');
        await page.fill('input[name="password"]', '1Astring');
        await page.click('button[type="submit"]');

        await page.waitForURL('/dashboard');
        cookie = (await page.context().cookies()).find(c => c.name == 'cm-jwt');
    });

    test('should access protected dashboard route', async ({ page, context }) => {
        await context.addCookies([cookie]);
        await page.goto('/dashboard');

        await expect(page).toHaveURL('/dashboard');
        const navElement = page.locator('nav');
        await expect(navElement).toBeVisible();
    });

    test('should navigate to profile page when "Môj profil" button is clicked', async ({ page, context }) => {
        await context.addCookies([cookie]);
        await page.goto('/dashboard');

        await page.click('button:has-text("Môj profil")');
    
        await expect(page).toHaveURL('/profile');

        await expect(page.locator('text=Meno a email')).toHaveClass(/.*active/);

        const firstNameField = page.locator('input[name="firstName"]');
        await expect(firstNameField).toBeVisible();

        const lastNameField = page.locator('input[name="lastName"]');
        await expect(lastNameField).toBeVisible();

        const emailField = page.locator('input[name="email"]');
        await expect(emailField).toBeVisible();

        const updateNameEmailButton = page.locator('button:has-text("Aktualizovať údaje")');
        await expect(updateNameEmailButton).toBeVisible();
        await expect(updateNameEmailButton).not.toBeDisabled();

        // Switch to the "Heslo" tab
        await page.click('text=Heslo');

        const oldPasswordField = page.locator('input[name="oldPassword"]');
        await expect(oldPasswordField).toBeVisible();

        const newPasswordField = page.locator('input[name="newPassword"]');
        await expect(newPasswordField).toBeVisible();

        const confirmNewPasswordField = page.locator('input[name="newPasswordAgain"]');
        await expect(confirmNewPasswordField).toBeVisible();
        
        const updatePasswordButton = page.locator('button:has-text("Aktualizovať heslo")');
        await expect(updatePasswordButton).toBeVisible();
        await expect(updatePasswordButton).not.toBeDisabled();
    });

    test('should display the form when "Vytvoriť novú stavbu" button is clicked', async ({ page, context }) => {
        await context.addCookies([cookie]);
        await page.goto('/dashboard');

        await page.click('button:has-text("Vytvoriť novú stavbu")');

        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible();

        const nameInput = dialog.locator('input[placeholder="Novostavba Myjava"]');
        const descriptionInput = dialog.locator('textarea[placeholder="Novostavba na Staromyjavskej ulici, ..."]');
        const startDateInput = dialog.locator('input[type="date"]').nth(0);
        const endDateInput = dialog.locator('input[type="date"]').nth(1);
        const submitButton = dialog.locator('button:has-text("Vytvoriť stavbu")');

        await expect(nameInput).toBeVisible();
        await expect(descriptionInput).toBeVisible();
        await expect(startDateInput).toBeVisible();
        await expect(endDateInput).toBeVisible();
        await expect(submitButton).toBeVisible();
    });

    test('should close dialog when "Vytvoriť stavbu" form is correctly submitted', async ({ page, context }) => {
        await context.addCookies([cookie]);
        await page.goto('/dashboard');
    
        await page.click('button:has-text("Vytvoriť novú stavbu")');
    
        const dialog = page.getByRole("dialog");
    
        const nameInput = dialog.locator('input[placeholder="Novostavba Myjava"]');
        const descriptionInput = dialog.locator('textarea[placeholder="Novostavba na Staromyjavskej ulici, ..."]');
        const startDateInput = dialog.locator('input[type="date"]').nth(0);
        const endDateInput = dialog.locator('input[type="date"]').nth(1);
        const submitButton = dialog.locator('button:has-text("Vytvoriť stavbu")');
    

        await nameInput.fill('Novostavba Myjava');
        await descriptionInput.fill('Novostavba na Staromyjavskej ulici, ktorá bude dokončená v roku 2024.');
        await startDateInput.fill('2024-01-01');
        await endDateInput.fill('2024-12-31');
    
        await submitButton.click();
    
        await expect(dialog).toBeHidden({ timeout: 5000 });
    });

    test('should open the construction after clicking "Otvorit" button and edit dates and name with description', async ({ page, context }) => {
        await context.addCookies([cookie]);
        await page.goto('/dashboard');
    
        await page.locator('button:has-text("Otvoriť")').first().click();

        await page.click('button:has-text("Upraviť dátum začiatku a konca")');
        const datesDialog = page.getByRole("dialog");
        const startDateInput = datesDialog.locator('input[type="date"]').nth(0);
        const endDateInput = datesDialog.locator('input[type="date"]').nth(1);
        const editDatesButton = datesDialog.locator('button:has-text("Upraviť dátum začiatku a konca stavby")');

        await startDateInput.fill('2024-01-01');
        await endDateInput.fill('2025-01-31');

        await editDatesButton.click();

        await expect(datesDialog).toBeHidden({ timeout: 5000 });

        await page.click('button:has-text("Upraviť názov a opis")');
        const nameDescriptionDialog = page.getByRole("dialog");
        const nameInput = nameDescriptionDialog.locator('input[name="name"]');
        const descriptionInput = nameDescriptionDialog.locator('textarea[name="description"]');
        const editNameDescriptionButton = datesDialog.locator('button:has-text("Upraviť názov a opis stavby")');

        await nameInput.fill("New name");
        await descriptionInput.fill("New description");

        await editNameDescriptionButton.click();

        await expect(nameDescriptionDialog).toBeHidden({ timeout: 5000 });
    });

    test('should open dialog when "Vytvoriť denník" button is clicked and create a new one on submit', async ({ page, context }) => {
        await context.addCookies([cookie]);
        await page.goto('/dashboard');
    
        await page.locator('button:has-text("Otvoriť")').first().click();

        await page.click('button:has-text("Vytvoriť denník")');
        const createDiaryDialog = page.getByRole("dialog");

        // check the fields
        await expect(createDiaryDialog.locator('input[type="date"]').nth(0)).toBeVisible();
        await expect(createDiaryDialog.locator('input[type="date"]').nth(1)).toBeVisible();
        await expect(createDiaryDialog.locator('input[placeholder="Názov stavby"]')).toBeVisible();
        await expect(createDiaryDialog.locator('input[placeholder="Adresa stavby"]')).toBeVisible();
        await expect(createDiaryDialog.locator('input[placeholder="Meno stavbyvedúceho"]')).toBeVisible();
        await expect(createDiaryDialog.locator('input[placeholder="Meno stavebného dozoru"]')).toBeVisible();
        await expect(createDiaryDialog.locator('input[placeholder="Stavebné povolenie"]')).toBeVisible();
        await expect(createDiaryDialog.locator('input[placeholder="Meno (názov) investora"]')).toBeVisible();
        await expect(createDiaryDialog.locator('input[placeholder="Meno (názov) realizátora"]')).toBeVisible();

        // fill in the form and submit it
        await createDiaryDialog.locator('input[placeholder="Názov stavby"]').fill('Novostavba Myjava');
        await createDiaryDialog.locator('input[placeholder="Adresa stavby"]').fill('Staromyjavska 123');
        await createDiaryDialog.locator('input[placeholder="Meno stavbyvedúceho"]').fill('Jozef Novak');
        await createDiaryDialog.locator('input[placeholder="Meno stavebného dozoru"]').fill('Miroslav Kucera');
        await createDiaryDialog.locator('input[placeholder="Stavebné povolenie"]').fill('SP-12345');
        await createDiaryDialog.locator('input[placeholder="Meno (názov) investora"]').fill('Investor s.r.o.');
        await createDiaryDialog.locator('input[placeholder="Meno (názov) realizátora"]').fill('Realizator a.s.');

        await createDiaryDialog.locator('button:has-text("Vytvoriť nový denník")').click();

        await expect(createDiaryDialog).toBeHidden({ timeout: 5000 });

        // open the diary
        await page.click('button:has-text("Otvoriť denník")');
        await page.waitForTimeout(5000);

        const text = await page.locator('body').textContent();
        expect(text).toContain('Počasie');
        expect(text).toContain('Pracovníci');
        expect(text).toContain('Stroje');
        expect(text).toContain('Práca');
        expect(text).toContain('Ostatné');
    });
});

test.describe("Registration Page", () => {
    test('should display the correct title', async ({ page }) => {
        await page.goto('/register');
        await expect(page).toHaveTitle("Construct Mate");
    });
    test('should render register form with correct fields', async ({ page }) => {
        await page.goto('/register');
    
        await expect(page.locator('input[placeholder="Zadajte meno"]')).toBeVisible();
        await expect(page.locator('input[placeholder="Zadajte priezvisko"]')).toBeVisible();
        await expect(page.locator('input[placeholder="Zadajte email"]')).toBeVisible();
        await expect(page.locator('input[placeholder="Zadajte heslo"]')).toBeVisible();
        await expect(page.locator('input[placeholder="Zadajte heslo znova"]')).toBeVisible();
    });
    test('should display error for invalid field formats', async ({ page }) => {
        await page.goto('/register');
    
        await page.fill('input[placeholder="Zadajte meno"]', '');
        await page.fill('input[placeholder="Zadajte priezvisko"]', '');
        await page.fill('input[placeholder="Zadajte email"]', '');
        await page.fill('input[placeholder="Zadajte heslo"]', '');
        await page.fill('input[placeholder="Zadajte heslo znova"]', '');
    
        await page.click('button[type="submit"]');
    
        const nameError = page.locator('p#\\:r1\\:-form-item-message');
        await expect(nameError).toBeVisible();
        await expect(nameError).toHaveText('Meno musí obsahovať aspoň 1 znak');

        const surnameError = page.locator('p#\\:r3\\:-form-item-message');
        await expect(surnameError).toBeVisible();
        await expect(surnameError).toHaveText('Priezvisko musí obsahovať aspoň 1 znak');

        const emailError = page.locator('p#\\:r5\\:-form-item-message');
        await expect(emailError).toBeVisible();
        await expect(emailError).toHaveText('Neplatný tvar emailovej adresy');

        const passwordError = page.locator('p#\\:r7\\:-form-item-message');
        await expect(passwordError).toBeVisible();
        await expect(passwordError).toHaveText('Heslo musí mať aspoň 6 znakov');
    });
    test('should navigate to login page when button to login into existing account is clicked', async ({ page }) => {
        await page.goto('/register');
    
        await page.click('text=Prihlásiť sa do existujúceho účtu');
        
        await expect(page).toHaveURL('/login');
    });
});
