"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    name: 'list',
    run: async (toolbox) => {
        const { parameters: { options }, print, disneyApi, } = toolbox;
        const { resort = 'dlr' } = options;
        if (resort !== 'dlr' && resort !== 'wdw') {
            print.error('resort must be either "dlr" or "wdw".');
            return;
        }
        await disneyApi.listPlaces({ print, resort });
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9saXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsTUFBTSxDQUFDLE9BQU8sR0FBRztJQUNmLElBQUksRUFBRSxNQUFNO0lBQ1osR0FBRyxFQUFFLEtBQUssRUFBRSxPQUF1QixFQUFFLEVBQUU7UUFDckMsTUFBTSxFQUNKLFVBQVUsRUFBRSxFQUFFLE9BQU8sRUFBRSxFQUN2QixLQUFLLEVBQ0wsU0FBUyxHQUNWLEdBQUcsT0FBTyxDQUFDO1FBRVosTUFBTSxFQUFFLE1BQU0sR0FBRyxLQUFLLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFFbkMsSUFBSSxNQUFNLEtBQUssS0FBSyxJQUFJLE1BQU0sS0FBSyxLQUFLLEVBQUUsQ0FBQztZQUN6QyxLQUFLLENBQUMsS0FBSyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7WUFDckQsT0FBTztRQUNULENBQUM7UUFFRCxNQUFNLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUNoRCxDQUFDO0NBQ2dCLENBQUMifQ==