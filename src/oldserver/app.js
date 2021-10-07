var express = require('express');
const {init, debug} = require("./dist/main");
const {prettyPrintJson} = require('pretty-print-json');
const fs = require("fs");
const {InclusionStrategy} = require("zwave-js");
const {SecurityClass} = require("@zwave-js/core");

(async function () {
	const driver = await init(2);
	
	let config = {};
	if (fs.existsSync("config.json"))
		config = JSON.parse(fs.readFileSync("config.json").toString())
	
	function saveConfig() {
		fs.writeFileSync("config.json", JSON.stringify(config, undefined, 2));
	}
	
	if (!config.nodes) {
		config.nodes = await debug();
		saveConfig();
	}
	
	const app = express();
	app.set('view engine', 'ejs');
	
	app.get('/', function (req, res) {
		res.render('index', {
			nodes: config.nodes,
			config
		});
	});
	
	app.get("/state.json", async (req, res) => {
		res.json({
			allNodesReady: driver.allNodesReady
		}).end();
	});
	
	app.get('/debug', async function (req, res) {
		let output = "";
		
		for (const node of config.nodes) {
			output += (`
				<details>
    				<summary>${node.nodeId}</summary>
    				<pre>${prettyPrintJson.toHtml(node)}</pre>
				</details>
			`);
		}
		res.send(output + "<link rel=stylesheet href=https://cdn.jsdelivr.net/npm/pretty-print-json@1.1/dist/pretty-print-json.css>").end();
	});
	
	app.post('/inclusion', async function (req, res) {
		const secOrder = [
			//SecurityClass.S2_AccessControl,
			//SecurityClass.S2_Authenticated,
			SecurityClass.S2_Unauthenticated,
			SecurityClass.S0_Legacy,
		];
		
		await driver.controller.stopInclusion();
		await driver.controller.stopExclusion();
		await driver.controller.beginInclusion({
			strategy: InclusionStrategy.Default,
			userCallbacks: {
				async grantSecurityClasses(requested) {
					for (const sec of secOrder) {
						const r = requested.securityClasses.filter(s => s === sec);
						if (r.length)
							return r;
					}
				},
				validateDSKAndEnterPIN(dsk) {
					return false;
				},
				abort() {
					console.log("inclusion aborted");
				},
			},
		})
		
		driver.controller.once("inclusion stopped", () => {
			res.redirect("/");
		});
	});
	
	app.post('/exclusion', async function (req, res) {
		await driver.controller.stopInclusion();
		await driver.controller.stopExclusion();
		await driver.controller.beginExclusion()
		
		driver.controller.once("exclusion stopped", () => {
			res.redirect("/");
		});
	});
	
	app.post('/refresh', async function (req, res) {
		config.nodes = await debug();
		saveConfig();
		res.redirect("/");
	});
	
	// app.post('/reboot', async function (req, res) {
	// 	await driver.destroy();
	// 	process.exit();//TODO
	// });
	
	app.listen(8080);
	console.log('8080 is the magic port');
})()
