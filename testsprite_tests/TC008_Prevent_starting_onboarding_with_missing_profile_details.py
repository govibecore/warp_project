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
        
        # -> Click the 'Continue without an account' button to start the onboarding/profile setup flow.
        # Continue without an account button
        elem = page.get_by_role("button", name="Continue without an account")
        await elem.click(timeout=10000)
        
        # -> Click the 'Begin assessment' button to submit the profile form while leaving Name and School empty and observe validation feedback.
        # Begin assessment button
        elem = page.get_by_test_id("onboarding-submit")
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> A validation tooltip reading 'Please fill out this field.' appeared when submitting the empty profile form.
        await page.get_by_role("textbox", name="What should we call you?").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: The Name input field remains visible, indicating the form stayed on the profile step after submission.
        await expect(page.get_by_role("textbox", name="What should we call you?").nth(0)).to_be_visible(timeout=15000), "The Name input field remains visible, indicating the form stayed on the profile step after submission."
        
        # --> The assessment did not start and the profile form remained visible (the 'Begin assessment' button is still present).
        await page.get_by_test_id("onboarding-submit").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: The 'Begin assessment' button is still visible, showing the assessment flow did not begin.
        await expect(page.get_by_test_id("onboarding-submit").nth(0)).to_be_visible(timeout=15000), "The 'Begin assessment' button is still visible, showing the assessment flow did not begin."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    