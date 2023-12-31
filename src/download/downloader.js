const { spawnSync, spawn } = require("child_process")
const { mkdirSync, existsSync } = require("fs")
const { dirname } = require("path")

const downloadFiles = async (downloads, filecount, logger) => {
    if (downloads.length == 0) return true
    else if (filecount === undefined) {
        downloads = downloads.filter(download => !existsSync(download[1]))
        return await downloadFiles(downloads, downloads.length, logger)
    } else {
        const url = downloads[0][0]
        const file = downloads[0][1]
        const filename = url.split('/').pop()
        if (!existsSync(dirname(file))) {
            mkdirSync(dirname(file), {recursive: true})
            logger(`Successfully created directory ${dirname(file)} (${downloads.length}/${filecount} remaining)`)
        }
        logger(`Downloading ${url.split('/').pop()}...`)
        if (spawnSync('curl', ['--fail-with-body', '-L', url, '-o', file]).status == 0) {
            downloads.shift()
            logger(`Successfully downloaded ${filename} (${downloads.length}/${filecount} remaining)`)
            return await downloadFiles(downloads, filecount, logger)
        } else {
            logger(`Couldn't download ${filename}; Trying again in 5 seconds... (${downloads.length}/${filecount} remaining)`)
            await new Promise(resolve => setTimeout(resolve, 5000))
            return await downloadFiles(downloads, filecount, logger)
        }
    }
}

const downloadFilesAsync = (downloads, filecount, logger, callback) => {
    if (downloads.length == 0) callback(true)
    else if (filecount === undefined) {
        downloads = downloads.filter(download => !existsSync(download[1]))
        downloadFilesAsync(downloads, downloads.length, logger, callback)
    } else {
        const url = downloads[0][0]
        const file = downloads[0][1]
        const filename = url.split('/').pop()
        if (!existsSync(dirname(file))) {
            mkdirSync(dirname(file), {recursive: true})
            logger(`Successfully created directory ${dirname(file)} (${downloads.length}/${filecount} remaining)`)
        }
        logger(`Downloading ${url.split('/').pop()}...`)
        spawn('curl', ['--fail-with-body', '-L', url, '-o', file]).on('exit', (status, signal) => {
            if (status == 0) {
                downloads.shift()
                logger(`Successfully downloaded ${filename} (${downloads.length}/${filecount} remaining)`)
                downloadFilesAsync(downloads, filecount, logger, callback)
            } else {
                logger(`Couldn't download ${filename}; Trying again in 5 seconds... (${downloads.length}/${filecount} remaining)`)
                setTimeout(() => downloadFilesAsync(downloads, filecount, logger, callback), 5000)
            }
        })
    }
}

module.exports = {downloadFiles, downloadFilesAsync}