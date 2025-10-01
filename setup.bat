@echo off
echo Installing Django Backend...

REM Create virtual environment
python -m venv venv

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install requirements
pip install -r requirements.txt

REM Create .env file from example
if not exist .env (
    copy .env.example .env
    echo Please edit .env file with your settings
)

REM Run migrations
python manage.py makemigrations
python manage.py migrate

REM Create superuser (optional)
echo.
echo Create a superuser account:
python manage.py createsuperuser

echo.
echo Setup complete! Run 'python manage.py runserver' to start the server.
pause
