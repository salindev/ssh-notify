
# SSH Login Monitor Bot

Этот проект отслеживает неудачные попытки входа по SSH и отправляет уведомления в Telegram. Скрипт блокирует IP-адреса при обнаружении попыток входа из Китая и предоставляет информацию об IP через IP-API.

## Установка и запуск

### 1. Для Python:

#### Установите необходимые пакеты
Сначала убедитесь, что у вас установлены необходимые библиотеки. Используйте `pip` для установки:

```bash
pip install python-telegram-bot aiohttp
```

#### Настройте конфигурацию
Создайте файл `config.json` в корневой папке проекта, если он еще не создан:

```json
{
    "TELEGRAM_TOKEN": "YOUR_TELEGRAM_TOKEN",
    "CHAT_ID": "YOUR_CHAT_ID",
    "IPDB_API_KEY": "НА_ЭТО_ХУЙ_ЗАБЕЙ",
    "SSH_SERVICE": "ssh.service"
}
```

Замените `YOUR_TELEGRAM_TOKEN` и `YOUR_CHAT_ID` на ваш токен и ID чата Telegram.

#### Запустите скрипт
Запустите мониторинг с помощью Python:

```bash
python3 bot.py
```

### 2. Для JavaScript:

#### Установите необходимые пакеты
Используйте `npm` для установки зависимостей:

```bash
npm install node-telegram-bot-api got
```

#### Настройте конфигурацию
Создайте файл `config.json` в корневой папке проекта:

```json
{
    "TELEGRAM_TOKEN": "YOUR_TELEGRAM_TOKEN",
    "CHAT_ID": "YOUR_CHAT_ID",
    "IPDB_API_KEY": "НА_ЭТО_ХУЙ_ЗАБЕЙ",
    "SSH_SERVICE": "ssh.service"
}
```

Замените `YOUR_TELEGRAM_TOKEN` и `YOUR_CHAT_ID` на ваш токен и ID чата Telegram.

#### Запустите скрипт
Запустите мониторинг с помощью Node.js:

```bash
node bot.js
```

## Примечание
Этот бот требует доступ к системным логам и командам управления сетевыми правилами (iptables). Убедитесь, что у скрипта достаточно прав для выполнения команд.
