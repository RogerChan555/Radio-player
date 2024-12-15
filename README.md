# README

This is a guide to deploy the Eternity application on your local machine and a VPS using Docker. The application uses a MySQL database, with the SQL files located in the `/init` directory. Follow the steps below to get started.

## Prerequisites

- Docker installed on your machine
- A VPS with Docker installed
- MySQL installed locally for local development

## Environment Variables

Create a `.env` file at the root of your project with the following contents:

```
SESSION_SECRET=XXXXXXXXXXXXXXX
NEXT_PUBLIC_APP_URL=XXXXXXXXXXXXX

DB_HOST=XXXXXXXXXXX
DB_PORT=XXXX
DB_USERNAME=XXXXXXXXXXXXX
DB_PASSWORD=XXXXXXXXXXXXXXXXX
DB_NAME=XXXXXXXXXXXXXXXXXXXXX
```

## MySQL Database Setup

1. **Create a new database:**

   ```sql
   CREATE DATABASE eternity;
   ```

2. **Create a new user:**

   ```sql
    CREATE USER
    'eternity'@'localhost'
    IDENTIFIED BY 'password';
   ```

3. **Grant privileges to the user:**

   ```sql
   GRANT ALL PRIVILEGES ON eternity.* TO 'eternity'@'localhost';
   ```

4. **Flush privileges:**

   ```sql
    FLUSH PRIVILEGES;
   ```

5. **Run the SQL files in the `/init` directory to create the tables:**

   ```bash
   mysql -u eternity -p eternity < init/01.sql
    mysql -u eternity -p eternity < init/02.sql
    mysql -u eternity -p eternity < init/03.sql
    ...
   ```

## Local Deployment

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-repo/eternity.git
   cd eternity

   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run the application:**

   ```bash
   npm run dev
   ```

4. **Open your browser and navigate to `http://localhost:3000`**

## Docker Deployment

1. **Access your VPS:**

   ```bash
   ssh root@your-vps-ip
   ```

2. **Pull the Docker image:**

   Pull the Docker image from the GitHub Container Registry:

   ```bash
   docker pull ghcr.io/eternityready2/eternity:latest
   ```

3. **Create a .env file:\***

   On your VPS, create a .env file at the root of your project and add the environment variables mentioned above.

4. **Run the Docker container:**

   ```bash
   docker run --add-host="database:SERVER_IP" --name eternity-container -p 3000:3000 ghcr.io/eternityready2/eternity:latest
   ```

5. **Open your browser and navigate to `http://your-vps-ip:3000`**
