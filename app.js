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

const getHours = (time) => {
	const hour = Math.floor(time / 60).toString().padStart(2, "0")
	const minute = Math.floor(time % 60).toString().padStart(2, "0")
	return `${hour}:${minute}`
}

const getBillableTime = (day) => {
	const billable = ((day.workEnd - day.workStart) / 1000) / 60
	let work = billable

	if (day.breakStart) {
		const unbillable = ((day.breakEnd - day.breakStart) / 1000) / 60
		work = work - unbillable
	}
	return work
}

const getTotalTime = (day) => {
	return ((day.workEnd - day.workStart) / 1000) / 60
}

const getBillTotal = (billable, rate) => {
	return ((Math.floor(billable) / 60) * rate).toFixed(2)
}

const getCompany = () => {
	const file = "company.info"
	const folder = "info"
	return path.resolve(folder, file)
}

const getContractor = () => {
	const file = "contractor.info"
	const folder = "info"
	return path.resolve(folder, file)
}

const getInvoice = (log) => {
	const file = `${path.basename(log, path.extname(log))}.txt`
	const folder = "invoices"
	return path.resolve(folder, file)
}

const getCurrentLog = (date) => {
	const file = `${getYear(date)}-${getMonth(date)}.log`
	const folder = "hours"
	return path.resolve(folder, file)
}

const getLog = (arg) => {
	const file = `${path.basename(arg, path.extname(arg))}.log`
	const folder = "hours"
	return path.resolve(folder, file)
}

const isSameDay = (start, end) => {
	if (end > start) {
		return true
	}
	return false
}

const filterLine = (line) => {
	const filter = ["~", "-"]
	const arr = line.split(" ")
	return arr.filter(el => !filter.includes(el))
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

const writeInvoice = (file, info) => {
	const invoice = getInvoice(file)
	const contractor = fs.readFileSync(getContractor()).toString()
	const company = fs.readFileSync(getCompany()).toString()
	const rate = 16

	const now = new Date()
	let header = `INVOICE\n` +
				`Date: ${getYear(now)}/${getMonth(now)}/${getDate(now)}\n` +
				`Invoice number: ${getYear(now)}${getMonth(now)}${getDate(now)}\n\n` +
				`${contractor}\n\n` +
				`BILLED TO\n` +
				`${company}\n\n` +
				`${info.log}\n` +
				`  BILLABLE = ${getHours(info.billable)}\n` +
				`UNBILLABLE = ${getHours(info.unbillable)}\n` +
				`      RATE = $${rate}\n` +
				`     TOTAL = $${getBillTotal(info.billable, rate)}`
	writeFile(invoice, header)
}

const splitLines = (data) => {
	return data.split(/\r\n|\n\r|\n|\r/)
}

const billWork = (file) => {
	fs.readFile(file, "utf-8", (err, data) => {
		if (err) return console.error(`Couldn't read ${file}`)

		let totalBillable = 0, totalUnbillable = 0, days = 0, log = ""
		const lines = splitLines(data)
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i]
			if (line.charAt(0) !== "#") {
				const day = getWorkDay(line)
				const billable = getBillableTime(day)
				const unbillable = getTotalTime(day)
				const workHours = getHours(billable)
				const date = line.slice(0, 10)
				const hours = line.slice(11)

				totalBillable += billable, totalUnbillable += unbillable
				days += 1, log += `${date} = ${workHours} -> ${hours}\n`
			}
		}
		const info = {
			billable: totalBillable, unbillable: totalUnbillable,
			days: days, log: log
		}
		writeInvoice(file, info)
	})
}

const isDate = (date) => {
	const timestamp = Date.parse(date)
	if(!isNaN(timestamp)) {
		return true
	}
	return false
}

const isLog = (arg) => {
	if (arg.includes(".log")) {
		return true
	}
	if (isDate(arg)) {
		return true
	}
	return false
}

const parser = require("./parser")
const defaults = {w: false, i: getCurrentLog(new Date()), o: "txt", r: 16}
const args = process.argv.slice(2)
const argv = parser(args, opts={default: defaults})

if (argv.w) {
	billWork(argv.i)
}