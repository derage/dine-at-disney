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
exports.RESORT_CONFIG = void 0;
exports.getPlacesUrl = getPlacesUrl;
const path = __importStar(require("path"));
const os = __importStar(require("os"));
exports.RESORT_CONFIG = {
    dlr: {
        baseUrl: 'https://disneyland.disney.go.com',
        domain: 'disneyland.disney.go.com',
        authFile: path.join(os.homedir(), '.dine-at-disney-auth-dlr.json'),
        placesPath: 'dlr/80008297',
    },
    wdw: {
        baseUrl: 'https://disneyworld.disney.go.com',
        domain: 'disneyworld.disney.go.com',
        authFile: path.join(os.homedir(), '.dine-at-disney-auth-wdw.json'),
        placesPath: 'wdw/80007798',
    },
};
function getPlacesUrl(resort, date) {
    const { baseUrl, placesPath } = exports.RESORT_CONFIG[resort];
    return `${baseUrl}/finder/api/v1/explorer-service/list-ancestor-entities/${placesPath};entityType=destination/${date}/dining`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3J0LWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kaXNuZXktYXBpL3Jlc29ydC1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMkJBLG9DQUdDO0FBOUJELDJDQUE2QjtBQUM3Qix1Q0FBeUI7QUFXWixRQUFBLGFBQWEsR0FBaUM7SUFDekQsR0FBRyxFQUFFO1FBQ0gsT0FBTyxFQUFFLGtDQUFrQztRQUMzQyxNQUFNLEVBQUUsMEJBQTBCO1FBQ2xDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRSwrQkFBK0IsQ0FBQztRQUNsRSxVQUFVLEVBQUUsY0FBYztLQUMzQjtJQUNELEdBQUcsRUFBRTtRQUNILE9BQU8sRUFBRSxtQ0FBbUM7UUFDNUMsTUFBTSxFQUFFLDJCQUEyQjtRQUNuQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUUsK0JBQStCLENBQUM7UUFDbEUsVUFBVSxFQUFFLGNBQWM7S0FDM0I7Q0FDRixDQUFDO0FBRUYsU0FBZ0IsWUFBWSxDQUFDLE1BQWMsRUFBRSxJQUFZO0lBQ3ZELE1BQU0sRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLEdBQUcscUJBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN0RCxPQUFPLEdBQUcsT0FBTywwREFBMEQsVUFBVSwyQkFBMkIsSUFBSSxTQUFTLENBQUM7QUFDaEksQ0FBQyJ9