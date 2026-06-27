# monitoring_lab_gmail-mailpit-telegram-slack
# 🚀 Prometheus Monitoring Stack

> Complete Dockerized monitoring solution with multi-channel alerting for k8s pods

[![Docker](https://img.shields.io/badge/Docker-✓-blue?logo=docker)](https://docker.com)
[![Prometheus](https://img.shields.io/badge/Prometheus-v3.0.0-orange?logo=prometheus)](https://prometheus.io)
[![Grafana](https://img.shields.io/badge/Grafana-v11.0.0-red?logo=grafana)](https://grafana.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Services](#-services)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [Alert Rules](#-alert-rules)
- [Testing Alerts](#-testing-alerts)
- [Troubleshooting](#-troubleshooting)
- [Project Structure](#-project-structure)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Docker Network: monitoring                        │
│                                                                      │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐          │
│   │  Prometheus  │   │ Alertmanager │   │    Grafana   │          │
│   │    :9090     │◄──┤    :9093     │   │    :3000     │          │
│   └──────┬───────┘   └──────┬───────┘   └──────────────┘          │
│          │                  │                                        │
│          ▼                  ▼                                        │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐          │
│   │ Node Exporter│   │  Pushgateway │   │   Mailpit    │          │
│   │    :9100     │   │    :9091     │   │    :8025     │          │
│   └──────────────┘   └──────────────┘   └──────────────┘          │
│                                                                      │
│   ┌──────────────┐   ┌──────────────┐                              │
│   │  Spring App  │   │  Python App  │                              │
│   │    :8081     │   │    :5000     │                              │
│   └──────────────┘   └──────────────┘                              │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Alert Channels  │
                    │  • 📧 Gmail      │
                    │  • 💬 Slack      │
                    │  • ✈️ Telegram   │
                    │  • 📬 Mailpit    │
                    └──────────────────┘
```

---

## 🛠️ Services

| Service | Port | Description | Image |
|---------|------|-------------|-------|
| **Prometheus** | `9090` | Metrics collection & alerting | `prom/prometheus:v3.0.0` |
| **Alertmanager** | `9093` | Alert routing & notifications | `prom/alertmanager:v0.27.0` |
| **Grafana** | `3000` | Visualization dashboards | `grafana/grafana:11.0.0` |
| **Pushgateway** | `9091` | Push-based metrics gateway | `prom/pushgateway:v1.10.0` |
| **Mailpit** | `8025` | Email capture & testing | `axllent/mailpit:v1.21` |
| **Node Exporter** | `9100` | Host system metrics | `prom/node-exporter:v1.9.1` |
| **Spring Boot App** | `8081` | Java app with Micrometer | Custom |
| **Python Flask App** | `5000` | Python app with prometheus_client | Custom |

---

## 🚀 Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- Linux server (RHEL / CentOS / Rocky / AlmaLinux / Fedora)
- Firewall access to ports: `3000`, `5000`, `8081`, `9090-9093`, `9100`, `8025`


| Service | URL | Default Login |
|---------|-----|---------------|
| Prometheus | `http://your-server:9090` | — |
| Alertmanager | `http://your-server:9093` | — |
| Grafana | `http://your-server:3000` | `admin` / `changeme` |
| Mailpit | `http://your-server:8025` | — |
| Spring App | `http://your-server:8081` | — |
| Python App | `http://your-server:5000` | — |

---

## ⚙️ Configuration

### 🔑 Required Secrets

#### 1. Gmail SMTP (App Password)

> ⚠️ **Never use your regular Gmail password!**

1. Enable [2-Step Verification](https://myaccount.google.com/signinoptions/two-step-verification) on your Google account
2. Generate an [App Password](https://myaccount.google.com/apppasswords) for "Mail"
3. Use the 16-character password in `alertmanager.yml`

```yaml
smtp_auth_password: 'xxxx xxxx xxxx xxxx'  # Your app password
```

#### 2. Slack Incoming Webhook

1. Go to [Slack API Apps](https://api.slack.com/apps)
2. **Create New App** → **From scratch**
3. Add **Incoming Webhooks** feature
4. Add New Webhook to **#prom_alerts** channel
5. Copy the webhook URL:

```yaml
slack_api_url: 'https://hooks.slack.com/services/T00/B00/XXXX'
```

#### 3. Telegram Bot

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Run `/newbot` and follow instructions
3. Copy the **bot token**
4. Message [@userinfobot](https://t.me/userinfobot) to get your **Chat ID**
5. **⚠️ Important:** Send `/start` to your new bot before it can message you!

```yaml
bot_token: '123456789:ABCdefGHIjklMNOpqrSTUvwxyz'
chat_id: 123456789  # Your numeric Chat ID (no quotes)
```

### 📄 Alertmanager Config Example

```yaml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'your-email@gmail.com'
  smtp_auth_username: 'your-email@gmail.com'
  smtp_auth_password: 'YOUR_APP_PASSWORD'
  smtp_require_tls: true
  slack_api_url: 'YOUR_SLACK_WEBHOOK_URL'
  telegram_api_url: 'https://api.telegram.org'

route:
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'all-channels'

receivers:
  - name: 'all-channels'
    email_configs:
      # 📧 Gmail (real email)
      - to: 'recipient@example.com'
        send_resolved: true
        headers:
          Subject: '[PROMETHEUS] {{ .GroupLabels.alertname }} {{ .Status }}'
        html: |
          <h2>{{ .GroupLabels.alertname }} - {{ .Status }}</h2>
          {{ range .Alerts }}
          <p><b>Summary:</b> {{ .Annotations.summary }}</p>
          <p><b>Description:</b> {{ .Annotations.description }}</p>
          <p><b>Instance:</b> {{ .Labels.instance }}</p>
          <p><b>Severity:</b> {{ .Labels.severity }}</p>
          {{ end }}

      # 📬 Mailpit (local email capture)
      - to: 'alerts@localhost'
        smarthost: 'mailpit:1025'
        require_tls: false
        from: 'prometheus@localhost'

    slack_configs:
      # 💬 Slack
      - channel: '#prom_alerts'
        send_resolved: true
        title: '{{ .GroupLabels.alertname }} - {{ .Status }}'
        text: |
          {{ range .Alerts }}
          *Alert:* {{ .Annotations.summary }}
          *Description:* {{ .Annotations.description }}
          *Instance:* {{ .Labels.instance }}
          {{ end }}

    telegram_configs:
      # ✈️ Telegram
      - api_url: 'https://api.telegram.org'
        bot_token: 'YOUR_BOT_TOKEN'
        chat_id: YOUR_CHAT_ID
        send_resolved: true
        message: |
          {{ .GroupLabels.alertname }} - {{ .Status }}
          {{ range .Alerts }}
          Summary: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          {{ end }}
```

---

## 🔔 Alert Rules

| Alert | Expression | Duration | Severity | Description |
|-------|-----------|----------|----------|-------------|
| **InstanceDown** | `up == 0` | 1m | 🔴 Critical | Target is unreachable |
| **HighCPUUsage** | `100 - avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100 > 80` | 2m | 🟡 Warning | CPU usage above 80% |
| **HighMemoryUsage** | `(1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100 > 85` | 2m | 🔴 Critical | Memory usage above 85% |
| **SpringAppDown** | `up{job="spring-app"} == 0` | 1m | 🔴 Critical | Spring Boot application down |
| **PythonAppDown** | `up{job="python-app"} == 0` | 1m | 🔴 Critical | Flask application down |
| **HighRequestRate** | `rate(app_requests_total[5m]) > 10` | 2m | 🟡 Warning | Request rate exceeds 10/sec |

---

## 🧪 Testing Alerts

### Trigger an Alert

```bash
# Stop Spring Boot app → triggers InstanceDown + SpringAppDown
docker stop spring-app

# Wait 90 seconds for alert to fire
sleep 90

# Check alert status in Prometheus
curl -s http://localhost:9090/api/v1/alerts | jq

# Check notifications in Mailpit
curl -s http://localhost:8025/api/v1/messages | jq

# Restore service
docker start spring-app
```

### Send Test Alert Directly

```bash
curl -X POST http://localhost:9093/api/v1/alerts   -H "Content-Type: application/json"   -d '[{
    "labels": {
      "alertname": "TestAlert",
      "severity": "critical",
      "instance": "test-server"
    },
    "annotations": {
      "summary": "This is a test alert",
      "description": "Testing all notification channels"
    },
    "startsAt": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }]'
```

### Stress Test CPU Alert

```bash
# Install stress tool
sudo dnf install -y stress

# Run CPU stress for 3 minutes
stress --cpu 8 --timeout 180
```

---

## 📊 Application Instrumentation

### ☕ Spring Boot

**Dependencies (`pom.xml`):**

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    <dependency>
        <groupId>io.micrometer</groupId>
        <artifactId>micrometer-registry-prometheus</artifactId>
    </dependency>
</dependencies>
```

**Config (`application.properties`):**

```properties
server.port=6666

management.endpoints.web.exposure.include=health,info,prometheus,metrics
management.endpoint.prometheus.enabled=true
management.metrics.export.prometheus.enabled=true
management.metrics.tags.application=spring-prometheus-demo
```

**Custom Metrics Example:**

```java
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;

@RestController
public class HelloController {
    private final Counter requestCounter;

    public HelloController(MeterRegistry registry) {
        this.requestCounter = Counter.builder("http_requests_total")
            .description("Total HTTP requests")
            .register(registry);
    }

    @GetMapping("/hello")
    public String hello() {
        requestCounter.increment();
        return "Hello World!";
    }
}
```


## 📤 Pushgateway Usage

For batch jobs, cron jobs, or ephemeral services:

```bash
# Push a metric
echo "batch_job_duration_seconds 42.5" |   curl --data-binary @-   http://localhost:9091/metrics/job/my-batch-job/instance/server-01

# Push with multiple metrics
cat <<EOF | curl --data-binary @-   http://localhost:9091/metrics/job/backup/instance/db-server
# HELP backup_size_bytes Size of backup
# TYPE backup_size_bytes gauge
backup_size_bytes 1073741824
# HELP backup_duration_seconds Duration of backup
# TYPE backup_duration_seconds gauge
backup_duration_seconds 125.3
EOF

# Delete all metrics for a job
curl -X DELETE http://localhost:9091/metrics/job/my-batch-job
```

---

## 📈 Grafana Dashboards

**Default login:** `admin` / `changeme`

**Recommended dashboards to import:**

| Dashboard | ID | Source |
|-----------|-----|--------|
| Node Exporter Full | `1860` | [grafana.com](https://grafana.com/grafana/dashboards/1860) |
| JVM (Micrometer) | `4701` | [grafana.com](https://grafana.com/grafana/dashboards/4701) |
| Prometheus 2.0 Overview | `3662` | [grafana.com](https://grafana.com/grafana/dashboards/3662) |

**Import steps:**
1. Go to **Dashboards** → **Import**
2. Enter dashboard ID
3. Select **Prometheus** datasource
4. Click **Import**

---

## 🔧 Troubleshooting

### Prometheus Won't Start

```bash
# Check logs
docker logs prometheus --tail 50

# Validate config syntax
docker run --rm -v $(pwd)/prometheus:/etc/prometheus   prom/prometheus:v3.0.0   promtool check config /etc/prometheus/prometheus.yml

# Validate alert rules
docker run --rm -v $(pwd)/prometheus:/etc/prometheus   prom/prometheus:v3.0.0   promtool check rules /etc/prometheus/alert_rules.yml
```

### Alertmanager Not Sending Notifications

```bash
# Check Alertmanager logs
docker logs alertmanager --tail 50

# Test external connectivity from container
docker exec alertmanager sh -c "wget -qO- https://api.telegram.org"
docker exec alertmanager sh -c "wget -qO- https://hooks.slack.com"

# Test Telegram API directly
curl "https://api.telegram.org/bot<TOKEN>/getMe"

# Test Slack webhook
curl -X POST '<WEBHOOK_URL>'   -H 'Content-type: application/json'   -d '{"text":"Test from server"}'
```

### Apps Not Showing in Prometheus Targets

```bash
# Check if apps are running
docker ps | grep -E "spring-app|python-app"

# Test metrics endpoints
curl -s http://localhost:8081/actuator/prometheus | head
curl -s http://localhost:5000/metrics | head

# Check network connectivity
docker network inspect prometheus-stack_monitoring

# Verify targets in Prometheus UI
# http://your-server:9090/targets
```

### Gmail Authentication Failed

- Ensure you're using an **App Password**, not your regular Gmail password
- Enable [2-Step Verification](https://myaccount.google.com/signinoptions/two-step-verification) first
- If using Google Workspace, admin may need to allow "Less secure apps" (not recommended)

### Telegram Bot Not Responding

- Message your bot with `/start` before it can send you alerts
- Verify `chat_id` is correct (use [@userinfobot](https://t.me/userinfobot))
- For groups, `chat_id` is negative: `-1001234567890`

---

## 🛡️ Firewall Commands (RHEL/CentOS/Rocky)

```bash
# Open all required ports
sudo firewall-cmd --permanent --add-port=3000/tcp   # Grafana
sudo firewall-cmd --permanent --add-port=5000/tcp   # Python App
sudo firewall-cmd --permanent --add-port=8081/tcp   # Spring App
sudo firewall-cmd --permanent --add-port=9090/tcp   # Prometheus
sudo firewall-cmd --permanent --add-port=9091/tcp   # Pushgateway
sudo firewall-cmd --permanent --add-port=9093/tcp   # Alertmanager
sudo firewall-cmd --permanent --add-port=9100/tcp   # Node Exporter
sudo firewall-cmd --permanent --add-port=8025/tcp   # Mailpit
sudo firewall-cmd --reload

# Verify
sudo firewall-cmd --list-ports
```

---

