/*
------
The followinfg modules installed and included
  # socket.io - to create socket for communication between server and client
------
*/

const fs = require('fs');
const readline = require('readline');
class Tail {
	continueFrom = 0;
	tail_end = [];
	socket = null;
	fileSize = 0;
	constructor(fileName, socket) {
		const block = 20;
		this.fileSize = fs.statSync(fileName).size;
		this.continueFrom = this.fileSize;
		this.tail_end = [];
		this.socket = socket;
		let rl = readline.createInterface({
			input: fs.createReadStream(fileName, { start: (this.fileSize - block) > 0 ? this.fileSize - block : 0 })
		});
		this.current = this.fileSize - block;
		//Intial tail. To be displayed when user connects
		rl.on('line', (line) => {
			this.addToTail(line);
		});

		//Watches over log file and responds to changes
		fs.watch(fileName, (event, fname) => {
			if (event == 'change') {
				let rl = readline.createInterface({
					input: fs.createReadStream(fileName, { start: this.continueFrom })
				});
				rl.on('line', (line) => {
					this.continueFrom += line.length;
					this.addToTail(line);
					this.updateLog(line);
				});
			}
		});
		this.socket.on('connection', (socket) => {
			socket.emit('message', this.getLines())
		});
	}

	addToTail(line) {
		// this.continueFrom += line.length;
		this.tail_end.push(line);
		if (this.tail_end.length > 10) {
			this.tail_end.shift();
		}
	}

	updateLog(line) {
		this.socket.emit('message', [line])
	}

	getLines() {
		return this.tail_end;
	}
}

module.exports = Tail;
