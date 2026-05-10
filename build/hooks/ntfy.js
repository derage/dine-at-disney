"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ntfy;
const topic = process.env.NTFY_TOPIC;
const server = process.env.NTFY_SERVER || 'https://ntfy.sh';
async function ntfy({ diningAvailability, print, partySize, date, baseUrl, }) {
    if (!topic) {
        print.warning('No NTFY_TOPIC provided');
        return;
    }
    try {
        const times = diningAvailability.cleanedTimes.map((t) => t.time).join(', ');
        const response = await fetch(`${server}/${topic}`, {
            method: 'POST',
            headers: {
                Title: `${diningAvailability.restaurant.name} - ${date}`,
                Click: `${baseUrl}/dine-res/restaurant/${diningAvailability.restaurant.id}/`,
                Tags: 'fork_and_knife',
            },
            body: `Found openings for ${partySize} people on ${date} for ${diningAvailability.restaurant.name}: ${times}\n\nBook now: ${baseUrl}/dine-res/restaurant/${diningAvailability.restaurant.id}/`,
        });
        if (!response.ok) {
            throw new Error(`ntfy error: ${response.status}`);
        }
    }
    catch (err) {
        print.error(err);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnRmeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ob29rcy9udGZ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBTUEsdUJBb0NDO0FBdkNELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDO0FBQ3JDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLGlCQUFpQixDQUFDO0FBRTdDLEtBQUssVUFBVSxJQUFJLENBQUMsRUFDakMsa0JBQWtCLEVBQ2xCLEtBQUssRUFDTCxTQUFTLEVBQ1QsSUFBSSxFQUNKLE9BQU8sR0FPUjtJQUNDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNYLEtBQUssQ0FBQyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUN4QyxPQUFPO0lBQ1QsQ0FBQztJQUVELElBQUksQ0FBQztRQUNILE1BQU0sS0FBSyxHQUFHLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUUsTUFBTSxRQUFRLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxNQUFNLElBQUksS0FBSyxFQUFFLEVBQUU7WUFDakQsTUFBTSxFQUFFLE1BQU07WUFDZCxPQUFPLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEdBQUcsa0JBQWtCLENBQUMsVUFBVSxDQUFDLElBQUksTUFBTSxJQUFJLEVBQUU7Z0JBQ3hELEtBQUssRUFBRSxHQUFHLE9BQU8sd0JBQXdCLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxFQUFFLEdBQUc7Z0JBQzVFLElBQUksRUFBRSxnQkFBZ0I7YUFDdkI7WUFDRCxJQUFJLEVBQUUsc0JBQXNCLFNBQVMsY0FBYyxJQUFJLFFBQVEsa0JBQWtCLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxLQUFLLGlCQUFpQixPQUFPLHdCQUF3QixrQkFBa0IsQ0FBQyxVQUFVLENBQUMsRUFBRSxHQUFHO1NBQy9MLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDakIsTUFBTSxJQUFJLEtBQUssQ0FBQyxlQUFlLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELENBQUM7SUFDSCxDQUFDO0lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNiLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkIsQ0FBQztBQUNILENBQUMifQ==