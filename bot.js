const { spawn, exec } = require('child_process');
const TelegramBot = require('node-telegram-bot-api');
const got = require('got');
const fs = require('fs');

const CONFIG_PATH = 'config.json';

if (!fs.existsSync(CONFIG_PATH)) {
    const defaultConfig = {
        TELEGRAM_TOKEN: "TOKEN_TELEGRAM",
        CHAT_ID: "CHAT_ID",
        IPDB_API_KEY: "НА_ЭТО_ХУЙ_ЗАБЕЙ",
        SSH_SERVICE: "ssh.service"  // не советую менять
    };

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 4), 'utf8');
    console.log("Конфигурационный файл 'config.json' был создан с настройками по умолчанию.");
    process.exit()
}

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

const bot = new TelegramBot(config.TELEGRAM_TOKEN, { polling: false });

function sendTelegramMessage(message) {
    bot.sendMessage(config.CHAT_ID, message).catch(err => console.error('Ошибка при отправке сообщения:', err));
}

function blockIP(ip, reason) {
    const command = `sudo iptables -I INPUT -s ${ip} -j DROP`;
    exec(command, (error) => {
        if (error) {
            console.error(`Ошибка блокировки IP ${ip}:`, error);
        } else {
            sendTelegramMessage(`IP ${ip} заблокирован на 30 дней.\nПричина: ${reason}`);
        }
    });
}

async function getIPInfo(ip) {
    try {
        const response = await got(`http://ip-api.com/json/${ip}`).json();
        const { country, city, as, regionName } = response;
        return {
            isChinese: country === 'China',
            country,
            city,
            as,
            region: regionName
        };
    } catch (error) {
        console.error('Ошибка при проверке IP через ip-api:', error);
        return null;
    }
}

const journal = spawn('journalctl', ['-u', config.SSH_SERVICE, '-f', '-n', '0']);

journal.stdout.on('data', async (data) => {
    const output = data.toString();
    const match = output.match(/Failed password for (?:invalid user )?(\w+) from ([\d.]+) port \d+ ssh2/);

    if (match) {
        const username = match[1];
        const ipAddress = match[2];

        const ipInfo = await getIPInfo(ipAddress);

        if (ipInfo) {
            const { isChinese, country, city, as, region } = ipInfo;

            let message = `Попытка входа с IP: ${ipAddress}\nUsername: ${username}\n`;
            message += `Страна: ${country}\nГород: ${city}\nAS: ${as}\nРегион: ${region}\n`;

            if (isChinese) {
                blockIP(ipAddress, 'Китайский IP');
                message += `⚠️ Этот IP был заблокирован, так как он из Китая.\nIP заблокирован на 30 дней.`;
            }

            sendTelegramMessage(message);
        }
    }
});

journal.stderr.on('data', (data) => {
    console.error(`Ошибка: ${data}`);
});

journal.on('close', (code) => {
    console.log(`Процесс journalctl завершился с кодом ${code}`);
});
