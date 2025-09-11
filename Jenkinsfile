pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-registry.com/chatbot'
        IMAGE_TAG = "${BUILD_NUMBER}"
        MAVEN_OPTS = '-Xmx1024m'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                }
            }
        }
        
        stage('Build & Test') {
            parallel {
                stage('API Gateway Tests') {
                    steps {
                        dir('api-gateway') {
                            sh 'mvn clean test'
                        }
                    }
                    post {
                        always {
                            publishTestResults testResultsPattern: 'api-gateway/target/surefire-reports/*.xml'
                        }
                    }
                }
                
                stage('Session Service Tests') {
                    steps {
                        dir('session-service') {
                            sh 'mvn clean test'
                        }
                    }
                    post {
                        always {
                            publishTestResults testResultsPattern: 'session-service/target/surefire-reports/*.xml'
                        }
                    }
                }
                
                stage('NLU Service Tests') {
                    steps {
                        dir('nlu-service') {
                            sh '''
                                python -m venv venv
                                source venv/bin/activate
                                pip install -r requirements.txt
                                pip install pytest pytest-asyncio
                                python -m pytest tests/ -v --junitxml=test-results.xml
                            '''
                        }
                    }
                    post {
                        always {
                            publishTestResults testResultsPattern: 'nlu-service/test-results.xml'
                        }
                    }
                }
                
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh '''
                                npm ci
                                npm test -- --coverage --watchAll=false
                            '''
                        }
                    }
                    post {
                        always {
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'frontend/coverage/lcov-report',
                                reportFiles: 'index.html',
                                reportName: 'Frontend Coverage Report'
                            ])
                        }
                    }
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                script {
                    // SonarQube Analysis
                    withSonarQubeEnv('SonarQube') {
                        sh '''
                            mvn sonar:sonar \
                                -Dsonar.projectKey=chatbot-platform \
                                -Dsonar.host.url=${SONAR_HOST_URL} \
                                -Dsonar.login=${SONAR_TOKEN}
                        '''
                    }
                    
                    // OWASP Dependency Check
                    dependencyCheck additionalArguments: '--scan api-gateway --scan session-service --format ALL'
                    dependencyCheckPublisher pattern: 'dependency-check-report.xml'
                    
                    // Docker Security Scan
                    sh 'docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --exit-code 0 --no-progress --format table'
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build API Gateway') {
                    steps {
                        dir('api-gateway') {
                            sh 'mvn clean package -DskipTests'
                            script {
                                def image = docker.build("${DOCKER_REGISTRY}/api-gateway:${IMAGE_TAG}")
                                docker.withRegistry('https://your-registry.com', 'docker-registry-credentials') {
                                    image.push()
                                    image.push('latest')
                                }
                            }
                        }
                    }
                }
                
                stage('Build Session Service') {
                    steps {
                        dir('session-service') {
                            sh 'mvn clean package -DskipTests'
                            script {
                                def image = docker.build("${DOCKER_REGISTRY}/session-service:${IMAGE_TAG}")
                                docker.withRegistry('https://your-registry.com', 'docker-registry-credentials') {
                                    image.push()
                                    image.push('latest')
                                }
                            }
                        }
                    }
                }
                
                stage('Build NLU Service') {
                    steps {
                        script {
                            def image = docker.build("${DOCKER_REGISTRY}/nlu-service:${IMAGE_TAG}", 'nlu-service')
                            docker.withRegistry('https://your-registry.com', 'docker-registry-credentials') {
                                image.push()
                                image.push('latest')
                            }
                        }
                    }
                }
                
                stage('Build Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci && npm run build'
                            script {
                                def image = docker.build("${DOCKER_REGISTRY}/frontend:${IMAGE_TAG}")
                                docker.withRegistry('https://your-registry.com', 'docker-registry-credentials') {
                                    image.push()
                                    image.push('latest')
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    // Update Kubernetes manifests with new image tags
                    sh '''
                        sed -i "s|IMAGE_TAG|${IMAGE_TAG}|g" k8s/staging/*.yaml
                        kubectl apply -f k8s/staging/ --context=staging-cluster
                    '''
                }
            }
            post {
                success {
                    // Run integration tests against staging
                    sh 'npm run test:integration -- --env=staging'
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    // Manual approval for production deployment
                    input message: 'Deploy to Production?', ok: 'Deploy'
                    
                    // Update production manifests
                    sh '''
                        sed -i "s|IMAGE_TAG|${IMAGE_TAG}|g" k8s/production/*.yaml
                        kubectl apply -f k8s/production/ --context=production-cluster
                    '''
                }
            }
        }
        
        stage('Run End-to-End Tests') {
            steps {
                sh '''
                    # Wait for services to be ready
                    kubectl wait --for=condition=ready pod -l app=chatbot-frontend --timeout=300s --context=staging-cluster
                    
                    # Run E2E tests
                    npm run test:e2e -- --env=staging
                '''
            }
            post {
                always {
                    // Collect test results
                    publishTestResults testResultsPattern: 'e2e-results.xml'
                }
            }
        }
    }
    
    post {
        always {
            // Clean up workspace
            cleanWs()
            
            // Archive artifacts
            archiveArtifacts artifacts: '**/target/*.jar', fingerprint: true
            archiveArtifacts artifacts: '**/build/**', fingerprint: true
        }
        
        success {
            // Send success notification
            slackSend(
                channel: '#deployments',
                color: 'good',
                message: "✅ Deployment successful! Build #${BUILD_NUMBER} deployed to ${env.BRANCH_NAME}"
            )
            
            // Update deployment status
            script {
                if (env.BRANCH_NAME == 'main') {
                    sh '''
                        curl -X POST "https://api.github.com/repos/your-org/chatbot/deployments" \
                            -H "Authorization: token ${GITHUB_TOKEN}" \
                            -H "Content-Type: application/json" \
                            -d '{"ref":"'${GIT_COMMIT}'","environment":"production","description":"Jenkins deployment"}'
                    '''
                }
            }
        }
        
        failure {
            // Send failure notification
            slackSend(
                channel: '#deployments',
                color: 'danger',
                message: "❌ Deployment failed! Build #${BUILD_NUMBER} on ${env.BRANCH_NAME}"
            )
        }
        
        unstable {
            // Send unstable notification
            slackSend(
                channel: '#deployments',
                color: 'warning',
                message: "⚠️ Build unstable! Build #${BUILD_NUMBER} on ${env.BRANCH_NAME}"
            )
        }
    }
}
