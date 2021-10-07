const {init} = require("./dist/main");
const {SecurityClass} = require("@zwave-js/core");
const {InclusionStrategy} = require("zwave-js");

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
	await driver.controller.stopExclusion();
	console.log("begin");
	await driver.controller.beginInclusion({
		strategy: InclusionStrategy.Default,
		userCallbacks: {
			async grantSecurityClasses(requested) {
				for (const sec of secOrder) {
					const r = requested.securityClasses.filter(s=>s===sec);
					if(r.length)
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
	
	
})()
