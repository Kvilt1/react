from playwright.sync_api import sync_playwright, expect

def run(playwright):
    # Define a mobile viewport
    iphone_11 = playwright.devices['iPhone 11']
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(**iphone_11)
    page = context.new_page()

    try:
        # Navigate to the app
        page.goto("http://localhost:3000/")

        # Wait for the loading indicator to disappear
        loading_indicator = page.locator("text=Loading...")
        expect(loading_indicator).to_be_hidden(timeout=30000)

        # 1. Verify the conversation list is visible and take a screenshot
        expect(page.locator("div.w-full.md\\:w-\\[350px\\]")).to_be_visible(timeout=15000)
        page.screenshot(path="jules-scratch/verification/verification_list_view.png")

        # 2. Click the first conversation item and verify the chat view
        first_conversation = page.locator("div[role='button']").first
        first_conversation.click()

        # Wait for the chat header to be visible using the new test ID
        expect(page.locator("[data-testid='chat-header-title']")).to_be_visible(timeout=10000)
        page.screenshot(path="jules-scratch/verification/verification_chat_view.png")

        # 3. Click the back button and verify we return to the list
        back_button = page.get_by_label("Back to conversation list")
        back_button.click()

        expect(page.locator("div.w-full.md\\:w-\\[350px\\]")).to_be_visible(timeout=10000)
        page.screenshot(path="jules-scratch/verification/verification_back_to_list.png")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)