import json
import re
import subprocess
import asyncio
import aiohttp
from telegram import Bot

with open('config.json', 'r') as f:
    config = json.load(f)

bot = Bot(token=config['TELEGRAM_TOKEN'])

async def send_telegram_message(message):
    try:
        await bot.send_message(chat_id=config['CHAT_ID'], text=message)
    except Exception as e:
        print(f"Ошибка при отправке сообщения в Telegram: {e}")

def block_ip(ip):
    command = f"sudo iptables -I INPUT -s {ip} -j DROP"
    try:
        subprocess.run(command, shell=True, check=True)
        print(f"IP {ip} заблокирован.")
    except subprocess.CalledProcessError as e:
        print(f"Ошибка при блокировке IP {ip}: {e}")

async def get_ip_info(ip):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"http://ip-api.com/json/{ip}") as response:
                data = await response.json()
                country = data.get("country")
                city = data.get("city")
                as_name = data.get("as")
                region = data.get("regionName")
                return country, city, as_name, region
    except Exception as e:
        print(f"Ошибка при получении информации о IP {ip}: {e}")
        return None, None, None, None

def monitor_ssh_login():
    journal = subprocess.Popen(['journalctl', '-u', 'ssh.service', '-f', '-n', '0'], stdout=subprocess.PIPE)

    for output in iter(journal.stdout.readline, b''):
        output = output.decode('utf-8')
        match = re.search(r'Failed password for (?:invalid user )?(\w+) from ([\d.]+) port \d+ ssh2', output)

        if match:
            username = match.group(1)
            ip_address = match.group(2)

            country, city, as_name, region = asyncio.run(get_ip_info(ip_address))

            message = f"Попытка входа с IP: {ip_address}\nUsername: {username}\n"
            message += f"Страна: {country}\nГород: {city}\nAS: {as_name}\nРегион: {region}\n"

            asyncio.run(send_telegram_message(message))

            if country == "China":
                block_ip(ip_address)
                message = f"⚠️ Этот IP был заблокирован, так как он из Китая.\nIP заблокирован на 30 дней."
                asyncio.run(send_telegram_message(message))

if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    loop.run_in_executor(None, monitor_ssh_login)
    loop.run_forever()
