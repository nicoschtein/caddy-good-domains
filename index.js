require('dotenv').config()
const polka = require('polka')
const send = require('@polka/send-type');
const app = polka();
const fs = require("fs-extra")
const PORT = process.env.PORT || 707;
const CONFIG_FILE = process.env.CONFIG_FILE || './good-domains.txt';
const readFileLines = filename =>
    fs
        .readFileSync(filename)
        .toString('UTF8')
        .split('\n');

function loadConfig(file) {
    console.log(`Loading config file...`, file);
    try {
        const domains = [...new Set(readFileLines(file))].filter((letter) => letter !== "");
        console.log(`Loaded ${domains.length} domains from ${file}`);
        if (domains.length == 0) {
            console.log("Started with no good domain, all requests will fail.");
        }
        return domains;
    } catch (e) {
        if (e.code == "ENOENT") {
            console.error("Invalid config file, doesn't exist:", file);
        } else {
            console.error("Invalid config file:", file, "generic error:", e);
        }
        process.exit(1);
    }
}
const valid_domains = loadConfig(CONFIG_FILE);

function isValidDomain(dom) {
    return valid_domains.includes(dom);
}

app.get('/', (req, res) => {
    if (req.query && req.query.domain && req.query.domain.length > 0) {
        if (isValidDomain(req.query.domain)) {
            console.log("Received domain:", req.query.domain, "OK!");
            send(res, 200);
        } else {
            console.log("Received domain:", req.query.domain, "INVALID!");
            send(res, 404);
        }
    } else {
        console.log("Received invalid request.");
        send(res, 404);
    }
})

app.listen(PORT, err => {
    if (err) throw err;
    console.log(`Server listening on port ${PORT}`);
})
