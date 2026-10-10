#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    # Ensure SQLite is used if DB_ENGINE is not explicitly configured
    if 'DB_ENGINE' not in os.environ:
        os.environ['DB_ENGINE'] = 'sqlite'

    # Auto-link local venv site-packages so python manage.py works with any Python interpreter
    from pathlib import Path
    base_dir = Path(__file__).resolve().parent
    venv_site_packages = base_dir / 'venv' / 'Lib' / 'site-packages'
    if venv_site_packages.exists() and str(venv_site_packages) not in sys.path:
        sys.path.insert(0, str(venv_site_packages))

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
