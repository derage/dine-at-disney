import { DiningAvailability } from '../disney-api/model/response';
import { GluegunPrint } from 'gluegun';
export default function macos({ diningAvailability, print, partySize, date, }: {
    diningAvailability: DiningAvailability;
    print: GluegunPrint;
    partySize: number;
    date: string;
}): Promise<void>;
