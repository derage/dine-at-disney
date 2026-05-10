"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaywrightManager = void 0;
const playwright_1 = require("playwright");
const fs = __importStar(require("fs"));
const resort_config_1 = require("./resort-config");
class PlaywrightManager {
    browser = null;
    context = null;
    page = null;
    capturedHeaders = null;
    showBrowser = false;
    resort = 'dlr';
    get config() {
        return resort_config_1.RESORT_CONFIG[this.resort];
    }
    async init(print, options) {
        if (this.page)
            return; // Already initialized
        this.showBrowser = options?.showBrowser ?? false;
        this.resort = options?.resort ?? 'dlr';
        const authFile = this.config.authFile;
        const hasAuth = fs.existsSync(authFile);
        try {
            if (hasAuth) {
                print.info('Loading saved Disney session...');
                await this.launchBrowser(print);
                const valid = await this.validateSession(print);
                if (!valid) {
                    print.warning('Saved session has expired. Re-authenticating...');
                    await this.close();
                    fs.unlinkSync(authFile);
                    await this.interactiveLogin(print);
                    await this.launchBrowser(print);
                }
            }
            else {
                await this.interactiveLogin(print);
                await this.launchBrowser(print);
            }
        }
        catch (e) {
            if (e?.message?.includes("Executable doesn't exist")) {
                print.error('Playwright browser not found. Run the following command and try again:');
                print.info('  npx playwright install chromium');
                process.exit(1);
            }
            throw e;
        }
    }
    async interactiveLogin(print) {
        print.warning('No valid Disney session found. Opening a browser for you to log in...');
        print.info('Please log in to your MyDisney account in the browser window.');
        print.info('The browser will close automatically once login is detected.');
        const browser = await playwright_1.chromium.launch({ headless: false });
        const context = await browser.newContext();
        const page = await context.newPage();
        try {
            await page.goto(`${this.config.baseUrl}/login/`, { waitUntil: 'domcontentloaded' });
            print.info('Please complete the login in the browser window...');
            let loggedIn = false;
            while (!loggedIn) {
                await page.waitForTimeout(2000);
                try {
                    const url = page.url().toLowerCase();
                    loggedIn =
                        url.includes(this.config.domain) &&
                            !url.includes('/login') &&
                            !url.includes('registerdisney') &&
                            !url.includes('authz');
                }
                catch {
                    // Page might be navigating, ignore errors
                }
            }
            print.info('Login detected! Saving session...');
            await page.waitForTimeout(5000);
            await context.storageState({ path: this.config.authFile });
            print.success('Session saved successfully!');
        }
        catch (e) {
            print.error('Login process was interrupted.');
            process.exit(-1);
        }
        finally {
            await browser.close();
        }
    }
    async launchBrowser(print) {
        this.browser = await playwright_1.chromium.launch({ headless: false });
        this.context = await this.browser.newContext({
            storageState: this.config.authFile,
        });
        this.page = await this.context.newPage();
        // Minimize the browser window via CDP so it doesn't steal focus
        if (!this.showBrowser) {
            const cdp = await this.page.context().newCDPSession(this.page);
            const { windowId } = await cdp.send('Browser.getWindowForTarget');
            await cdp.send('Browser.setWindowBounds', {
                windowId,
                bounds: { windowState: 'minimized' },
            });
        }
        // Capture headers from availability API requests for use in retriggerSearch()
        this.page.on('request', (req) => {
            if (req.url().includes('/dine-res/api/availability/')) {
                this.capturedHeaders = req.headers();
            }
        });
        // Navigate to the availability search page
        if (print)
            print.info('Loading availability search page...');
        await this.page.goto(`${this.config.baseUrl}/dine-res/availability/`, {
            waitUntil: 'commit',
            timeout: 30000,
        });
        // Wait for the Angular app to bootstrap and Akamai sensors to settle
        if (print)
            print.info('Waiting for page to initialize...');
        await this.page.waitForTimeout(10000);
        if (print)
            print.info('Page ready.');
    }
    async validateSession(print) {
        if (!this.page)
            return false;
        try {
            const currentUrl = this.page.url();
            print.info(`  Browser at: ${currentUrl}`);
            if (currentUrl.includes('login') || currentUrl.includes('registerdisney')) {
                return false;
            }
            return currentUrl.includes(this.config.domain);
        }
        catch {
            return false;
        }
    }
    /**
     * Search availability by interacting with the dine-res Angular app UI.
     * Sets party size and date, clicks search, and intercepts the API response.
     */
    async searchAvailability(partySize, date, print) {
        if (!this.page) {
            throw new Error('Playwright not initialized. Call init() first.');
        }
        try {
            // Wait for Akamai "Processing Request" overlay to clear
            const waitingRoom = this.page.locator('#sec-overlay');
            if (await waitingRoom.isVisible({ timeout: 10000 }).catch(() => false)) {
                if (print)
                    print.info('  Waiting room detected. Waiting for it to clear...');
                await waitingRoom.waitFor({ state: 'hidden', timeout: 60000 });
            }
            await this.page.waitForSelector('.collapsible-panel.party-size .cta-heading', {
                state: 'visible',
                timeout: 15000
            });
            const availabilityPromise = this.page.waitForResponse((res) => res.url().includes('/dine-res/api/availability/'), { timeout: 30000 }).catch(() => null);
            // 1. Select Party Size
            if (print)
                print.info(`Setting party size to ${partySize}...`);
            const partyBtn = this.page.locator(`#count-selector${partySize}`);
            const partyHeading = this.page.locator('.collapsible-panel.party-size .cta-heading');
            if (await partyHeading.getAttribute('aria-expanded') !== 'true') {
                await partyHeading.click({ force: true });
                await this.page.waitForTimeout(1000);
            }
            await partyBtn.waitFor({ state: 'visible', timeout: 5000 });
            await partyBtn.click({ force: true });
            await this.page.waitForTimeout(1000);
            // 2. Select Date
            if (print)
                print.info(`Setting date to ${date}...`);
            const dateHeading = this.page.locator('.collapsible-panel.date .cta-heading');
            if (await dateHeading.getAttribute('aria-expanded') !== 'true') {
                await dateHeading.click({ force: true });
                await this.page.waitForTimeout(1000);
            }
            // Disney's `dpep-date-range-calendar` widget renders TWO elements with
            // the same `data-date` for some days:
            //   1. A real day cell:    <span class="date-day"  data-date="YYYY-MM-DD"> 26 </span>
            //   2. A "phantom" marker: <div  class="old-day"   data-date="YYYY-MM-DD"></div>
            // The phantom is a zero-sized placeholder used internally by the
            // range-calendar component (likely a leftover from when this widget is
            // configured as a hotel-style date range picker; see the `cell-0-0`
            // and `not-in-month` classes). It comes BEFORE the real cell in DOM
            // order, so `[data-date="..."].first()` picks the phantom — which has
            // 0x0 dimensions and `aria-disabled="true"` on its <td> — making
            // `isVisible()` return false and the loop pointlessly click "Next
            // Month" past the actual target. Affects roughly the last week of
            // every visible month.
            //
            // Targeting `span.date-day[data-date="..."]` selects only the real
            // day cell. The phantom is a <div class="old-day">, so this is an
            // unambiguous structural distinction.
            const dateLoc = this.page.locator(`span.date-day[data-date="${date}"]`).first();
            let monthClicks = 0;
            while (!(await dateLoc.isVisible()) && monthClicks < 12) {
                const nextMonthBtn = this.page.locator('.collapsible-panel.date button[name="Next"][aria-label="Next Month"]').first();
                if (await nextMonthBtn.isVisible()) {
                    if (await nextMonthBtn.isDisabled())
                        break;
                    await nextMonthBtn.click({ force: true });
                    await this.page.waitForTimeout(1500);
                    monthClicks++;
                }
                else {
                    break;
                }
            }
            // Use waitFor instead of isVisible() so we tolerate residual calendar animation
            const dateVisible = await dateLoc.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false);
            if (!dateVisible) {
                throw new Error(`Date ${date} is not available to select. It might be too far in the future or past.`);
            }
            await dateLoc.click({ force: true });
            await this.page.waitForTimeout(1000);
            const dateNextBtn = this.page.locator('#btnCancel');
            if (await dateNextBtn.isVisible()) {
                await dateNextBtn.click({ force: true });
                await this.page.waitForTimeout(1000);
            }
            // 3. Select Time
            const timeHeading = this.page.locator('.collapsible-panel.time .cta-heading');
            if (await timeHeading.getAttribute('aria-expanded') !== 'true') {
                await timeHeading.click({ force: true });
                await this.page.waitForTimeout(1000);
            }
            const timeBtn = this.page.locator('button[id="unique_id_time_All Day"]');
            if (await timeBtn.isVisible()) {
                await timeBtn.click({ force: true });
                await this.page.waitForTimeout(1000);
            }
            // 4. Click Next on Time panel
            const timeNextBtn = this.page.locator('wdpr-button#timeSearchButton');
            await timeNextBtn.waitFor({ state: 'visible', timeout: 5000 });
            await timeNextBtn.click({ force: true });
            // 5. Click Done on Location panel — wait for it to appear after the time step advances
            if (print)
                print.info('Clicking search...');
            const locationBtn = this.page.locator('button#btnLocationDone').first();
            await locationBtn.waitFor({ state: 'visible', timeout: 5000 });
            await locationBtn.click({ force: true });
            await this.page.waitForTimeout(1000);
            if (print)
                print.info('Waiting for availability results...');
            const response = await availabilityPromise;
            if (!response) {
                if (print)
                    print.warning(`Availability API timed out.`);
                return null;
            }
            if (response.status() !== 200) {
                if (print)
                    print.warning(`Availability API returned ${response.status()}`);
                return null;
            }
            return await response.json();
        }
        catch (e) {
            if (print)
                print.info(`  Error during search: ${e?.message?.substring(0, 150)}`);
            return null;
        }
    }
    /**
     * Make a single in-page fetch to the availability API using captured headers.
     * Returns the parsed JSON, or an object with { error, status } on failure.
     */
    async fetchAvailability(apiUrl, headers) {
        return this.page.evaluate(async ({ url, hdrs }) => {
            try {
                const res = await fetch(url, {
                    credentials: 'include',
                    headers: hdrs,
                });
                if (!res.ok) {
                    return { error: true, status: res.status };
                }
                return await res.json();
            }
            catch (e) {
                return { error: true, message: e?.message };
            }
        }, { url: apiUrl, hdrs: headers });
    }
    /**
     * Re-trigger a search by calling the availability API directly via fetch()
     * inside the page's JavaScript context, replaying the same headers that the
     * Angular app used during the initial search.
     *
     * If the fetch returns 428 (Akamai bot challenge), we navigate back to the
     * availability form and do a full UI-driven search to reset Akamai's state.
     * This captures fresh headers for subsequent in-page fetches.
     */
    async retriggerSearch(partySize, date, print) {
        if (!this.page)
            return null;
        if (!this.capturedHeaders) {
            if (print)
                print.warning('No captured headers from initial search. Falling back to full search.');
            return this.searchAvailability(partySize, date, print);
        }
        try {
            if (print)
                print.info('Fetching availability via in-page API call...');
            const apiUrl = `/dine-res/api/availability/${partySize}/${date},${date}/00:00:00,23:59:59?trim=facets,media,webLinks,mediaGalleries,sortProductName&trimExclude=dining-events,diningEvent`;
            const headers = {};
            const headerKeys = [
                'authorization',
                'x-correlation-id',
                'x-conversation-id',
                'x-function-name',
                'x-disney-internal-dine-vas-365',
                'x-disney-internal-dine-vas-eks',
                'accept',
            ];
            for (const key of headerKeys) {
                if (this.capturedHeaders[key]) {
                    headers[key] = this.capturedHeaders[key];
                }
            }
            const result = await this.fetchAvailability(apiUrl, headers);
            // If we hit a 428, Akamai is blocking us. Navigate back to the form and
            // do a full UI-driven search to reset sensor state and get fresh headers.
            if (result?.error && result?.status === 428) {
                if (print)
                    print.info('  Got 428 — resetting via full UI search...');
                // Wait for any Akamai challenge overlay to finish first
                const waitingRoom = this.page.locator('#sec-overlay');
                const overlayVisible = await waitingRoom.isVisible({ timeout: 5000 }).catch(() => false);
                if (overlayVisible) {
                    await waitingRoom.waitFor({ state: 'hidden', timeout: 60000 });
                }
                // Navigate back to the availability form
                await this.page.goto(`${this.config.baseUrl}/dine-res/availability/`, {
                    waitUntil: 'commit',
                    timeout: 30000,
                });
                await this.page.waitForTimeout(10000);
                // Do a full UI-driven search (this also refreshes capturedHeaders)
                return this.searchAvailability(partySize, date, print);
            }
            if (result?.error) {
                if (print)
                    print.warning(`Availability API returned ${result.status || result.message}`);
                return null;
            }
            return result;
        }
        catch (e) {
            if (print)
                print.info(`  Re-trigger error: ${e?.message?.substring(0, 120)}`);
            return null;
        }
    }
    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.context = null;
            this.page = null;
        }
    }
}
exports.PlaywrightManager = PlaywrightManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheXdyaWdodC11dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kaXNuZXktYXBpL3BsYXl3cmlnaHQtdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQStFO0FBQy9FLHVDQUF5QjtBQUV6QixtREFBc0U7QUFJdEUsTUFBYSxpQkFBaUI7SUFDcEIsT0FBTyxHQUFtQixJQUFJLENBQUM7SUFDL0IsT0FBTyxHQUEwQixJQUFJLENBQUM7SUFDdEMsSUFBSSxHQUFnQixJQUFJLENBQUM7SUFDekIsZUFBZSxHQUFrQyxJQUFJLENBQUM7SUFDdEQsV0FBVyxHQUFZLEtBQUssQ0FBQztJQUM3QixNQUFNLEdBQVcsS0FBSyxDQUFDO0lBRS9CLElBQVksTUFBTTtRQUNoQixPQUFPLDZCQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQW1CLEVBQUUsT0FBb0Q7UUFDbEYsSUFBSSxJQUFJLENBQUMsSUFBSTtZQUFFLE9BQU8sQ0FBQyxzQkFBc0I7UUFDN0MsSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLEVBQUUsV0FBVyxJQUFJLEtBQUssQ0FBQztRQUNqRCxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sRUFBRSxNQUFNLElBQUksS0FBSyxDQUFDO1FBRXZDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1FBQ3RDLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFeEMsSUFBSSxDQUFDO1lBQ0gsSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFDWixLQUFLLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7Z0JBQzlDLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FB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