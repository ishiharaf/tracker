const fs = require("fs")
const path = require("path")

const writeFile = (file, data) => {
	fs.writeFile(file, data, err => {
		if (err) return console.error(err)
	})
}

const getYear = (date) => {
	return date.getFullYear().toString()
}
const getMonth = (date) => {
	return (date.getMonth() + 1).toString().padStart(2, "0")
}

const getDate = (date) => {
	return date.getDate().toString().padStart(2, "0")
}

const getHours = (minutes) => {
	const hour = Math.floor(minutes / 60).toString().padStart(2, "0")
	const minute = Math.floor(minutes % 60).toString().padStart(2, "0")
	return `${hour}:${minute}`
}

const getHoursDec = (minutes) => {
	return (minutes / 60).toFixed(2)
}

const getMinutesDiff = (startDate, endDate) => {
	const seconds = 1000, minutes = 60
	return Math.floor(((endDate - startDate) / seconds) / minutes)
}

const getBillableTime = (day) => {
	const billable = getMinutesDiff(day.workStart, day.workEnd)
	if (day.breakStart) {
		const unbillable = getMinutesDiff(day.breakStart, day.breakEnd)
		return billable - unbillable
	}
	return billable
}

const getTotalTime = (day) => {
	return getMinutesDiff(day.workStart, day.workEnd)
}

const getAmount = (minutes, rate) => {
	const hours = argv.d ? Number((minutes / 60).toFixed(2)) : minutes / 60
	return (hours * rate).toFixed(2)
}

const getCompany = () => {
	const file = `${argv.c}.info`
	const folder = "info"
	return path.resolve(folder, file)
}

const getContractor = () => {
	const file = "contractor.info"
	const folder = "info"
	return path.resolve(folder, file)
}

const getHtml = () => {
	const file = "invoice.html"
	const folder = "templates"
	return path.resolve(folder, file)
}

const getInvoice = (log) => {
	const file = `${path.basename(log, path.extname(log))}.${argv.o}`
	const folder = "invoices"
	return path.resolve(folder, file)
}

const getLog = (date) => {
	const file = `${getYear(date)}-${getMonth(date)}.log`
	const folder = "hours"
	return path.resolve(folder, file)
}

const splitLines = (lines) => {
	return lines.split(/\r\n|\n\r|\n|\r/)
}

const filterLine = (line) => {
	const filter = ["~", "-"]
	const arr = line.split(" ")
	return arr.filter(el => !filter.includes(el))
}

const filterArray = (arr) => {
	const filter = [null, ""]
	return arr.filter(el => !filter.includes(el))
}

const formatTxtHours = (log) => {
	let result = ""
	for (let i = 0; i < log.length; i++) {
		const line = log[i].split(" ")
		const date = line[0]
		const minutes = line[1]
		const hours = argv.d ? getHoursDec(minutes) : getHours(minutes)
		const rate = argv.r
		const amount = getAmount(minutes, rate)

		result += `${date} > ${hours} x $${rate} = $${amount}\n`
	}
	return result
}

const outputTxt = (file, info) => {
	const invoice = getInvoice(file)
	const contractor = fs.readFileSync(getContractor()).toString()
	const company = fs.readFileSync(getCompany()).toString()
	const minutes = info.billable
	const hours = argv.d ? getHoursDec(minutes) : getHours(minutes)
	const rate = argv.r

	const now = new Date()
	let txt = `INVOICE #${getYear(now)}${getMonth(now)}${getDate(now)}\n` +
				`${getYear(now)}/${getMonth(now)}/${getDate(now)}\n\n` +
				`SENDER\n` +
				`${contractor}\n\n` +
				`RECIPIENT\n` +
				`${company}\n\n` +
				`DATE         HOURS   RATE   AMOUNT\n` +
				`${formatTxtHours(info.log)}\n` +
				`     HOURS = ${hours}\n` +
				`    AMOUNT = $${getAmount(minutes, rate)}`
	writeFile(invoice, txt)
}

const outputMd = (file, info) => {
	const invoice = getInvoice(file)
	const contractor = fs.readFileSync(getContractor()).toString()
	const company = fs.readFileSync(getCompany()).toString()
	const rate = argv.r

	const now = new Date()
	writeFile(invoice, txt)
}

const formatHtmlLog = (log) => {
	let result = ""
	for (let i = 0; i < log.length; i++) {
		const line = log[i].split(" ")
		const date = line[0]
		const minutes = line[1]
		const hours = argv.d ? getHoursDec(minutes) : getHours(minutes)
		const rate = argv.r
		const amount = getAmount(minutes, rate)
		const div = `\t\t<div class="day">\n` +
						`\t\t\t<div class="item">${date}</div>\n` +
						`\t\t\t<div class="item">${hours}</div>\n` +
						`\t\t\t<div class="item">$${rate}</div>\n` +
						`\t\t\t<div class="amount end">$${amount}</div>\n` +
					`\t\t</div>\n`

		result += div
	}
	return result
}

const outputHtml = (file, info) => {
	const invoice = getInvoice(file)
	const contractor = fs.readFileSync(getContractor()).toString()
	const company = fs.readFileSync(getCompany()).toString()
	const template = fs.readFileSync(getHtml()).toString()
	const position = template.search("<body>") + 6
	const minutes = info.billable
	const hours = argv.d ? getHoursDec(minutes) : getHours(minutes)
	const rate = argv.r

	const now = new Date()
	const content = `\n\t<div id="title">Invoice #${getYear(now)}${getMonth(now)}${getDate(now)}</div>\n` +
					`\t<div id="subtitle">${getYear(now)}/${getMonth(now)}/${getDate(now)}</div>\n` +
					`\t<div class="divisor"></div>\n` +
					`\t<div id="info" class="header">\n` +
						`\t\t<div class="item">\n` +
							`\t\t\t<p>Sender</p>\n` +
							`\t\t\t<div>${contractor}</div>\n` +
						`\t\t</div>\n` +
						`\t\t<div class="item">\n` +
							`\t\t\t<p>Recipient</p>\n` +
							`\t\t\t<div>${company}</div>\n` +
						`\t\t</div>\n` +
					`\t</div>\n` +
					`\t<div id="expenses" class="header">\n` +
						`\t\t<div class="separator"></div>\n` +
						`\t\t<div class="item"><p>Date</p></div>\n` +
						`\t\t<div class="item"><p>Hours</p></div>\n` +
						`\t\t<div class="item"><p>Rate</p></div>\n` +
						`\t\t<div class="amount end"><p>Amount</p></div>\n` +
					`\t</div>\n` +
					`\t<div id="log">\n${formatHtmlLog(info.log)}` +
					`\t</div>\n` +
					`\t<div class="total">\n` +
						`\t\t<div><b>Total Hours</b></div>\n` +
						`\t\t<div class="end">${hours}</div>\n` +
					`\t</div>\n` +
					`\t<div class="total">\n` +
						`\t\t<div><b>Total Amount</b></div>\n` +
						`\t\t<div class="end">$${getAmount(minutes, rate)}</div>\n` +
					`\t</div>\n`

	const html = template.slice(0, position) + content + template.slice(position)
	writeFile(invoice, html)
}

const isSameDay = (start, end) => {
	if (end > start) {
		return true
	}
	return false
}

const getWorkDay = (line) => {
	const day = {
		workStart: undefined, workEnd: undefined,
		breakStart: undefined, breakEnd: undefined
	}
	const log = filterLine(line)
	const start = new Date(`${log[0]} ${log[1]}`)
	const end = new Date(`${log[0]} ${log[log.length - 1]}`)

	if (log.length === 3) {
		if (!isSameDay(start, end)) {
			end.setDate(end.getDate() + 1)
		}
	}
	if (log.length === 5) {
		const breakStart = new Date(`${log[0]} ${log[2]}`)
		const breakEnd = new Date(`${log[0]} ${log[3]}`)

		if (!isSameDay(start, breakStart)) {
			breakStart.setDate(breakStart.getDate() + 1)
		}
		if (!isSameDay(breakStart, breakEnd)) {
			breakEnd.setDate(breakEnd.getDate() + 1)
		}
		if (!isSameDay(breakEnd, end)) {
			end.setDate(end.getDate() + 1)
		}
		day.breakStart = breakStart, day.breakEnd = breakEnd
	}
	day.workStart = start, day.workEnd = end
	return day
}

const parseLog = (file) => {
	fs.readFile(file, "utf-8", (err, data) => {
		if (err) return console.error(`Couldn't read ${file}`)

		let totalBillable = 0, totalUnbillable = 0, log = []
		const lines = splitLines(data)
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i]
			if (line.charAt(0) !== "#") {
				const day = getWorkDay(line)
				const billable = getBillableTime(day)
				const unbillable = getTotalTime(day)
				const date = line.slice(0, 10)

				totalBillable += billable, totalUnbillable += unbillable
				log.push(`${date} ${billable}`)
			}
		}
		const info = {
			billable: totalBillable, unbillable: totalUnbillable, log: log
		}

		if (argv.o === "txt") outputTxt(file, info)
		if (argv.o === "html") outputHtml(file, info)
		if (argv.o === "all") {
			outputTxt(file, info)
			outputHtml(file, info)
		}
	})
}

const parser = require("./parser")
const defaults = {
	w: false,
	i: getLog(new Date()),
	o: "txt",
	c: "company",
	d: false,
	r: 16
}
const args = process.argv.slice(2)
const argv = parser(args, opts={default: defaults})

if (argv.w) {
	parseLog(argv.i)
}