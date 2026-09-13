import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:5173")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Start your assessment' button to begin onboarding.
        # Start your assessment button
        elem = page.get_by_test_id("landing-cta")
        await elem.click(timeout=10000)
        
        # -> Click the 'Continue without an account' button on the Get started page to begin onboarding as a new student.
        # Continue without an account button
        elem = page.get_by_role("button", name="Continue without an account")
        await elem.click(timeout=10000)
        
        # -> Fill 'Your full name' with 'Test Student', fill 'SCHOOL NAME' with 'Test School', then open the 'CLASS' dropdown.
        # Your full name text field
        elem = page.get_by_role("textbox", name="What should we call you?")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Test Student")
        
        # -> Fill 'Your full name' with 'Test Student', fill 'SCHOOL NAME' with 'Test School', then open the 'CLASS' dropdown.
        # e.g. Kendriya Vidyalaya text field
        elem = page.get_by_role("textbox", name="School Name")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Test School")
        
        # -> Fill 'Your full name' with 'Test Student', fill 'SCHOOL NAME' with 'Test School', then open the 'CLASS' dropdown.
        # Class 3 Class 4 Class 5 Class 6 Class 7 Class 8... dropdown
        elem = page.get_by_label("Class")
        await elem.click(timeout=10000)
        
        # -> Click the 'Begin assessment' button to proceed to the track selection / assessment flow.
        # Begin assessment button
        elem = page.get_by_test_id("onboarding-submit")
        await elem.click(timeout=10000)
        
        # -> Click the 'STEM Benchmark' card's 'Select Track' button to start the STEM assessment.
        # STEM Benchmark Evaluate your computational... button
        elem = page.get_by_role("button", name="STEM Benchmark Evaluate your")
        await elem.click(timeout=10000)
        
        # -> Click the 'Begin Assessment' button to start the STEM assessment and load the assessment flow.
        # Begin Assessment button
        elem = page.get_by_role("button", name="Begin Assessment")
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The assessment page is displayed (assessment controls visible).
        await page.get_by_role("button", name="Lock response").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: The 'Lock response' button is visible on the assessment page.
        await expect(page.get_by_role("button", name="Lock response").nth(0)).to_be_visible(timeout=15000), "The 'Lock response' button is visible on the assessment page."
        
        # --> A multiple-choice assessment item is displayed (options A–D visible).
        await page.get_by_role("radio", name="1, because $a^2 - b^2 = (a-b").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: A multiple-choice radio input (first option) is visible.
        await expect(page.get_by_role("radio", name="1, because $a^2 - b^2 = (a-b").nth(0)).to_be_visible(timeout=15000), "A multiple-choice radio input (first option) is visible."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    