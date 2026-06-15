pipeline {
    agent any

    environment {
        AWS_DEFAULT_REGION = 'ap-south-1'
        AWS_CREDENTIALS_ID = 'aws-credentials' // Jenkins Credentials ID
        DOCKER_REGISTRY    = '123456789012.dkr.ecr.ap-south-1.amazonaws.com'
        FRONTEND_IMAGE     = 'arvis-frontend'
        BACKEND_IMAGE      = 'arvis-backend'
        IMAGE_TAG          = "${env.BUILD_NUMBER}"
        DATABASE_URL       = credentials('arvis-db-url')
        JWT_SECRET         = credentials('arvis-jwt-secret')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing workspaces dependencies...'
                sh 'npm ci'
            }
        }

        stage('Lint & Static Code Analysis') {
            parallel {
                stage('Lint Backend') {
                    steps {
                        echo 'Running Backend Linting...'
                        sh 'npm run lint --workspace=backend'
                    }
                }
                stage('Lint Frontend') {
                    steps {
                        echo 'Running Frontend Linting...'
                        sh 'npm run lint --workspace=frontend'
                    }
                }
            }
        }

        stage('Run Unit Tests') {
            parallel {
                stage('Test Backend') {
                    steps {
                        echo 'Running Backend Jest Tests...'
                        sh 'npm run test --workspace=backend'
                    }
                }
                stage('Test Frontend') {
                    steps {
                        echo 'Running Frontend Jest Tests...'
                        sh 'npm run test --workspace=frontend'
                    }
                }
            }
        }

        stage('Prisma Generate & Compile') {
            steps {
                echo 'Generating Prisma Client & Compiling TypeScript Backend...'
                sh 'npm run db:generate'
                sh 'npm run build:backend'
            }
        }

        stage('Build Next.js Frontend') {
            steps {
                echo 'Compiling optimized production frontend build...'
                sh 'npm run build:frontend'
            }
        }

        stage('Terraform Plan & Apply') {
            steps {
                dir('terraform') {
                    echo 'Initializing Terraform...'
                    sh 'terraform init'
                    echo 'Planning Infrastructure changes...'
                    sh 'terraform plan -out=tfplan'
                    // In real pipelines, you would use input step for manual approval:
                    // input message: 'Apply infrastructure changes?'
                    echo 'Applying Infrastructure changes...'
                    sh 'terraform apply -auto-approve tfplan'
                }
            }
        }

        stage('Build & Push Docker Images') {
            steps {
                withAWS(credentials: "${AWS_CREDENTIALS_ID}", region: "${AWS_DEFAULT_REGION}") {
                    echo 'Logging into Amazon ECR...'
                    sh "aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | docker login --username AWS --password-stdin ${DOCKER_REGISTRY}"
                    
                    echo 'Building frontend Docker image...'
                    sh "docker build -t ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:latest ./frontend"
                    
                    echo 'Building backend Docker image...'
                    sh "docker build -t ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:${IMAGE_TAG} -t ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:latest ./backend"
                    
                    echo 'Pushing Docker images to ECR...'
                    sh "docker push ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG}"
                    sh "docker push ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:latest"
                    sh "docker push ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:${IMAGE_TAG}"
                    sh "docker push ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:latest"
                }
            }
        }

        stage('Deploy Backend to AWS Lambda') {
            steps {
                dir('backend') {
                    echo 'Installing serverless plugins...'
                    sh 'npx serverless plugin install --name serverless-offline'
                    sh 'npx serverless plugin install --name serverless-prune-plugin'
                    
                    echo 'Deploying to AWS Lambda via Serverless Framework...'
                    withAWS(credentials: "${AWS_CREDENTIALS_ID}", region: "${AWS_DEFAULT_REGION}") {
                        sh "npx serverless deploy --stage prod"
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo 'Updating Kubernetes deployment manifests...'
                // Substitute the build number into deployment files
                sh "sed -i 's|image: .*/arvis-frontend:.*|image: ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG}|g' kubernetes/frontend-deployment.yaml"
                sh "sed -i 's|image: .*/arvis-backend:.*|image: ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:${IMAGE_TAG}|g' kubernetes/backend-deployment.yaml"
                
                echo 'Rolling out changes to AWS EKS Kubernetes Cluster...'
                sh "kubectl apply -f kubernetes/namespace.yaml"
                sh "kubectl apply -f kubernetes/secrets.yaml"
                sh "kubectl apply -f kubernetes/configmap.yaml"
                sh "kubectl apply -f kubernetes/backend-service.yaml"
                sh "kubectl apply -f kubernetes/backend-deployment.yaml"
                sh "kubectl apply -f kubernetes/frontend-service.yaml"
                sh "kubectl apply -f kubernetes/frontend-deployment.yaml"
                sh "kubectl apply -f kubernetes/ingress.yaml"
            }
        }
    }

    post {
        success {
            echo 'Pipeline successfully completed!'
            // Add Slack notifications, Email notifications, etc.
        }
        failure {
            echo 'Pipeline failed. Check stage logs for details.'
        }
    }
}
