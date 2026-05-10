import { DiningAvailability } from '../disney-api/model/response';
import { GluegunPrint } from 'gluegun';
export default function pushover({ diningAvailability, print, partySize, date, baseUrl, }: {
    diningAvailability: DiningAvailability;
    print: GluegunPrint;
    partySize: number;
    date: string;
    baseUrl: string;
}): Promise<void>;
