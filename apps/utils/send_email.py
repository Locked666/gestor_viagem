import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from apps.config import MAIL_SERVER, MAIL_PORT, MAIL_USE_TLS, MAIL_USER, MAIL_PASSWORD


print('Sending email configuration loaded from environment variables.')
print(f'MAIL_SERVER: {MAIL_SERVER}, MAIL_PORT: {MAIL_PORT}, MAIL_USE_TLS: {MAIL_USE_TLS}')
print(f'MAIL_USER: {MAIL_USER}')
print(f'MAL_PASSWORD: {"*" * len(MAIL_PASSWORD) if MAIL_PASSWORD else "Not set"}')