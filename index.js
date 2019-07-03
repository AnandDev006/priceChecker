const rp = require('request-promise');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

var http = require('http');

//create a server object:
http
	.createServer(function(req, res) {
		res.write('Hello World!'); //write a response to the client
		res.end(); //end the response
	})
	.listen(8080); //the server object listens on port 8080

const URLs = require('./URLSchema');

const getPrice = async productURL => {
	const html = await rp(productURL);

	let price = cheerio('#priceblock_ourprice', html)['0'].children[0].data;
	price = +price
		.slice(1)
		.trim()
		.replace(/,/g, '');
	return price;
};

const sendMail = async (to, subject, body) => {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'anand.dev.006@gmail.com',
			pass: process.env.MAIL_PASSWORD,
		},
	});

	const mailOptions = {
		from: 'anand.dev.006@gmail.com',
		to,
		subject,
		html: body,
	};

	try {
		const res = await transporter.sendMail(mailOptions);
		console.log('Email sent successfully');
	} catch (error) {
		console.log('Error sending email', error);
	}
};

async function check(URL, maxPrice, toEmail) {
	try {
		const price = await getPrice(URL);
		if (price < maxPrice) {
			await sendMail(
				toEmail,
				`New Price ${new Date().getTime()}`,
				`<p>Product URL : <a href="${URL}">LINK</a></p>`
			);
		}
	} catch (error) {
		console.log('Error in check', error);
	}
}

const poll = async interval => {
	try {
		setTimeout(async function repeat() {
			await mongoose.connect(
				`mongodb+srv://anand:${
					process.env.MONGO_PASSWORD
				}@products-qjo91.mongodb.net/test?retryWrites=true&w=majority`,
				{ useNewUrlParser: true }
			);

			const res = await URLs.find();

			res.forEach(({ url, maxPrice, toEmail }) => {
				check(url, maxPrice, toEmail);
			});

			mongoose.connection.close();

			setTimeout(repeat, interval);
		}, 0);
	} catch (error) {
		console.log('Error in polling', error);
	}
};

poll(1000 * 60 * 60);
