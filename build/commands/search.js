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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const mail_1 = __importDefault(require("../hooks/mail"));
const macos_1 = __importDefault(require("../hooks/macos"));
const ntfy_1 = __importDefault(require("../hooks/ntfy"));
const pushover_1 = __importDefault(require("../hooks/pushover"));
const resort_config_1 = require("../disney-api/resort-config");
module.exports = {
    name: 'search',
    run: async (toolbox) => {
        const { parameters: { options }, print, disneyApi, } = toolbox;
        const validOptions = new Set(['date', 'ids', 'party', 'show-browser', 'startTime', 'endTime', 'resort', 'reauth', 'alert']);
        const invalidOptions = Object.keys(options).filter((key) => !validOptions.has(key));
        if (invalidOptions.length > 0) {
            print.error(`Invalid option(s): ${invalidOptions.map((o) => `--${o}`).join(', ')}`);
            return;
        }
        const { date = new Date().toLocaleDateString('en-CA'), ids, party = 2, 'show-browser': showBrowser = false, startTime, endTime, resort = 'dlr', reauth = false, alert, } = options;
        if (resort !== 'dlr' && resort !== 'wdw') {
            print.error('resort must be either "dlr" or "wdw".');
            return;
        }
        if (party < 1) {
            print.error('Party size must be at least 1.');
            return;
        }
        const today = new Date().toLocaleDateString('en-CA');
        if (date < today) {
            print.error('Date must not be in the past.');
            return;
        }
        const timeRegex = /^\d{1,2}:\d{2}(?:\s*(?:AM|PM))?$/i;
        if (startTime && !timeRegex.test(String(startTime))) {
            print.error('startTime must be a valid time (e.g. "08:00" or "8:00 AM").');
            return;
        }
        if (endTime && !timeRegex.test(String(endTime))) {
            print.error('endTime must be a valid time (e.g. "13:00" or "1:00 PM").');
            return;
        }
        if (startTime && endTime) {
            const parseTime = (timeStr) => {
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
            };
            if (parseTime(String(startTime)) > parseTime(String(endTime))) {
                print.error('startTime must be before or equal to endTime.');
                return;
            }
        }
        if (reauth) {
            const authFile = resort_config_1.RESORT_CONFIG[resort].authFile;
            if (fs.existsSync(authFile)) {
                fs.unlinkSync(authFile);
                print.info('Cleared saved session. You will be prompted to log in again.');
            }
            else {
                print.info('No saved session found — you will be prompted to log in.');
            }
        }
        let parsedAlerts = [];
        if (alert) {
            parsedAlerts = (typeof alert === 'string' ? alert : String(alert)).split(',').map((a) => a.trim());
            const validAlertTypes = new Set(['email', 'ntfy', 'pushover', 'macosNotify']);
            const invalidAlerts = parsedAlerts.filter((a) => !validAlertTypes.has(a));
            if (invalidAlerts.length > 0) {
                print.error(`Invalid alert type(s): ${invalidAlerts.join(', ')}. Valid options are: email, ntfy, pushover, macosNotify.`);
                return;
            }
        }
        if (ids) {
            const configuredAlerts = [];
            if (process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD)
                configuredAlerts.push({ name: 'Email', flag: 'email' });
            if (process.env.NTFY_TOPIC)
                configuredAlerts.push({ name: 'ntfy', flag: 'ntfy' });
            if (process.env.PUSHOVER_USER && process.env.PUSHOVER_TOKEN)
                configuredAlerts.push({ name: 'Pushover', flag: 'pushover' });
            const unusedAlerts = configuredAlerts.filter((a) => !parsedAlerts.includes(a.flag));
            if (unusedAlerts.length > 0) {
                const suggestions = unusedAlerts.map((a) => `${a.name} (--alert ${a.flag})`).join(', ');
                print.warning(`Configured but not enabled: ${suggestions}`);
            }
        }
        //Hooks
        const baseUrl = resort_config_1.RESORT_CONFIG[resort].baseUrl;
        const onSuccess = async ({ diningAvailability }) => {
            const promises = [];
            if (parsedAlerts.includes('macosNotify')) {
                promises.push((0, macos_1.default)({ diningAvailability, print, partySize: party, date }));
            }
            if (parsedAlerts.includes('email')) {
                promises.push((0, mail_1.default)({ diningAvailability, print, partySize: party, date }));
            }
            if (parsedAlerts.includes('ntfy')) {
                promises.push((0, ntfy_1.default)({ diningAvailability, print, partySize: party, date, baseUrl }));
            }
            if (parsedAlerts.includes('pushover')) {
                promises.push((0, pushover_1.default)({ diningAvailability, print, partySize: party, date, baseUrl }));
            }
            return Promise.allSettled(promises);
        };
        const finalStartTime = startTime ? String(startTime) : undefined;
        const finalEndTime = endTime ? String(endTime) : undefined;
        if (ids) {
            disneyApi.checkTables({
                date,
                onSuccess,
                print,
                ids: (typeof ids === 'number' ? ids.toString() : ids).split(','),
                partySize: party,
                showBrowser,
                startTime: finalStartTime,
                endTime: finalEndTime,
                resort,
            });
        }
        else {
            disneyApi.checkTables({
                date,
                onSuccess,
                print,
                partySize: party,
                showBrowser,
                startTime: finalStartTime,
                endTime: finalEndTime,
                resort,
            });
        }
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1hbmRzL3NlYXJjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF5QjtBQUV6Qix5REFBaUM7QUFDakMsMkRBQW1DO0FBQ25DLHlEQUFpQztBQUNqQyxpRUFBeUM7QUFFekMsK0RBQTREO0FBRTVELE1BQU0sQ0FBQyxPQUFPLEdBQUc7SUFDZixJQUFJLEVBQUUsUUFBUTtJQUNkLEdBQUcsRUFBRSxLQUFLLEVBQUUsT0FBdUIsRUFBRSxFQUFFO1FBQ3JDLE1BQU0sRUFDSixVQUFVLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFDdkIsS0FBSyxFQUNMLFNBQVMsR0FDVixHQUFHLE9BQU8sQ0FBQztRQUVaLE1BQU0sWUFBWSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQzVILE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNwRixJQUFJLGNBQWMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDOUIsS0FBSyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDcEYsT0FBTztRQUNULENBQUM7UUFFRCxNQUFNLEVBQ0osSUFBSSxH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