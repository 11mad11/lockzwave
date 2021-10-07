const Pusher = require("pusher");

const pusher = new Pusher({
	appId: "1278246",
	key: "7579afc50ecfbaf3ec05",
	secret: "fa1c7f0074e66497784e",
	cluster: "us2",
	useTLS: true
});

pusher.trigger("main-channel", "my-event", {
	message: "hello world"
});
