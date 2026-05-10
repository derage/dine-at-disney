export type Resort = 'dlr' | 'wdw';
export interface ResortConfig {
    baseUrl: string;
    domain: string;
    authFile: string;
    placesPath: string;
}
export declare const RESORT_CONFIG: Record<Resort, ResortConfig>;
export declare function getPlacesUrl(resort: Resort, date: string): string;
