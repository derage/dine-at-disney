"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = macos;
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
async function macos({ diningAvailability, print, partySize, date, }) {
    if (process.platform !== 'darwin') {
        print.warning('macOS notifications are only supported on macOS.');
        return;
    }
    const escapeAppleScriptString = (str) => str.replace(/"/g, '\\"');
    const escapeShellArg = (str) => `'${str.replace(/'/g, "'\\''")}'`;
    try {
        const times = diningAvailability.cleanedTimes.map((t) => t.time).join(', ');
        const title = 'Dine at Disney';
        const subtitle = escapeAppleScriptString(diningAvailability.restaurant.name);
        const message = escapeAppleScriptString(`Found openings for ${partySize} people on ${date}: ${times}`);
        const script = `display notification "${message}" with title "${title}" subtitle "${subtitle}" sound name "Glass"`;
        await execAsync(`osascript -e ${escapeShellArg(script)}`);
    }
    catch (error) {
        print.warning(`Failed to send macOS notification: ${error instanceof Error ? error.message : String(error)}`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFjb3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaG9va3MvbWFjb3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFPQSx3QkFpQ0M7QUF4Q0QsaURBQXFDO0FBQ3JDLCtCQUFpQztBQUlqQyxNQUFNLFNBQVMsR0FBRyxJQUFBLGdCQUFTLEVBQUMsb0JBQUksQ0FBQyxDQUFDO0FBRW5CLEtBQUssVUFBVSxLQUFLLENBQUMsRUFDbEMsa0JBQWtCLEVBQ2xCLEtBQUssRUFDTCxTQUFTLEVBQ1QsSUFBSSxHQU1MO0lBQ0MsSUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQ2xDLEtBQUssQ0FBQyxPQUFPLENBQUMsa0RBQWtELENBQUMsQ0FBQztRQUNsRSxPQUFPO0lBQ1QsQ0FBQztJQUVELE1BQU0sdUJBQXVCLEdBQUcsQ0FBQyxHQUFXLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzFFLE1BQU0sY0FBYyxHQUFHLENBQUMsR0FBVyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUM7SUFFMUUsSUFBSSxDQUFDO1FBQ0gsTUFBTSxLQUFLLEdBQUcsa0JBQWtCLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1RSxNQUFNLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQztRQUMvQixNQUFNLFFBQVEsR0FBRyx1QkFBdUIsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0UsTUFBTSxPQUFPLEdBQUcsdUJBQXVCLENBQ3JDLHNCQUFzQixTQUFTLGNBQWMsSUFBSSxLQUFLLEtBQUssRUFBRSxDQUM5RCxDQUFDO1FBRUYsTUFBTSxNQUFNLEdBQUcseUJBQXlCLE9BQU8saUJBQWlCLEtBQUssZUFBZSxRQUFRLHNCQUFzQixDQUFDO1FBRW5ILE1BQU0sU0FBUyxDQUFDLGdCQUFnQixjQUFjLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsS0FBSyxDQUFDLE9BQU8sQ0FBQyxzQ0FBc0MsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNoSCxDQUFDO0FBQ0gsQ0FBQyJ9