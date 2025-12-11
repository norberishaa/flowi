# Flowi

Flowi is a web app for managing tasks with a simple, room-based model. Users create **rooms**, receive a **private key**, and organize their work into **categories** with category-specific **tasks**.

This is a side project intended to help and inspire Django developers and tech enthusiasts.

A live version of the website can be found here: [flowi](https://www.flowitodo.live/). *Note that this is being hosted on Render with a free subscripiton, which means the web-app may take 1-2 minutes to start-up! Please be patient.*

---

## Features

- **Room-based access**
  - Create a room by choosing a name.
  - A private key is generated; you must save it to access the room later.

- **Categories and tasks**
  - Create categories within a room.
  - Add tasks scoped to each category.

- **Security**
  - Room `private_keys` are stored in PostgreSQL using salting + hashing.
  - Cloudflare Turnstile verification defends against brute-force attempts.
  - Planned: end-to-end encryption (E2E) for task storage.

---

## Tech Stack

- Backend: Django
- Frontend: HTML, CSS, JavaScript
- Database: PostgreSQL
- Security: salted + hashed room keys, Cloudflare Turnstile

---

## Requirements

See `requirements.txt` for exact versions. You will need:

- Python 3.x
- PostgreSQL
- Cloudflare Turnstile credentials (site + secret keys) for your domain

---

## Setup and Installation

### 1) Clone the repository

```bash
git clone https://github.com/norberishaa/flowi.git
cd flowi
```

### 2) Create a virtual environment and install dependencies

```bash
python -m venv .venv
# Linux/Mac
source .venv/bin/activate
# Windows (PowerShell)
.venv\Scripts\Activate.ps1

pip install --upgrade pip
pip install -r requirements.txt
```

### 3) Configure environment variables

Create a `.env` file (or set environment variables via your process manager) with at least:

```env
SECRET_KEY=
DEBUG=True
CLOUDFLARE_SECRET_KEY

DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=
```

Notes:
- Register your domain in Cloudflare Turnstile to obtain keys.

### 4) Apply migrations and run the server

```bash
python manage.py migrate
python manage.py runserver
```

---

## Usage

1. Create a **room** by choosing a name.
2. Copy and securely store the **private key** generated for the room.
3. Enter your room using **room name + private key**.
4. Create **categories** and add **tasks** within those categories.

Important:
- Private keys are not recoverable by design. If you lose the key, you lose access to that room.

---

## Security Details

- **Private keys** are salted and hashed before being stored in PostgreSQL.
- **Cloudflare Turnstile** is used to limit automated/bulk attempts.
- **Planned**: E2E encryption for task data, so that only the room holder can decrypt contents.

## Contributing

Contributions, issues, and feature requests are welcome.  
Please open an issue or submit a pull request.
