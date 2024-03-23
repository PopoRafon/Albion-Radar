const express = require('express');
const path = require('path');
const PhotonParser = require('./scripts/classes/PhotonPacketParser');
const Cap = require('cap').Cap;
const decoders = require('cap').decoders;
const WebSocket = require('ws');
const ip = require('ip');

const app = express();
const port = 5001;

BigInt.prototype.toJSON = function () { return this.toString(); };

app.use(express.static(path.join(__dirname, 'views')));
app.set('view engine', 'ejs');

app.use('/scripts', express.static(__dirname + '/scripts'));
app.use('/scripts/Handlers', express.static(__dirname + '/scripts/Handlers'));
app.use('/scripts/Drawings', express.static(__dirname + '/scripts/Drawings'));
app.use('/scripts/Utils', express.static(__dirname + '/scripts/Utils'));
app.use('/images/Resources', express.static(__dirname + '/images/Resources'));
app.use('/images/Items', express.static(__dirname + '/images/Items'));

app.get('/', (req, res) => {
	const viewName = 'main/home';
	res.render('layout', { mainContent: viewName });
});

app.get('/home', (req, res) => {
	const viewName = 'main/home';
	res.render('./layout', { mainContent: viewName });
});

app.get('/raw', (req, res) => {
	const viewName = 'main/raw';
	res.render('layout', { mainContent: viewName });
});

app.get('/settings', (req, res) => {
	const viewName = 'main/settings';
	res.render('layout', { mainContent: viewName });
});

app.get('/ignorelist', (req, res) => {
	const viewName = 'main/ignorelist';
	res.render('layout', { mainContent: viewName });
});

app.get('/chests', (req, res) => {
	const viewName = 'main/chests';
	res.render('layout', { mainContent: viewName });
});

app.get('/drawing', (req, res) => {
	res.render('main/drawing');
});

app.get('/logout', (req, res) => {
	req.session.destroy();
	res.redirect('/');
});

app.listen(port, () => {
	const blueColor = '\x1b[94m';
	const sequenceReset = '\x1b[0m';
	console.log(`${blueColor}Server is running on http://localhost:${port}${sequenceReset}`);
});

const getActiveIP = () => {
	const interfaces = ip.address();
	return interfaces;
};

const cap = new Cap();
const device = Cap.findDevice(getActiveIP());
const filter = 'udp and (dst port 5056 or src port 5056)';
const bufSize = 4096;
const buffer = Buffer.alloc(4096);
const manager = new PhotonParser();

cap.open(device, filter, bufSize, buffer);
cap.setMinBytes && cap.setMinBytes(0);

const server = new WebSocket.Server({ port: 5002, host: 'localhost' });

server.on('connection', (socket) => {
	const redColor = '\x1b[31m';
	const greenColor = '\x1b[32m';
	const sequenceReset = '\x1b[0m';
	console.log(`${greenColor}User has connected to the server.${sequenceReset}`);

	function packetListener(nbytes, trunc) {
		let ret = decoders.Ethernet(buffer);
		ret = decoders.IPV4(buffer, ret.offset);
		ret = decoders.UDP(buffer, ret.offset);

		const payload = buffer.subarray(ret.offset, nbytes);

		// Parse the UDP payload
		try {
			manager.handle(payload);
		}
		catch (error) {
			console.log(error);
		}
	}

	function eventListener(dictionary) {
		const dictionaryDataJSON = JSON.stringify(dictionary);

		server.clients.forEach(function (client) {
			client.send(JSON.stringify({ code: 'event', dictionary: dictionaryDataJSON }));
		});
	}

	function requestListener(dictionary) {
		const dictionaryDataJSON = JSON.stringify(dictionary);

		server.clients.forEach(function (client) {
			client.send(JSON.stringify({ code: 'request', dictionary: dictionaryDataJSON }));
		});
	}

	cap.on('packet', packetListener);
	manager.on('event', eventListener);
	manager.on('request', requestListener);

	socket.on('close', () => {
		console.log(`${redColor}User has disconnected from the server.${sequenceReset}`);
		cap.removeListener('packet', packetListener);
		manager.removeListener('event', eventListener);
		manager.removeListener('request', requestListener);
	});
});
