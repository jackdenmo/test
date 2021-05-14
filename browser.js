const exec = require('child_process').exec;
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var url = require("url");
var fs = require('fs')
var jsonlz4 = require('jsonlz4-decompress');

var map = { chrome: "Google Chrome", firefox: "firefox" };
const browserPid = (browser, cb) => {
    let platform = process.platform;
    let cmd = '';
    switch (platform) {
        case 'darwin': cmd = `pgrep -x "${map[browser]}"`; break;
        default: break;
    }
    exec(cmd, (err, stdout, stderr) => {
        // pgrep gives error code as 1 if no process matches
        if (err && err.code == 1) {
            cb(0);
        } else if (stdout) {
            cb(parseInt(stdout));
        }
    });
}

app.get("/start", function (req, res) {
    const queryObject = url.parse(req.url, true).query;

    browserPid(queryObject["browser"], (status) => {
        if (!status) {
            exec(`open -a "${map[queryObject.browser]}" "${queryObject.url}"`, function (err) {
                if (err) {
                    console.log(err)
                }

                else {
                    console.log("success open")
                }

            })
        }
        res.sendStatus(200);
    })

})


app.get("/stop", function (req, res) {
    const queryObject = url.parse(req.url, true).query;

    browserPid(queryObject.browser, (pid) => {
        if (pid) {
            exec(`kill -9 ${pid}`, function (err, stdout) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("success stop")
                }
            })
        }
        res.sendStatus(200);
    })

})


app.get("/geturl", function (req, res) {
    const queryObject = url.parse(req.url, true).query;

    const browser = queryObject["browser"];

    if (browser == 'firefox') {
        var file = "/Users/{userName}/Library/Application Support/Firefox/Profiles/xyz.default-release/sessionstore-backups/recovery.jsonlz4"
        fs.readFile(file, function (err, data) {
            // const data = fd.toString();
            decompressedJson = jsonlz4(data);
            if (err) {
                console.error(err)
                return
            }
            console.log(decompressedJson)
            res.sendStatus(200)

        });
    } else if (browser == 'chrome') {
        var file = "/Users/{userName}/Library/Application Support/Google/Chrome/Default/Sessions/Tabs_1326548575344594";
        const fileSize = fs.statSync(fileName).size;
        // fs.stat(file, function(err, stat)
        // {
        //         if(err) {
        //             console.log(err);
        //             return;
        //         }

        //   var stream = fs.createReadStream(file,{start:0, end:stat.size});

        //   stream.addListener("data", function(filedata){
        //             filedata = filedata.toString('utf-8').trim();

        //             console.log(filedata);

        //             stream.close();

        //         });
        // });
        fs.readFile(file, function (err, data) {
            if (err) {
                console.error(err)
                return
            }
            data = data.toString()
            console.log(data);
            res.sendStatus(200)

        });
    }

})

app.get("/cleanup", function (req, res) {
    const queryObject = url.parse(req.url, true).query;

    const browser = queryObject["browser"];

    browserPid(browser, (status) => {
        if (!status) {

            if (browser == 'firefox') {
                // delete some required fields from default
                exec(`rm -rf /Users/{userName}/Library/Application Support/Firefox/Profiles/xyz.default-release`, { maxBuffer: 1024 * 500 }, function (err) {
                    if (err) { //process error
                        console.log(err)
                    } else {
                        console.log("success cleanup")
                    }

                })
            } else if (browser == 'chrome') {
                exec(`rm -rf /Users/{userName}/Library/Application Support/Google/Chrome/Default`, { maxBuffer: 1024 * 500 }, function (err) {
                    if (err) { //process error
                        console.log(err)
                    } else {
                        console.log("success cleanup")
                    }

                })
            }
        } else {
            console.log("Stop Browser before cleaning")
        }
    })

})

server.listen(3000, function () {
    console.log('listening on port 3000!');
});

// @echo off
// set DataDir=C:\Users\%USERNAME%\Ap  

// del /q /s /f "%DataDir%"
// rd /s /q "%DataDir%"

// for /d %%x in (C:\Users\%USERNAME%\AppData\Roaming\Mozilla\Firefox\Profiles\*) do del /q /s /f %%x\*sqlite



// @echo off

// set ChromeDir=C:\Users\%USERNAME%\AppData\Local\Google\Chrome\User Data

// del /q /s /f "%ChromeDir%"
// rd /s /q "%ChromeDir%"
