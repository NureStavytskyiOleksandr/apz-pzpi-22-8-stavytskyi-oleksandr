import discord
from discord.ext import commands

intents = discord.Intents.default()
intents.message_content = True 
bot = commands.Bot(command_prefix='!', intents=intents)

# === Обробка команд (Посередник) ===
@bot.event
async def on_ready():
    print(f'✅ Бот підключено як {bot.user}')

@bot.command()
async def ping(ctx):
    await ctx.send('🏓 Pong!')

@bot.command()
async def help(ctx):
    await ctx.send('🆘 Доступні команди: !ping, !help')

@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.CommandNotFound):
        cmd = ctx.message.content.split()[0][1:]
        await ctx.send(f'❌ Невідома команда: {cmd}')

bot.run('TOKEN') 
