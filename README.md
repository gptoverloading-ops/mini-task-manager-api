# Mini Task Manager API – Node.js + MySQL RDS + ECS Fargate

A simple **Task Manager REST API** built with **Node.js + Express** and backed by **MySQL on Amazon RDS**, containerized with Docker and deployed to **AWS ECS Fargate** behind an **Application Load Balancer (ALB)**.

This repo also includes a **GitHub Actions CI/CD pipeline** that automatically builds a Docker image, pushes it to **Amazon ECR**, and deploys the latest version to your ECS service on every push to `main`.

---

## Architecture Overview

**Core components:**

- **API** – Node.js + Express (`index.js`)
- **Database** – MySQL on **Amazon RDS**
- **Container Registry** – Amazon ECR repository:
  - `115350130397.dkr.ecr.ap-south-1.amazonaws.com/mini-task-manager-api:<tag>`
- **Compute** – AWS ECS Fargate task & service
- **Load Balancer** – Application Load Balancer (ALB) exposing the API publicly
- **CI/CD** – GitHub Actions workflow in `.github/workflows/deploy.yml`

**High-level flow:**

1. Developer pushes code to `main` on GitHub.
2. GitHub Actions:
   - Logs in to AWS using IAM access keys stored as repository secrets.
   - Builds a Docker image for the API.
   - Pushes the image to the ECR repository.
   - Updates the ECS service to use the new task definition (new image tag).
3. ECS Fargate pulls the new image and starts tasks behind the ALB.
4. ALB URL serves the API:
   - `/` – health/info message  
   - `/tasks` – list of sample tasks stored in MySQL RDS.

---

## Tech Stack

- **Runtime:** Node.js (Express)
- **Database:** MySQL (Amazon RDS)
- **Container:** Docker
- **Cloud:** AWS
  - ECS Fargate
  - ECR
  - RDS (MySQL)
  - Application Load Balancer (ALB)
  - IAM
- **CI/CD:** GitHub Actions

---

## Local Development

### 1. Clone the repo

```bash
git clone https://github.com/gptoverloading-ops/mini-task-manager-api.git
cd mini-task-manager-api
2. Install dependencies
bash
Copy code
npm install
3. Configure environment variables
Create a .env file (or export variables in your shell):

bash
Copy code
DB_HOST=<your-mysql-hostname>
DB_USER=<your-db-username>
DB_PASSWORD=<your-db-password>
DB_NAME=<your-db-name>
DB_PORT=3306

PORT=3000
For local dev you can point DB_HOST to either:

Your local MySQL instance, or

The RDS endpoint (if it is publicly reachable and security groups allow it).

4. Run locally
bash
Copy code
node index.js
# or
npm start
API will be available at: http://localhost:3000

API Endpoints
GET /
Returns a simple message verifying that the API is running.

Example response:

text
Copy code
Mini Task Manager API is running (MySQL RDS backend)
GET /tasks
Returns a JSON array of tasks fetched from the MySQL database (or seed data if you coded that).

Example response:

json
Copy code
[
  { "id": 1, "title": "Connect AWS free tier account", "status": "TODO" },
  { "id": 2, "title": "Learn S3, CloudFront, ACM basics", "status": "IN-PROGRESS" },
  { "id": 3, "title": "Deploy backend API on ECS + RDS", "status": "COMING SOON" },
  { "id": 4, "title": "Add CI/CD with GitHub Actions", "status": "COMING SOON" }
]
You can later extend this with POST /tasks, PUT /tasks/:id, DELETE /tasks/:id.

Docker
Build image locally
bash
Copy code
docker build -t mini-task-manager-api:v1 .
Run container locally
bash
Copy code
docker run -p 3000:3000 \
  -e DB_HOST=<your-mysql-hostname> \
  -e DB_USER=<your-db-username> \
  -e DB_PASSWORD=<your-db-password> \
  -e DB_NAME=<your-db-name> \
  -e DB_PORT=3306 \
  mini-task-manager-api:v1
Visit: http://localhost:3000 and http://localhost:3000/tasks

AWS Deployment (ECS Fargate + RDS)
1. RDS MySQL
Create an RDS MySQL instance (free tier if possible).

Note:

Endpoint

Port

Username

Password

DB name

Ensure the security group allows inbound traffic from your ECS tasks.

2. ECR Repository
Create an ECR repo: mini-task-manager-api

Example URI:
115350130397.dkr.ecr.ap-south-1.amazonaws.com/mini-task-manager-api

3. ECS Fargate
Create an ECS cluster (Fargate).

Create a task definition:

Launch type: Fargate

CPU / Memory: e.g. 0.5 vCPU / 1 GB

Container:

Image: 115350130397.dkr.ecr.ap-south-1.amazonaws.com/mini-task-manager-api:<tag>

Port mapping: container port 3000, protocol TCP

Environment variables: DB connection details

Create an ECS service:

Launch type: Fargate

Attach to an Application Load Balancer

Target group health check on /

Once running, your ALB DNS name will serve:

http(s)://<alb-dns-name>/

http(s)://<alb-dns-name>/tasks

CI/CD with GitHub Actions
The workflow file lives at:

text
Copy code
.github/workflows/deploy.yml
1. Repo Secrets
In GitHub → Settings → Secrets and variables → Actions, create:

AWS_ACCESS_KEY_ID

AWS_SECRET_ACCESS_KEY

These must belong to an IAM user with permissions for:

ECR (push/pull)

ECS (Describe / Update service, RegisterTaskDefinition)

CloudWatch Logs (optional)

2. Workflow Overview
On push to main, the workflow will:

Checkout the repository.

Configure AWS credentials using the secrets.

Log in to ECR.

Build Docker image and tag it with the commit SHA (and/or latest).

Push image to ECR.

Register new task definition with the new image.

Update ECS service to use the new task definition.

Wait for deployment to complete.

Once the workflow completes successfully, the new version of your API is live via the ALB URL.

Future Improvements
Ideas to extend this project:

Add CRUD endpoints:

POST /tasks – create a task

PUT /tasks/:id – update status/title

DELETE /tasks/:id – remove a task

Add validation and proper error handling.

Add unit tests and run them in GitHub Actions before building the Docker image.

Add a simple React frontend that calls this API.

Add auto-scaling policies to the ECS service based on CPU/Memory.

License
This project is for learning/demo purposes. Use and modify freely.

yaml
Copy code

---

If you want next, I can:

- Add **full CRUD routes** to your existing `index.js` (using MySQL), or  
- Help you write a **project explanation** for your resume / experience letter based on this mini-task-manager setup.
::contentReference[oaicite:0]{index=0}




