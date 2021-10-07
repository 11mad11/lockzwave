const {init} = require("./dist/main");
const {SecurityClass} = require("@zwave-js/core");

const secOrder = [
	//SecurityClass.S2_AccessControl,
	//SecurityClass.S2_Authenticated,
	SecurityClass.S2_Unauthenticated,
	SecurityClass.S0_Legacy,
];

(async () => {
	const driver = await init();
	
	driver.updateLogConfig({
		level: 0
	})
	
	console.log("stop");
	await driver.controller.stopInclusion();
	console.log("stop");
	await driver.controller.stopInclusion();
	console.log("begin");
	await driver.controller.beginExclusion()
	
})()

function wait () {
	setTimeout(wait, 1000);
}

wait();
