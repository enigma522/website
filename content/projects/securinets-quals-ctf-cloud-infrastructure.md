---
title: "Securinets Quals CTF: Cloud Infrastructure"
keywords: ["GCP", "Terraform","HAProxy", "Bash", "Docker", "Cloud SQL", "CTFd"]
---

As part of a team, I co-designed and deployed the full cloud infrastructure for the "Securinets Quals" international CTF. This project was a significant technical challenge focused on building a high-availability, scalable, and fault-tolerant system to handle heavy, unpredictable traffic from over 1,200 teams.

---

## Infrastructure Overview

The architecture was split into two main components: the core CTF platform and the challenge hosting environment, both designed for resilience.

### 1. Core Platform (CTFd)

This was the main web application where players registered and submitted flags.

* **Application:** We used **CTFd** as the platform, deployed on 3 Virtual Machines.
* **Load Balancing:** An **HAProxy** load balancer was placed in front of the CTFd replicas to distribute traffic and ensure 100% uptime.
* **Database:** We utilized **Google Cloud SQL** (a managed MySQL service) for the primary database, handling all team and submission data.
* **Caching:** A GCP-managed **Redis** instance was used for caching to ensure sub-second response times, even under peak load.
* **File Storage:** All challenge attachments and static files were hosted on **Google Cloud Storage (GCS)** to reduce load on the application servers.

### 2. Challenge Hosting

To ensure stability, each challenge was hosted in its own isolated environment.

* **Redundancy:** Each challenge was containerized using **Docker** and deployed with **2 replicas** on separate VMs.
* **Traffic Management:** A dedicated **HAProxy** instance was used to load balance player traffic between the replicas for each challenge. This prevented a single challenge from impacting the rest of the competition.
* **Automation:** **Bash scripts** were used for the automated deployment and configuration of the challenge containers and services.

<br>

![ctfd](../../../images/ctf-infra/p4.jpg)

![infra](../../../images/ctf-infra/1.jpg)

![stats](../../../images/ctf-infra/2.jpg)

![HAProxy](../../../images/ctf-infra/3.jpg)