# AWS EC2 Deployment Guide

## Step 1: Launch EC2 Instance

1. Go to [AWS Console](https://console.aws.amazon.com/ec2)
2. Click **Launch Instance**
3. Configure:
   - **Name:** `smart-doc-organizer`
   - **AMI:** Amazon Linux 2023 (free tier)
   - **Instance Type:** `t2.micro` (free tier)
   - **Key Pair:** Create new or use existing
   - **Security Group:** Allow:
     - SSH (22) - Your IP
     - HTTP (80) - Anywhere (0.0.0.0/0)

4. Click **Launch Instance**

---

## Step 2: Connect to EC2

```bash
# Replace with your key file and public IP
ssh -i "your-key.pem" ec2-user@YOUR_PUBLIC_IP
```

---

## Step 3: Install Docker

```bash
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user
```

---

## Step 4: Pull and Run

```bash
# Pull the image
sudo docker pull msayyamakram/smart-doc-organizer:latest

# Run the container
sudo docker run -d -p 80:80 \
  -e GEMINI_API_KEY=your-gemini-api-key \
  -e JWT_SECRET_KEY=your-secret-key-here \
  --name smart-doc \
  msayyamakram/smart-doc-organizer
```

---

## Step 5: Access Your App

Open in browser:
```
http://YOUR_EC2_PUBLIC_IP
```

---

## Useful Commands

```bash
# View running containers
docker ps

# View logs
docker logs smart-doc

# Restart container
docker restart smart-doc

# Stop container
docker stop smart-doc

# Remove and re-run (for updates)
docker stop smart-doc && docker rm smart-doc
docker pull msayyamakram/smart-doc-organizer:latest
docker run -d -p 80:80 -e GEMINI_API_KEY=your-key --name smart-doc msayyamakram/smart-doc-organizer
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key for AI features |
| `JWT_SECRET_KEY` | Yes | Secret for JWT tokens (any random string) |

---

## Troubleshooting

### Can't access the site?
1. Check security group allows port 80
2. Check container is running: `docker ps`
3. Check logs: `docker logs smart-doc`

### Container won't start?
1. Check if port 80 is in use: `sudo lsof -i :80`
2. Check Docker status: `sudo service docker status`
