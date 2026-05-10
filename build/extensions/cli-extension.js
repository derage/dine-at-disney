"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_utils_1 = require("../disney-api/playwright-utils");
const resort_config_1 = require("../disney-api/resort-config");
const parse_1 = require("../disney-api/parse");
async function fetchJson(url) {
    const response = await fetch(url, {
        headers: {
            Accept: 'application/json',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        },
    });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
}
const playwrightManager = new playwright_utils_1.PlaywrightManager();
module.exports = (toolbox) => {
    async function checkTables({ date, onSuccess, numTries = 1, partySize = 2, tables = [], print, ids, showBrowser = false, startTime, endTime, resort = 'dlr', }) {
        if (numTries === 1) {
            await playwrightManager.init(print, { showBrowser, resort });
            let timeSuffix = '';
            if (startTime && endTime) {
                timeSuffix = ` between ${startTime} and ${endTime}`;
            }
            else if (startTime) {
                timeSuffix = ` from ${startTime} onwards`;
            }
            else if (endTime) {
                timeSuffix = ` up until ${endTime}`;
            }
            if (ids && ids.length > 0) {
                print.success(`Checking for tables for ${partySize} people on ${date}${timeSuffix} for IDs: ${ids.join(', ')}...`);
            }
            else {
                print.success(`Checking for tables for ${partySize} people on ${date}${timeSuffix}...`);
            }
        }
        // First attempt: interact with the UI to set params and trigger search
        // Subsequent attempts: just re-click search (params are already set)
        const data = numTries === 1
            ? await playwrightManager.searchAvailability(partySize, date, print)
            : await playwrightManager.retriggerSearch(partySize, date, print);
        if (!data) {
            if (numTries === 1) {
                print.error('Failed to fetch availability data. Your session may have expired.');
                print.info(`Delete ${resort_config_1.RESORT_CONFIG[resort].authFile} and run again to re-authenticate.`);
                await playwrightManager.close();
                process.exit(-1);
            }
            else {
                print.warning(`API error on attempt ${numTries}. Retrying in 60s...`);
            }
            setTimeout(() => {
                checkTables({ date, onSuccess, numTries: numTries + 1, partySize, tables, print, ids, showBrowser, startTime, endTime, resort });
            }, 60000);
            return;
        }
        const hasOffers = (0, parse_1.parseAvailability)(data, date, startTime, endTime);
        const restaurantIds = Object.keys(hasOffers);
        if (restaurantIds.length === 0) {
            print.warning(`No offers found for anything. Checking again in 60s. ${numTries} total attempts.`);
            setTimeout(() => {
                checkTables({ date, onSuccess, numTries: numTries + 1, partySize, tables, print, ids, showBrowser, startTime, endTime, resort });
            }, 60000);
        }
        else {
            if (ids) {
                try {
                    for (const id of ids) {
                        if (restaurantIds.includes(id)) {
                            const avail = hasOffers[id];
                            const byMealPeriod = new Map();
                            for (const t of avail.cleanedTimes) {
                                const times = byMealPeriod.get(t.mealPeriod) || [];
                                times.push(t.time);
                                byMealPeriod.set(t.mealPeriod, times);
                            }
                            const reservationUrl = `${resort_config_1.RESORT_CONFIG[resort].baseUrl}/dine-res/restaurant/${id}`;
                            if (byMealPeriod.size <= 1) {
                                print.success(`🎉 Found offers at ${avail.cleanedTimes.map((t) => t.time).join(', ')} for ${avail.restaurant.name}!`);
                            }
                            else {
                                print.success(`🎉 Found offers for ${avail.restaurant.name}!`);
                                for (const [period, times] of byMealPeriod) {
                                    print.success(`  ${period}: ${times.join(', ')}`);
                                }
                            }
                            print.success(`   👉 Book now: ${reservationUrl}`);
                            await onSuccess({ diningAvailability: avail });
                        }
                        else {
                            print.warning(`No offers found for restaurant ID ${id}.`);
                        }
                    }
                }
                catch (err) {
                    print.error(err);
                }
                print.info(`Checking again in 60s. ${numTries} total attempts.`);
                setTimeout(() => {
                    checkTables({ date, onSuccess, numTries: numTries + 1, partySize, tables, print, ids, showBrowser, startTime, endTime, resort });
                }, 60000);
            }
            else {
                const { table } = print;
                print.success(`Found some offers on ${date}:`);
                const sorted = Object.entries(hasOffers).sort(([, a], [, b]) => a.restaurant.name.localeCompare(b.restaurant.name));
                table([
                    ['Name', 'ID', 'Available Times'],
                    ...sorted.map(([id, avail]) => [avail.restaurant.name, id, (0, parse_1.summarizeTimes)(avail.cleanedTimes)]),
                ], {
                    format: 'markdown',
                });
                const exampleCmd = [
                    'dine-at-disney search',
                    `--date ${date}`,
                    `--party ${partySize}`,
                    startTime ? `--startTime "${startTime}"` : '',
                    endTime ? `--endTime "${endTime}"` : '',
                    resort !== 'dlr' ? `--resort ${resort}` : '',
                    '--ids <id1,id2,...>',
                    '--alert <email,ntfy,pushover,macosNotify>',
                ]
                    .filter(Boolean)
                    .join(' ');
                print.info(`\n💡 To monitor one or more restaurants, run:\n\n  ${exampleCmd}\n`);
                await playwrightManager.close();
                process.exit(0);
            }
        }
    }
    async function listPlaces({ print, resort = 'dlr' }) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 3);
        const date = targetDate.toLocaleDateString('en-CA');
        print.info('Fetching restaurant list...');
        let data;
        try {
            data = await fetchJson((0, resort_config_1.getPlacesUrl)(resort, date));
        }
        catch (e) {
            print.error(`Failed to retrieve the list of restaurants: ${e?.message}`);
            process.exit(-1);
        }
        const results = data?.results || [];
        const reservable = results.filter((r) => (r.facets?.tableService || []).includes('reservations-accepted'));
        const { table } = print;
        table([
            ['Name', 'ID', 'Location'],
            ...reservable
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((r) => {
                const loc = r.locationName || '';
                return [r.name, String(r.facilityId), loc.startsWith('finder.') ? 'Multiple Locations' : loc];
            }),
        ], {
            format: 'markdown',
        });
    }
    toolbox.disneyApi = { checkTables, listPlaces };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLWV4dGVuc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leHRlbnNpb25zL2NsaS1leHRlbnNpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxxRUFBMkU7QUFDM0UsK0RBQTBFO0FBQzFFLCtDQUF3RTtBQUV4RSxLQUFLLFVBQVUsU0FBUyxDQUFDLEdBQVc7SUFDbEMsTUFBTSxRQUFRLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxFQUFFO1FBQ2hDLE9BQU8sRUFBRTtZQUNQLE1BQU0sRUFBRSxrQkFBa0I7WUFDMUIsWUFBWSxFQUNWLHVIQUF1SDtTQUMxSDtLQUNGLENBQUMsQ0FBQztJQUVILElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDakIsTUFBTSxJQUFJLEtBQUssQ0FBQyxRQUFRLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRCxPQUFPLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUN6QixDQUFDO0FBRUQsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLG9DQUFpQixFQUFFLENBQUM7QUFFbEQsTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLE9BQXVCLEVBQUUsRUFBRTtJQUMzQyxLQUFLLFVBQVUsV0FBVyxDQUFDLEVBQ3pCLElBQUksRUFDSixTQUFTLEVBQ1QsUUFBUSxHQUFHLENBQUMsRUFDWixTQUFTLEdBQUcsQ0FBQyxFQUNiLE1BQU0sR0FBRyxFQUFFLEVBQ1gsS0FBSyxFQUNMLEdBQUcsRUFDSCxXQUFXLEdBQUcsS0FBSyxFQUNuQixTQUFTLEVBQ1QsT0FBTyxFQUNQLE1BQU0sR0FBRyxLQUFLLEdBYWY7UUFDQyxJQUFJLFFBQVEsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUNuQixNQUFNLGlCQUFpQixDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUU3RCxJQUFJLFVBQVUs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