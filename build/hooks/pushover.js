"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = pushover;
const user = process.env.PUSHOVER_USER;
const token = process.env.PUSHOVER_TOKEN;
async function pushover({ diningAvailability, print, partySize, date, baseUrl, }) {
    if (!user || !token) {
        print.warning('No pushover credentials provided');
        return;
    }
    try {
        const times = diningAvailability.cleanedTimes.map((t) => t.time).join(', ');
        const response = await fetch('https://api.pushover.net/1/messages.json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user,
                token,
                title: `Found openings for ${diningAvailability.restaurant.name} on ${date}`,
                message: `Found openings for ${partySize} people on ${date} for ${diningAvailability.restaurant.name}: ${times}`,
                url: `${baseUrl}/dine-res/restaurant/${diningAvailability.restaurant.id}/`,
                url_title: 'Reserve',
            }),
        });
        if (!response.ok) {
            throw new Error(`Pushover error: ${response.status}`);
        }
        const data = await response.json();
        if (data.status !== 1) {
            throw new Error(`Pushover error: ${data.errors.join(', ')}`);
        }
    }
    catch (err) {
        print.error(err);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVzaG92ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaG9va3MvcHVzaG92ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFZQSwyQkE2Q0M7QUFoREQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUM7QUFDdkMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUM7QUFFMUIsS0FBSyxVQUFVLFFBQVEsQ0FBQyxFQUNyQyxrQkFBa0IsRUFDbEIsS0FBSyxFQUNMLFNBQVMsRUFDVCxJQUFJLEVBQ0osT0FBTyxHQU9SO0lBQ0MsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3BCLEtBQUssQ0FBQyxPQUFPLENBQUMsa0NBQWtDLENBQUMsQ0FBQztRQUNsRCxPQUFPO0lBQ1QsQ0FBQztJQUVELElBQUksQ0FBQztRQUNILE1BQU0sS0FBSyxHQUFHLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUUsTUFBTSxRQUFRLEdBQUcsTUFBTSxLQUFLLENBQUMsMENBQTBDLEVBQUU7WUFDdkUsTUFBTSxFQUFFLE1BQU07WUFDZCxPQUFPLEVBQUUsRUFBRSxjQUFjLEVBQUUsa0JBQWtCLEVBQUU7WUFDL0MsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ25CLElBQUk7Z0JBQ0osS0FBSztnQkFDTCxLQUFLLEVBQUUsc0JBQXNCLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxJQUFJLE9BQU8sSUFBSSxFQUFFO2dCQUM1RSxPQUFPLEVBQUUsc0JBQXNCLFNBQVMsY0FBYyxJQUFJLFFBQVEsa0JBQWtCLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxLQUFLLEVBQUU7Z0JBQ2hILEdBQUcsRUFBRSxHQUFHLE9BQU8sd0JBQXdCLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxFQUFFLEdBQUc7Z0JBQzFFLFNBQVMsRUFBRSxTQUFTO2FBQ3JCLENBQUM7U0FDSCxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2pCLE1BQU0sSUFBSSxLQUFLLENBQUMsbUJBQW1CLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFFRCxNQUFNLElBQUksR0FBcUIsTUFBTSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFckQsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMsbUJBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMvRCxDQUFDO0lBQ0gsQ0FBQztJQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDYixLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25CLENBQUM7QUFDSCxDQUFDIn0=