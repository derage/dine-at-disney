const { build } = require('gluegun');
// Load .env vars (Node >= 20.12 built-in)
const path = require('path');
const fs = require('fs');
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    process.loadEnvFile(envPath);
}
/**
 * Create the cli and kick it off
 */
async function run(argv) {
    // create a CLI runtime
    const cli = build()
        .brand('dine-at-disney')
        .src(__dirname)
        .plugins('./node_modules', { matching: 'dine-at-disney-*', hidden: true })
        .help() // provides default for help, h, --help, -h
        .version() // provides default for version, v, --version, -v
        .create();
    // enable the following method if you'd like to skip loading one of these core extensions
    // this can improve performance if they're not necessary for your project:
    // .exclude(['meta', 'strings', 'print', 'filesystem', 'semver', 'system', 'prompt', 'http', 'template', 'patching', 'package-manager'])
    // and run it
    const toolbox = await cli.run(argv.slice(2));
    // send it back (for testing, mostly)
    return toolbox;
}
module.exports = { run };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRXJDLDBDQUEwQztBQUMxQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ25ELElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO0lBQzNCLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDL0IsQ0FBQztBQUVEOztHQUVHO0FBQ0gsS0FBSyxVQUFVLEdBQUcsQ0FBQyxJQUFJO0lBQ3JCLHVCQUF1QjtJQUN2QixNQUFNLEdBQUcsR0FBRyxLQUFLLEVBQUU7U0FDaEIsS0FBSyxDQUFDLGdCQUFnQixDQUFDO1NBQ3ZCLEdBQUcsQ0FBQyxTQUFTLENBQUM7U0FDZCxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxRQUFRLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDO1NBQ3pFLElBQUksRUFBRSxDQUFDLDJDQUEyQztTQUNsRCxPQUFPLEVBQUUsQ0FBQyxpREFBaUQ7U0FDM0QsTUFBTSxFQUFFLENBQUM7SUFDWix5RkFBeUY7SUFDekYsMEVBQTBFO0lBQzFFLHdJQUF3STtJQUN4SSxhQUFhO0lBQ2IsTUFBTSxPQUFPLEdBQUcsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUU3QyxxQ0FBcUM7SUFDckMsT0FBTyxPQUFPLENBQUM7QUFDakIsQ0FBQztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyJ9