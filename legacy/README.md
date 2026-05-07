# Legacy Django Codebase

Frozen reference UI for the original TEK Club website (Django + SQLite).

This directory is **read-only**. The active stack is the Next.js 14 + Prisma + PostgreSQL portal at the repository root.

For the pre-rewrite snapshot of the full repo, check out the git tag:

```
git checkout v0-django-snapshot
```

## Contents

- `app1_landing` … `app7_account` — original Django apps
- `tek/` — Django project settings
- `templates/`, `static/`, `media/`, `uploads/` — server-rendered assets
- `manage.py`, `db.sqlite3`, `requirements.txt`, `.venv/` — runtime artefacts
