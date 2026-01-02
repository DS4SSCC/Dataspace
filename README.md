# 📘 Dataspace

**Dataspace** is a web application developed as part of the **Data Space for Smart & Sustainable Cities and Communities (DS4SSCC)** initiative. The project aims to support the creation of an interoperable, secure, and scalable data space that enables trusted data sharing between cities, public authorities, and service providers.

This repository contains the application code for the Dataspace platform, including frontend components and supporting infrastructure.

---

## 🚀 Features

* Modern web application built with **Svelte** and **TypeScript**
* Structured application layout with clear separation of concerns
* Support for policy- and rule-based configurations
* Development, build, and testing workflows
* Docker support for local development and deployment

---

## 🧱 Project Structure

```
.
├── prisma/                # Database schema and migrations
├── res/policies/          # Policy and security configuration files
├── src/                   # Application source code (Svelte / TypeScript)
├── static/                # Static assets
├── tests/                 # Unit and integration tests
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── svelte.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🛠️ Requirements

* Node.js (v18 or higher)
* npm or pnpm
* (Optional) Docker & Docker Compose
* (Optional) Database backend (depending on configuration)

---

## 🧑‍💻 Development Setup

1. Clone the repository:

```bash
git clone https://github.com/DS4SSCC/Dataspace.git
cd Dataspace
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
```

3. Start the development server:

```bash
npm run dev -- --open
```

The application will start locally with hot module reloading enabled.

---

## 📦 Production Build

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 🐳 Docker Support

This repository includes a `Dockerfile` and `docker-compose.yml` for containerized execution.

To build and run the application using Docker:

```bash
docker compose up --build
```

This is suitable for local testing, demonstrations, or deployment environments.

---

## 🗄️ Database & Prisma

If Prisma is used as the database layer, the following commands may be required:

```bash
npx prisma migrate dev
npx prisma generate
```

Refer to the Prisma schema for database configuration details.

---

## 🔐 Policies & Configuration

Policy and configuration files are located in:

```
res/policies/
```

Ensure these are correctly configured before running the application in production or shared environments.

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch (`feature/your-feature`)
3. Commit your changes
4. Open a Pull Request targeting the `main` branch

Please ensure code quality and consistency before submitting changes.

---

## 🧠 About DS4SSCC

The **Data Space for Smart & Sustainable Cities and Communities (DS4SSCC)** project focuses on enabling trusted data sharing across European cities to support sustainability, innovation, and digital transformation in domains such as mobility, energy, and urban planning.

---

## 📜 License

This project is licensed under the **MIT License**.

See the `LICENSE` file for details.