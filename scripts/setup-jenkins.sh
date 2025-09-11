#!/bin/bash

echo "🚀 Setting up Jenkins CI/CD Environment..."

# Create necessary directories
mkdir -p jenkins/jenkins_home
mkdir -p k8s/staging
mkdir -p k8s/production

# Set permissions for Jenkins
chmod 777 jenkins/jenkins_home

# Start Jenkins and supporting services
echo "📦 Starting Jenkins, SonarQube, and Nexus..."
cd jenkins
docker-compose up -d

# Wait for Jenkins to be ready
echo "⏳ Waiting for Jenkins to start..."
sleep 30

# Get Jenkins admin password
JENKINS_PASSWORD=$(docker exec chatbot-jenkins cat /var/jenkins_home/secrets/initialAdminPassword)

echo "🔑 Jenkins Admin Password: $JENKINS_PASSWORD"
echo "🌐 Jenkins URL: http://localhost:8080"
echo "📊 SonarQube URL: http://localhost:9000"
echo "📦 Nexus URL: http://localhost:8081"

# Install Jenkins CLI (optional)
echo "📥 Installing Jenkins CLI..."
curl -L http://localhost:8080/jnlpJars/jenkins-cli.jar -o jenkins-cli.jar

# Create initial Jenkins job
echo "📋 Creating initial Jenkins job..."
cat > jenkins-job.xml << EOF
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@2.44">
  <description>Chatbot Platform CI/CD Pipeline</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
      <triggers>
        <hudson.triggers.SCMTrigger>
          <spec>H/5 * * * *</spec>
        </hudson.triggers.SCMTrigger>
      </triggers>
    </org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
  </properties>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps@2.93">
    <scm class="hudson.plugins.git.GitSCM" plugin="git@4.11.4">
      <configVersion>2</configVersion>
      <userRemoteConfigs>
        <hudson.plugins.git.UserRemoteConfig>
          <url>https://github.com/your-org/chatbot.git</url>
        </hudson.plugins.git.UserRemoteConfig>
      </userRemoteConfigs>
      <branches>
        <hudson.plugins.git.BranchSpec>
          <name>*/main</name>
        </hudson.plugins.git.BranchSpec>
        <hudson.plugins.git.BranchSpec>
          <name>*/develop</name>
        </hudson.plugins.git.BranchSpec>
      </branches>
      <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>
      <submoduleCfg class="list"/>
      <extensions/>
    </scm>
    <scriptPath>Jenkinsfile</scriptPath>
    <lightweight>false</lightweight>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>
EOF

# Create job via Jenkins CLI (requires Jenkins to be fully started)
echo "📝 Creating Jenkins job (this may take a few minutes)..."
sleep 60
java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$JENKINS_PASSWORD create-job "chatbot-platform" < jenkins-job.xml

echo "✅ Jenkins setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Access Jenkins at http://localhost:8080"
echo "2. Login with admin / $JENKINS_PASSWORD"
echo "3. Install recommended plugins"
echo "4. Configure Docker and Kubernetes credentials"
echo "5. Set up webhook in your Git repository"
echo ""
echo "🔧 Useful commands:"
echo "- Stop services: docker-compose down"
echo "- View logs: docker-compose logs -f jenkins"
echo "- Restart Jenkins: docker-compose restart jenkins"
