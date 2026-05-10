import { GluegunPrint } from 'gluegun';
import { Resort } from './resort-config';
export type { Resort };
export declare class PlaywrightManager {
    private browser;
    private context;
    private page;
    private capturedHeaders;
    private showBrowser;
    private resort;
    private get config();
    init(print: GluegunPrint, options?: {
        showBrowser?: boolean;
        resort?: Resort;
    }): Promise<void>;
    private interactiveLogin;
    private launchBrowser;
    private validateSession;
    /**
     * Search availability by interacting with the dine-res Angular app UI.
     * Sets party size and date, clicks search, and intercepts the API response.
     */
    searchAvailability(partySize: number, date: string, print?: GluegunPrint): Promise<any>;
    /**
     * Make a single in-page fetch to the availability API using captured headers.
     * Returns the parsed JSON, or an object with { error, status } on failure.
     */
    private fetchAvailability;
    /**
     * Re-trigger a search by calling the availability API directly via fetch()
     * inside the page's JavaScript context, replaying the same headers that the
     * Angular app used during the initial search.
     *
     * If the fetch returns 428 (Akamai bot challenge), we navigate back to the
     * availability form and do a full UI-driven search to reset Akamai's state.
     * This captures fresh headers for subsequent in-page fetches.
     */
    retriggerSearch(partySize: number, date: string, print?: GluegunPrint): Promise<any>;
    close(): Promise<void>;
}
