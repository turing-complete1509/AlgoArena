# AlgoArena ⚔️

**Your High-Performance Platform for Algorithmic Problem Solving**

> **AlgoArena** is a cutting-edge online judge ecosystem architected with a **microservices-based MERN stack** and a highly scalable **Dockerized execution engine**.
> Designed for speed, security, and scalability, AlgoArena provides a robust environment for coding, testing, and algorithmic mastery.

## 🔍 Why AlgoArena?
Unlike traditional web-based compilers, AlgoArena isn't just a basic code editor — it's a **distributed online judge**. Built with industry-standard architecture, it leverages isolated Docker containers and asynchronous message brokers (Redis) to guarantee secure, millisecond-level code execution, even under heavy load.

---

## 🌐 Deployed Links

* **Live Platform:** [http://algo-arena.duckdns.org](http://algo-arena.duckdns.org)

## 📚 Table of Contents

* [📌 Overview](#-overview)
* [✨ Key Features](#-key-features)
  * [💻 Online Compiler & Judge (with Docker)](#-online-compiler--judge-with-docker)
  * [⚡ Asynchronous Task Queue](#-asynchronous-task-queue)
  * [🎨 Beautiful Workspace UI](#-beautiful-workspace-ui)
* [🔬 Architecture Overview](#-architecture-overview)
* [⚙️ Tech Stack](#-tech-stack)
* [🚀 Installation Guide](#-installation-guide)
* [📜 License](#-license)

---

## 📌 Overview

**AlgoArena** is a modern, distributed web application that provides a complete ecosystem for algorithmic problem solving.

The platform uses a **Microservice Architecture** that safely decouples the web API from the heavy computational lifting of code compilation and execution. By utilizing an event-driven queue, AlgoArena guarantees fair, robust, and highly concurrent code evaluation.

---

## ✨ Key Features

### 💻 Online Compiler & Judge (with Docker)

* Secure multi-language code compiler for **C++, Java, Python, and JavaScript (Node.js)**.
* Submissions run inside **ephemeral, isolated Docker containers** (Docker-out-of-Docker) for maximum safety and sandbox isolation.
* Injects code directly into containers via Base64 to prevent host-path mismatches and host injection attacks.
* Aggressive compiler caching ensures even heavy Java/C++ executions spin up and return results in milliseconds.

---

### ⚡ Asynchronous Task Queue

* Employs **Redis and BullMQ** to manage incoming code submissions.
* Gracefully handles hundreds of concurrent submissions without freezing the main backend thread.
* Worker nodes actively listen to the queue and evaluate standard input/output against test cases in real-time.

---

### 🎨 Beautiful Workspace UI

* Interactive, split-pane workspace for an immersive coding environment.
* Integrated **Monaco Editor** for syntax highlighting and intelligent code editing.
* Live real-time verdict streaming (Accepted, Wrong Answer, Runtime Error, Time Limit Exceeded).
* Custom test-case execution capabilities directly from the browser.

---

## 🔬 Architecture Overview

```plaintext
User ↔ Frontend (React + Tailwind) ↔ Backend API (Express + Node)
                                            ↙       ↘
                                     MongoDB        Redis Queue (BullMQ)
                                                          ↓
                                    Dockerized Execution Worker Node
```

---

## ⚙️ Tech Stack

| Layer       | Tech                                          |
| ----------- | ------------------------------                |
| Frontend    | React.js, Vite, TailwindCSS                   |
| Backend     | Node.js, Express.js                           |
| Database    | MongoDB (Mongoose)                            |
| Compiler    | Docker (Alpine compiler images), Monaco Editor|
| Queue/Cache | Redis, BullMQ                                 |
| Deployment  | AWS EC2, Docker Compose                       |

---

## 🚀 Installation Guide

### 1. Clone the Repository

```bash
git clone https://github.com/turing-complete1509/AlgoArena.git
cd AlgoArena
```

### 2. Set Up Environment Variables

Create a `.env` file in the `/backend` directory:

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

### 3. (Recommended) Run with Docker Compose

Make sure Docker is installed and running on your host machine.

```bash
sudo docker compose up -d --build
```

> This will spin up the entire application: the Redis broker, the main Backend API, and the **secure Execution Worker container**.

---

## 📜 License

This project is licensed under the **MIT License**.
Feel free to fork, enhance, and contribute to the project!

---

<p align="center">
  <a href="#top" style="font-size: 18px; padding: 8px 16px; display: inline-block; border: 1px solid #ccc; border-radius: 6px; text-decoration: none;">
    ⬆️ Back to Top
  </a>
</p>
