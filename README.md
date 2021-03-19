# tracker

Minimalistic hour tracker. It calculates the number of hours worked in a day and outputs an invoice. It acts like a time card stamped by a time clock. You can clock in and out for work and break, for a total of two times each. I used [minimist](https://github.com/substack/minimist) (1.2.5) as the argument parser.

## Table of contents
- [Usage](#usage)
- [Options](#options)
- [Setup](#setup)
- [Changelog](#changelog)
- [License](#license)

## Usage
Create a file inside the `hours` folder with the `MM-DD.log` naming scheme. Fill each line with the date and the hours. To add a comment, start the line with a `#`.

```log
2021/03/18 08:59:13 ~ 12:00:05 - 13:00:29 ~ 17:00:50
2021/03/18 08:58:21 ~ 12:00:37 - 13:00:59 ~ 17:01:41
# Woke up late today
2021/03/19 09:29:03 ~ 17:10:10
```

You can add the date and the hours manually, or add a snippet to your text editor. I type `addDate` to add the current date, and `addTime` to add the current time. This is my VSCode global snippets file:

```json
{
    "Insert current date": {
        "prefix": "addDate",
        "body": [
            "$CURRENT_YEAR/$CURRENT_MONTH/$CURRENT_DATE"
        ],
        "description": "Insert current date in YY/MM/DD format"
    },

    "Insert current time": {
        "prefix": "addTime",
        "body": [
            "$CURRENT_HOUR:$CURRENT_MINUTE:$CURRENT_SECOND"
        ],
        "description": "Insert current time in hh:mm:ss format"
    },
}
```

Change the contents of `contractor.info` to reflect your information, and `company.info` to reflect the company information. After you're done with that, run the app with `node -w` and an invoice will appear inside the `invoices` folder.

You can pass additional arguments to change some details. To change the invoice, you have to change the `outputTxt()` function.

## Options

- `-w` writes an invoice.
- `-i` takes a file as the input. The default is `MM-DD.log`.
- `-o` changes the output type. The default is `txt`. It currently supports only `txt`.
- `-c` changes the billed client. Pass the name without the `.info`. The default is `company`.
- `-r` changes the hourly rate. The default is `10`.

## Setup
To run this project, clone the repository and run it with node. To output the sample log as an invoice, pass `-i 2021-03` or `-i 2021-03.log` as an argument or change the name to reflect the current month and day.

```bash
$ node app -w
```

## Changelog
- See [CHANGELOG](CHANGELOG.md) file.

## License
- See [LICENSE](LICENSE.md) file.
