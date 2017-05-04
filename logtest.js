const log4js = require('log4js');
log4js.configure({

    appenders: [
        {
            type: 'console',
            category: "console"

        }, //控制台输出
        {
            type: "dateFile",
            //  绝对路径
            filename: '/log/hangaoke',
            pattern: "_yyyyMMdd.log",
            absolute: true,
            alwaysIncludePattern: true,
            // maxLogSize: 20480,
            // backups: 3,
            category: 'logInfo'

        }//日期文件格式
    ],
    replaceConsole: true,   //替换console.log
    levels:{
        logInfo: 'info', //info及以上级别输出到日志文件
        console: 'debug' //debug及以上级别输出到控制台
    }
});

const logger = log4js.getLogger('logInfo'); 
const logger2 = log4js.getLogger('console'); 

logger2.debug('hello 校的事发生');
logger2.info('hello 校的事发生');
console.log('hahaha');
logger.trace('Entering cheese testing');
logger.debug('Got cheese.');
logger.info('Cheese is Gouda.');
logger.warn('Cheese is quite smelly.');
logger.error('Cheese is too ripe!');
logger.fatal('盛大发售');