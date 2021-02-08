"use strict";

const execSync = require("child_process").execSync;
const puppeteer = require("puppeteer");
const term = require("terminal-kit").terminal;
const fs = require("fs");
var https = require("https");
const url = require("url");
const path = require("path");
const yargs = require("yargs");
var m3u8Parser = require("m3u8-parser");
const request = require("request");
const notifier = require("node-notifier");
const process = require("process");
const prompt = require("prompt");
const keytar = require("keytar");

const argv = yargs
	.options({
		v: {
			alias: "videoUrls",
			type: "array",
			demandOption: false,
		},
		f: {
			alias: "videoUrlsFile",
			type: "string",
			demandOption: false,
			describe:
				"Path to txt file containing the URLs (one URL for each line)",
		},
		u: {
			alias: "username",
			type: "string",
			demandOption: true,
			describe: "Codice Persona (Es: m.rossi4)",
		},
		p: {
			alias: "password",
			type: "string",
			demandOption: false,
		},
		k: {
			alias: "noKeyring",
			type: "boolean",
			default: false,
			demandOption: false,
			describe: "Do not use system keyring",
		},
		t: {
			alias: "noToastNotification",
			type: "boolean",
			default: false,
			demandOption: false,
			describe: "Disable notifications",
		},
	})
	.help("h")
	.alias("h", "help")
	.example(
		'node $0 -u CODICEPERSONA -v "https://elearning.unimib.it/mod/kalvidres/view.php?id=65435"\n',
		"Standard usage"
	).argv;

function sanityChecks() {
	try {
		const aria2Ver = execSync("aria2c --version").toString().split("\n")[0];
		term.green(`Using ${aria2Ver}\n`);
	} catch (e) {
		term.red(
			"Necessiti di aria2c in questa cartella! (O aggiunto in $PATH)."
		);
		process.exit(22);
	}
	try {
		const ffmpegVer = execSync("ffmpeg -version").toString().split("\n")[0];
		term.green(`Using ${ffmpegVer}\n\n`);
	} catch (e) {
		term.red(
			"Necessiti di ffmpeg in questa cartella! (O aggiunto in $PATH)."
		);
		process.exit(23);
	}
	if (argv.videoUrls === undefined && argv.videoUrlsFile === undefined) {
		term.red("Mancano gli indirizzi dei video.\n");
		process.exit();
	}
	if (argv.videoUrls !== undefined && argv.videoUrlsFile !== undefined) {
		term.red(
			"Devi scegliere: o li metti in un file o ne scrivi uno su riga di comando.\n"
		);
		process.exit();
	}
	if (argv.videoUrlsFile !== undefined) argv.videoUrls = argv.videoUrlsFile; // merge argument
}

function readFileToArray(path) {
	path = path.substr(1, path.length - 2);
	if (process.platform === "win32")
		//check OS
		return fs.readFileSync(path).toString("utf-8").split("\r\n"); //Windows procedure
	return fs.readFileSync(path).toString("utf-8").split("\n"); //Bash procedure
}

function parseVideoUrls(videoUrls) {
	let stringVideoUrls = JSON.stringify(videoUrls);
	if (stringVideoUrls.substr(stringVideoUrls.length - 5) == '.txt"')
		// is path?
		return readFileToArray(stringVideoUrls);
	return videoUrls;
}

const notDownloaded = []; // take trace of not downloaded videos

async function downloadVideo(videoUrls, username, password, outputDirectory) {
	// handle password
	if (password === undefined) {
		// password not passed as argument
		var password = {};
		if (argv.noKeyring === false) {
			try {
				await keytar
					.getPassword("CoccaDown", username)
					.then(function (result) {
						password = result;
					});
				if (password === null) {
					// no previous password saved
					password = await prompt(
						"Password non salvata. Scrivila di seguito e non sarà necesseraio reinserirla :-)    "
					);
					await keytar.setPassword("CoccaDown", username, password);
				} else {
					console.log("Riutilizzo password salvata");
				}
			} catch (e) {
				console.log(
					"Non trovo X11 installato e perciò la password non può essere salvata."
				);
				password = await prompt(
					"Nessun problema, inseriscila manualmente: "
				);
			}
		} else {
			password = await prompt("Password: ");
		}
	} else {
		if (argv.noKeyring === false) {
			try {
				await keytar.setPassword("CoccaDown", username, password);
				console.log("Password salvata!");
			} catch (e) {
				// X11 is missing. Can't use keytar
			}
		}
	}
	console.log("\nInizio le operazioni di connessione a e-learning");
	const browser = await puppeteer.launch({
		// Switch to false if you need to login interactively
		executablePath: "bin\\chrome.exe",
		headless: true,
		args: ["--lang=it-IT"],
	});

	const page = await browser.newPage();
	await page.goto("https://elearning.unimib.it/login/index.php", {
		waitUntil: "networkidle2",
	});
	await page.click('a[class="btn btn-primary btn-block"]');

	console.log("Inserisco le credenziali per l'accesso");

	const usernameEmail = username + "@campus.unimib.it";
	await page.waitForSelector('form[name="loginForm"]');
	await page.type("input#username", usernameEmail); // mette il codice persona
	await page.type("input#password", password); // mette la password
	await page.click('button[class="form-element form-button"]'); // clicca sul tasto "Accedi"

	try {
		await page.waitForSelector('p[class="form-element form-error"]', {
			timeout: 1000,
		});
		//  console.log(page.url());
		term.red("Bad credentials \n ");
		await sleep(10000);
		// process.exit(401);
	} catch (error) {
		// tutto ok
	}
	//-----------------------------------------------------------

	await browser.waitForTarget((target) =>
		target.url().includes("elearning.unimib")
	);
	console.log("Loggàti!");

	await sleep(10);

	var text4 = "";
	await page.setRequestInterception(true);
	page.on("request", (request) => {
		const body = request.url();
		if (body.includes("analytics")) {
			request.abort();
		} else {
			if (body.includes("index") && body.includes("cfvod")) {
				text4 = body;
			}
			request.continue();
		}
	});

	//---------------------------

	for (var videoUrl of videoUrls) {
		term.green(`\nStart downloading video: ${videoUrl}\n`);
		try {
			await page.goto(`${videoUrl}`, 
				{timeout: 20000}
			);
		} catch (e) {
			console.log("Non riesco a raggiungere il sito");
			console.log(e);
			notDownloaded.push(videoUrl);
			console.log("Errore con " + videoUrl);
			continue;
		}

		try {
			await page.waitForSelector(
				'span[class="card-title course-fullname text-truncate"]',
				{timeout: 10000}
			);
		} catch (e) {
			console.log("Non trovo il selettore di riconoscimento");
			notDownloaded.push(videoUrl);
			console.log("Errore con " + videoUrl);
			continue;
		}

		try {
			const element = await page.$(".card-title");
			const text = await page.evaluate(
				(element) => element.textContent,
				element
			);
			console.log("Corso: " + text);
		} catch (e) {
			console.log("Non trovo il nome del corso");
			notDownloaded.push(videoUrl);
			console.log("Errore con " + videoUrl);
			continue;
		}

		try {
			const titolo_sel = await page.waitForSelector(
				'a[title="Kaltura Video Resource"]'
			);
			var titolo = await page.evaluate(
				(titolo_sel) => titolo_sel.textContent,
				titolo_sel
			);
			titolo = titolo.replace(/ /g, "_");
			titolo = titolo.replace(/\:/g, "_");
			titolo = titolo.replace(/\//g, "-");
			console.log("Titolo: " + titolo);
		} catch (e) {
			console.log("Non trovo il titolo del video");
			notDownloaded.push(videoUrl);
			console.log("Errore con " + videoUrl);
			continue;
		}

		var second_frame;
		try {
			await page.waitForSelector('iframe[class="kaltura-player-iframe"]');
			const elementHandle = await page.$(
				'iframe[class="kaltura-player-iframe"]'
			);
			const first_frame = await elementHandle.contentFrame();

			await first_frame.waitForSelector(
				'iframe[class="mwEmbedKalturaIframe"]'
			);
			const elementHandle2 = await first_frame.$(
				'iframe[class="mwEmbedKalturaIframe"]'
			);
			second_frame = await elementHandle2.contentFrame();
		} catch (e) {
			console.log("Problemi coi frame... sono rognosetti");
			notDownloaded.push(videoUrl);
			console.log("Errore con " + videoUrl);
			continue;
		}

		try {
			await second_frame.waitForSelector(
				'a[class="icon-play  comp largePlayBtn  largePlayBtnBorder"]',
				{timeout: 10000, waitUntil: "load"}
			);
			await second_frame.click(
				'a[class="icon-play  comp largePlayBtn  largePlayBtnBorder"]'
			);
			while (text4 == "") {
				await sleep(100);
			}
		} catch (e) {
			console.log("Problema col playbutton");
			console.log(e);
			notDownloaded.push(videoUrl);
			console.log("Errore con " + videoUrl);
			continue;
		}

		try {
			console.log("Scarico l'indice dei frammenti");
			var ffmpegCmd =
				'aria2c --summary-interval=0 --console-log-level=error --download-result=hide  "' +
				text4 +
				'" -o index.m3u8 -d temp';
			var ffmpegOpts = {
				stdio: "inherit",
			};
			var result = execSync(ffmpegCmd, ffmpegOpts);

			console.log(
				"\nScarico tutti i frammenti del video. (Questa operazione può richiedere un po' di tempo)"
			);
			ffmpegCmd =
				"aria2c --summary-interval=0 --console-log-level=error --download-result=hide -j 16 -x 16 -i temp/index.m3u8 -d temp ";
			var result = execSync(ffmpegCmd, ffmpegOpts);

			console.log(
				"\nUnisco i frammenti in un unico file mp4 (ancora qualche minuto)"
			);
			ffmpegCmd =
				"ffmpeg -protocol_whitelist file,http,https,tcp,tls,crypto,data -allowed_extensions ALL -hide_banner -loglevel warning -i temp/index.m3u8 -c copy -y videos/" +
				titolo +
				".mp4";
			var result = execSync(ffmpegCmd, ffmpegOpts);
		} catch (e) {
			console.log("Problema col download / unione");
			notDownloaded.push(videoUrl);
			console.log("Errore con " + videoUrl);
			continue;
		} finally {
			try {
				const dir = "temp";
				fs.rmdir(dir, {recursive: true}, (err) => {
					if (err) {
						throw err;
					}
				});
			} catch (err) {}
		}
	}

	browser.close();

	if (notDownloaded.length > 0)
		console.log(
			"\nQuesti video non sono stati scaricati (mi spiace): %s\n",
			notDownloaded
		);
	else console.log("\nTutti i video sono stati scaricati con successo!\n");
	term.green(`Finito!\n`);
	if (argv.noToastNotification === false) {
		require("node-notifier").notify(
			{
				title: "BicoccaDownloadTool",
				message: "Finito.",
				appID: "https://nodejs.org/", // Such a smart assignment to avoid SnoreToast start menu link. Don't say to my mother.
			},
			function (error, response) {
				/*console.log(response);*/
			}
		);
	}
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

term.brightBlue(
	`Progetto basato su PoliDown di sup3rgiu github.com/sup3rgiu \n`
);
sanityChecks();
const videoUrls = parseVideoUrls(argv.videoUrls);
console.info("Video da scaricare: %s", videoUrls);
console.info("Username: %s", argv.username);
console.info("Video salvati in: videos");
downloadVideo(videoUrls, argv.username, argv.password, argv.outputDirectory);
