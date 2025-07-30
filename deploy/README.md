# Deploying **unipoint.dev** to AWS EC2

This guide walks you through deploying the full-stack **unipoint.dev** application—Node/Express backend, React/Vite frontend, PostgreSQL (managed on AWS RDS)—onto a single EC2 instance using Docker & Docker Compose.

---

## 1. Prerequisites & Requirements
| Item | Details |
| --- | --- |
| AWS account | Access to launch EC2 instances, create Security Groups & RDS instances |
| Domain (optional) | For HTTPS you’ll need a public DNS record |
| Local tools | `ssh`, a terminal, and the PEM/PPK key-pair for the instance |
| Knowledge | Basic Linux & Docker commands |

Software installed automatically by `setup-server.sh`:
* Docker ≥ 24.x  
* Docker Compose v2  
* Node.js 18.x (only for local tooling)  
* Git, curl, ufw (Ubuntu) or firewalld (Amazon Linux)

---

## 2. EC2 Instance Setup

1. **Launch Instance**  
   • AMI: *Ubuntu 22.04 LTS* (or *Amazon Linux 2023*)  
   • Instance type: `t3.medium` (2 vCPU, 4 GiB).  
   • Storage: 20 GB gp3 (increase for logs/artifacts).  
   • Key pair: select or create.  
   • Networking: place in a public subnet that has Internet Gateway.

2. **Attach Security Group** – see Section 4.

3. **Connect via SSH**  
   ```bash
   ssh -i path/to/key.pem ubuntu@<EC2_PUBLIC_IP>
   ```

---

## 3. Step-by-Step Deployment Process

```text
# 1. SSH into the server
ssh -i key.pem ubuntu@<EC2_PUBLIC_IP>

# 2. Download preparation script
curl -sL https://raw.githubusercontent.com/ashokbalam/unipoint.dev/main/deploy/setup-server.sh -o setup-server.sh
chmod +x setup-server.sh
sudo ./setup-server.sh        # installs Docker & tooling, adds user to docker group
exit                           # IMPORTANT: log out then back in to refresh group

# 3. Re-connect
ssh -i key.pem ubuntu@<EC2_PUBLIC_IP>

# 4. Deploy application
sudo mkdir -p /opt/unipoint
cd /opt/unipoint
sudo curl -sL https://raw.githubusercontent.com/ashokbalam/unipoint.dev/main/deploy/deploy.sh -o deploy.sh
sudo chmod +x deploy.sh
sudo ./deploy.sh
```

The deployment script will:
1. Clone / update the repo into `/opt/unipoint/repo`
2. Copy `.env` or prompt you to edit one
3. Build & start containers via `docker-compose`
4. Run health checks and set up a cron-based monitor

On success:
```
Frontend URL : http://<EC2_PUBLIC_IP>
Backend  URL : http://<EC2_PUBLIC_IP>:4000
```

---

## 4. Security Group Configuration

| Port | Protocol | Purpose                    | Source |
|------|----------|----------------------------|--------|
| 22   | TCP      | SSH                        | Your IP / Admin CIDR |
| 80   | TCP      | HTTP (Frontend)            | 0.0.0.0/0 |
| 443  | TCP      | HTTPS (if enabled)         | 0.0.0.0/0 |
| 4000 | TCP      | Backend API (direct)       | 0.0.0.0/0 or restricted CIDR |

For intra-VPC communication (e.g., RDS) ensure outbound traffic on 5432 /TCP is allowed.

---

## 5. Database Configuration

The backend expects these env vars (set in `/opt/unipoint/.env`):

```env
DB_HOST=your-rds-endpoint.us-east-2.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=unipoint_user
DB_PASSWORD=*********
DB_DATABASE=unipoint_db
```

Steps to prepare RDS:

1. Launch **Amazon RDS → PostgreSQL** instance (`db.t3.micro` fits Free Tier).
2. Create database `unipoint_db`.
3. Add inbound rule on the RDS SG allowing the EC2 SG on port 5432.
4. Fill credentials in `.env` then re-run `sudo ./deploy.sh`.

---

## 6. SSL / HTTPS Setup (Optional)

1. **Attach a domain** – create an A-record pointing to EC2 public IP.  
2. **Install Certbot** on EC2:

   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d example.com -d www.example.com
   ```
3. **Update Nginx** – the `deploy/nginx.prod.conf` already contains an HTTPS block; Certbot will insert certificates & reload Nginx automatically.  
4. **Force redirect** – uncomment the `return 301 https://$host$request_uri;` line in the HTTP server block.

---

## 7. Monitoring & Maintenance

* **Built-in monitor**: `monitor.sh` runs every 5 min via cron, restarts unhealthy containers and logs to `/opt/unipoint/logs/monitor.log`.
* **Log rotation**: `/etc/logrotate.d/unipoint` keeps 7 compressed daily logs.
* **CloudWatch** (optional): install the CloudWatch Agent and tail container logs for centralised observability.
* **Uptime alert**: integrate Pingdom, StatusCake, or AWS Health Checks to ping `/health` endpoint.

---

## 8. Troubleshooting Common Issues

| Symptom | Diagnosis | Fix |
|---------|-----------|-----|
| `Error: ECONNREFUSED` connecting to DB | SG or credentials wrong | Verify RDS SG, port 5432, and `.env` values |
| `frontend` container keeps restarting | Build failed or Nginx port clash | `docker-compose logs frontend`, ensure port 80 free |
| Backend health check fails | DB migration pending | Check `backend` logs, ensure RDS reachable |
| Disk full | Logs or Docker images | `docker system prune -af && sudo journalctl --vacuum-time=2d` |

Use `sudo ./deploy.sh logs` to tail the latest container logs.

---

## 9. Backup & Recovery

1. **Code & config** – nightly cron creates a tarball of `/opt/unipoint/repo` and uploads to S3 (add your own script).  
2. **Database** – enable automated snapshots on the RDS instance and set a retention period (e.g., 7 days).  
3. **Rollback** – `sudo ./deploy.sh rollback` lists recent backups and restores code + containers.

---

## 10. Performance Optimization Tips

* **Docker resources** – allocate limits in `docker-compose.prod.yml` (already set).  
* **Nginx caching** – static assets served with 30-day cache headers.  
* **DB tuning** – enable RDS Performance Insights, adjust `max_connections` and IOPS as usage grows.  
* **Enable Brotli** – compile Nginx with Brotli module or use CloudFront in front of EC2.

---

## 11. Cost Optimization Suggestions

| Component | Cost-saving Action |
|-----------|-------------------|
| EC2       | Use `t3a` burstable (AMD) or purchase Reserved Instances |
| Storage   | Adopt gp3 and right-size IOPS |
| RDS       | Choose `db.t3.micro`, enable auto-stop, use Reserved Instances |
| Data Transfer | Serve static assets via **CloudFront** for cheaper egress |
| Monitoring | Aggregate logs centrally to reduce EBS usage, keep 7 days only |

---

## 12. Scaling the Application

1. **Vertical** – upgrade EC2 type (e.g., `m6i.large`) if CPU/Memory saturate.  
2. **Horizontal** (recommended for production):
   * Place backend & frontend into separate containers on **ECS Fargate** or **EKS**.  
   * Store Docker images in **ECR** and deploy via CI/CD (GitHub Actions, CodePipeline).  
   * Frontend can be fully static; offload to **S3 + CloudFront**.  
   * Use **ALB** for routing: `example.com` → CloudFront (S3) / `/api/*` → ALB → ECS service.  
3. **Database** – enable RDS read replicas if read queries spike; consider **Aurora Serverless v2** for auto-scaling.

---

## 🎉 You’re Live!

Your **unipoint.dev** instance is now running. Build features, invite users, and keep shipping 🚀
