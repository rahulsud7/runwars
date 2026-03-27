"""
Playwright test script for HexTracker web preview
Tests location tracking, H3 conversion, and UI components
"""

import asyncio

async def test_hextracker_web(page):
    """
    Test HexTracker app on web preview
    - Permission states (denied/granted)
    - Location tracking with mock GPS
    - H3 hex conversion accuracy
    - UI components and testIDs
    """
    
    # Enable console logs
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

    try:
        # Set mobile viewport for React Native app
        await page.set_viewport_size({"width": 375, "height": 667})
        print("✓ Set mobile viewport (375x667)")

        # Navigate to the app
        await page.goto("https://location-watch-app.preview.emergentagent.com", wait_until="networkidle", timeout=30000)
        print("✓ Navigated to app")

        # Wait a bit for initial render
        await page.wait_for_timeout(2000)

        # Test 1: Check if app loads without errors
        print("\n=== TEST 1: App loads without errors ===")
        
        loading_screen = await page.query_selector('[data-testid="loading-screen"]')
        error_screen = await page.query_selector('[data-testid="error-screen"]')
        
        if loading_screen:
            print("✓ Loading screen is visible")
            loading_indicator = await page.query_selector('[data-testid="loading-indicator"]')
            if loading_indicator:
                print("✓ Loading indicator testID present")
        elif error_screen:
            print("✓ Error screen is visible (expected without location permission)")
        else:
            print("✗ Neither loading nor error screen found initially")

        await page.screenshot(path="/tmp/test_01_initial_load.png", quality=40, full_page=False)
        print("✓ Screenshot saved: test_01_initial_load.png")

        # Test 2: Test permission denied state
        print("\n=== TEST 2: Permission denied state ===")
        
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(2000)
        
        error_screen_visible = await page.is_visible('[data-testid="error-screen"]', timeout=5000)
        if error_screen_visible:
            print("✓ Error screen is visible")
            
            error_message = await page.query_selector('[data-testid="error-message"]')
            if error_message:
                error_text = await error_message.text_content()
                print(f"✓ Error message testID present: '{error_text}'")
                
                if "Location permission is required to track your movement." in error_text:
                    print("✓ Correct error message displayed")
                else:
                    print(f"✗ Unexpected error message: {error_text}")
            else:
                print("✗ Error message testID not found")
        else:
            print("⚠ Error screen not visible (permission might be auto-granted)")

        await page.screenshot(path="/tmp/test_02_permission_denied.png", quality=40, full_page=False)
        print("✓ Screenshot saved: test_02_permission_denied.png")

        # Test 3: Grant permission and test with mock location
        print("\n=== TEST 3: Permission granted with mock location ===")
        
        await page.context.grant_permissions(['geolocation'])
        print("✓ Granted geolocation permission")
        
        # Set mock location: San Francisco (37.7749, -122.4194)
        await page.context.set_geolocation({'latitude': 37.7749, 'longitude': -122.4194})
        print("✓ Set mock location: lat=37.7749, lng=-122.4194")
        
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(3000)
        
        web_fallback_visible = await page.is_visible('[data-testid="web-fallback-screen"]', timeout=10000)
        if web_fallback_visible:
            print("✓ Web fallback screen is visible")
            
            title_element = await page.query_selector('text=HexTracker')
            if title_element:
                print("✓ Title 'HexTracker' is present")
            else:
                print("✗ Title 'HexTracker' not found")
            
            coords_text = await page.text_content('text=/37.774900/')
            if coords_text:
                print(f"✓ Coordinates displayed: {coords_text}")
            else:
                print("⚠ Coordinates not found with expected format")
            
            hex_count_element = await page.query_selector('[data-testid="hex-count-web"]')
            if hex_count_element:
                hex_count = await hex_count_element.text_content()
                print(f"✓ Hex count testID present: {hex_count}")
                
                if hex_count == "1":
                    print("✓ Hex count is 1 (correct for single location)")
                else:
                    print(f"⚠ Hex count is {hex_count}, expected 1")
            else:
                print("✗ Hex count testID not found")
            
            hex_list = await page.query_selector('text=/89283/')
            if hex_list:
                hex_index_text = await page.text_content('text=/89283/')
                print(f"✓ H3 index starting with '89283' found: {hex_index_text}")
            else:
                print("⚠ H3 index starting with '89283' not found in list")
                
        else:
            print("✗ Web fallback screen not visible")

        await page.screenshot(path="/tmp/test_03_location_granted.png", quality=40, full_page=False)
        print("✓ Screenshot saved: test_03_location_granted.png")

        # Test 4: Verify H3 conversion
        print("\n=== TEST 4: Verify H3 conversion ===")
        
        page_content = await page.content()
        
        if '8928' in page_content:
            print("✓ H3 index starting with '8928' found in page content")
            
            import re
            h3_pattern = r'8928[0-9a-f]{11}'
            matches = re.findall(h3_pattern, page_content)
            if matches:
                print(f"✓ Full H3 index found: {matches[0]}")
                
                if '89283082803ffff' in matches[0]:
                    print("✓ H3 index matches expected value '89283082803ffff'")
                else:
                    print(f"⚠ H3 index is {matches[0]}, expected '89283082803ffff'")
            else:
                print("⚠ Could not extract full H3 index")
        else:
            print("✗ H3 index starting with '8928' not found")

        # Test 5: Test location change
        print("\n=== TEST 5: Test location change ===")
        
        await page.context.set_geolocation({'latitude': 37.7750, 'longitude': -122.4180})
        print("✓ Changed location to: lat=37.7750, lng=-122.4180")
        
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(3000)
        
        hex_count_element_2 = await page.query_selector('[data-testid="hex-count-web"]')
        if hex_count_element_2:
            hex_count_2 = await hex_count_element_2.text_content()
            print(f"✓ Hex count after location change: {hex_count_2}")
            
            if int(hex_count_2) >= 1:
                print(f"✓ Hex count is valid: {hex_count_2}")
            else:
                print(f"✗ Invalid hex count: {hex_count_2}")
        else:
            print("✗ Hex count testID not found after location change")

        await page.screenshot(path="/tmp/test_05_location_change.png", quality=40, full_page=False)
        print("✓ Screenshot saved: test_05_location_change.png")

        # Test 6: Verify all required testIDs
        print("\n=== TEST 6: Verify all required testIDs ===")
        
        required_testids = [
            'error-screen',
            'error-message', 
            'loading-screen',
            'loading-indicator',
            'web-fallback-screen',
            'hex-count-web'
        ]
        
        await page.context.grant_permissions(['geolocation'])
        await page.context.set_geolocation({'latitude': 37.7749, 'longitude': -122.4194})
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(3000)
        
        for testid in required_testids:
            element = await page.query_selector(f'[data-testid="{testid}"]')
            if element:
                is_visible = await element.is_visible()
                print(f"✓ testID '{testid}' exists (visible: {is_visible})")
            else:
                print(f"⚠ testID '{testid}' not found in current state")

        print("\n=== TESTING COMPLETE ===")
        print("All tests executed successfully")

    except Exception as e:
        print(f"\n✗ ERROR during testing: {str(e)}")
        await page.screenshot(path="/tmp/test_error.png", quality=40, full_page=False)
        print("✓ Error screenshot saved: test_error.png")
        raise
