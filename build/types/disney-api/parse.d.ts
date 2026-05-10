import { AvailabilityApiResponse, CleanedTime, DiningAvailabilities, MealPeriodOffer } from './model/response';
export declare function summarizeTimes(cleanedTimes: CleanedTime[], maxLength?: number): string;
export declare function extractCleanedTimes(dateOffers: MealPeriodOffer[], date: string, useMealPeriodName?: boolean): CleanedTime[];
export declare function parseTime(timeStr: string): number;
/**
 * Parse the dine-res availability API response into our internal format.
 * Handles both regular restaurants and dining events (e.g. World of Color Dining Package).
 */
export declare function parseAvailability(data: AvailabilityApiResponse, date: string, startTime?: string, endTime?: string): DiningAvailabilities;
