"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeTimes = summarizeTimes;
exports.extractCleanedTimes = extractCleanedTimes;
exports.parseTime = parseTime;
exports.parseAvailability = parseAvailability;
function summarizeTimes(cleanedTimes, maxLength = 80) {
    const byMealPeriod = new Map();
    for (const t of cleanedTimes) {
        const times = byMealPeriod.get(t.mealPeriod) || [];
        times.push(t.time);
        byMealPeriod.set(t.mealPeriod, times);
    }
    const parts = Array.from(byMealPeriod.entries()).map(([period, times]) => {
        if (times.length === 1)
            return `${period}: ${times[0]}`;
        return `${period}: ${times[0]}–${times[times.length - 1]} (${times.length} slots)`;
    });
    let result = '';
    for (let i = 0; i < parts.length; i++) {
        const next = result ? `${result} | ${parts[i]}` : parts[i];
        if (result && next.length > maxLength) {
            const remaining = parts.length - i;
            return `${result} | +${remaining} more...`;
        }
        result = next;
    }
    return result;
}
function extractCleanedTimes(dateOffers, date, useMealPeriodName = false) {
    return dateOffers.flatMap((mealPeriod) => (mealPeriod.offersByAccessibility || []).flatMap((access) => (access.offers || []).map((offer) => ({
        date,
        time: offer.label,
        label: offer.label,
        mealPeriod: useMealPeriodName ? mealPeriod.mealPeriodName : mealPeriod.mealPeriodType,
        offerId: offer.offerId,
    }))));
}
function parseTime(timeStr) {
    if (!timeStr)
        return -1;
    const match = timeStr.match(/(\d+):(\d+)(?:\s*(AM|PM))?/i);
    if (!match)
        return -1;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3]?.toUpperCase();
    if (ampm === 'PM' && hours < 12)
        hours += 12;
    if (ampm === 'AM' && hours === 12)
        hours = 0;
    return hours * 60 + minutes;
}
/**
 * Parse the dine-res availability API response into our internal format.
 * Handles both regular restaurants and dining events (e.g. World of Color Dining Package).
 */
function parseAvailability(data, date, startTime, endTime) {
    const result = {};
    const startMins = startTime ? parseTime(startTime) : 0;
    const endMins = endTime ? parseTime(endTime) : 24 * 60;
    function filterTimes(times) {
        return times.filter((t) => {
            const m = parseTime(t.time);
            return m >= startMins && m <= endMins;
        });
    }
    // Regular restaurants
    if (data?.restaurant) {
        for (const [id, restaurant] of Object.entries(data.restaurant)) {
            const dateOffers = restaurant.offers?.[date];
            if (!dateOffers || dateOffers.length === 0)
                continue;
            let cleanedTimes = extractCleanedTimes(dateOffers, date);
            cleanedTimes = filterTimes(cleanedTimes);
            if (cleanedTimes.length === 0)
                continue;
            result[id] = { restaurant, cleanedTimes };
        }
    }
    // Dining events (e.g. World of Color Dining Package) — these nest restaurants
    // inside eventTimes[]. We key the result by dining event ID so --ids matching works,
    // and flatten all offers from all sub-restaurants into one entry.
    if (data?.diningEvent) {
        for (const [eventId, event] of Object.entries(data.diningEvent)) {
            let allCleanedTimes = [];
            let firstRestaurant = null;
            for (const eventTime of event.eventTimes || []) {
                for (const restaurant of Object.values(eventTime.restaurant || {})) {
                    if (!firstRestaurant)
                        firstRestaurant = restaurant;
                    const dateOffers = restaurant.offers?.[date];
                    if (!dateOffers || dateOffers.length === 0)
                        continue;
                    allCleanedTimes.push(...extractCleanedTimes(dateOffers, date, true));
                }
            }
            allCleanedTimes = filterTimes(allCleanedTimes);
            if (allCleanedTimes.length === 0 || !firstRestaurant)
                continue;
            // Use the dining event name but the first sub-restaurant's details for display
            const eventIdNum = eventId.split(';')[0];
            result[eventIdNum] = {
                restaurant: { ...firstRestaurant, name: event.name },
                cleanedTimes: allCleanedTimes,
            };
        }
    }
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGlzbmV5LWFwaS9wYXJzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVFBLHdDQXNCQztBQUVELGtEQWdCQztBQUVELDhCQVVDO0FBTUQsOENBK0RDO0FBekhELFNBQWdCLGNBQWMsQ0FBQyxZQUEyQixFQUFFLFNBQVMsR0FBRyxFQUFFO0lBQ3hFLE1BQU0sWUFBWSxHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDO0lBQ2pELEtBQUssTUFBTSxDQUFDLElBQUksWUFBWSxFQUFFLENBQUM7UUFDN0IsTUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ25ELEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25CLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBQ0QsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFO1FBQ3ZFLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQUUsT0FBTyxHQUFHLE1BQU0sS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUN4RCxPQUFPLEdBQUcsTUFBTSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsTUFBTSxTQUFTLENBQUM7SUFDckYsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDaEIsS0FBSyxJQUFJLENBQUMsR0FB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