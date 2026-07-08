# 📈 Monitoring Guide

## Overview

A production platform is incomplete without observability. This project includes a complete monitoring stack based on the Prometheus ecosystem, enabling real-time metrics collection, visualization, and alerting.

The monitoring solution consists of:

- Prometheus
- Grafana
- Alertmanager
- Node Exporter
- kube-state-metrics

Together these tools provide visibility into the Kubernetes cluster, workloads, infrastructure, and application health.

---

# Monitoring Architecture

```
                 Kubernetes Cluster
                         │
     ┌───────────────────┼───────────────────┐
     │                   │                   │
     ▼                   ▼                   ▼
Node Exporter     kube-state-metrics     Application Pods
     │                   │                   │
     └───────────────────┼───────────────────┘
                         ▼
                   Prometheus Server
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
      Alertmanager               Grafana
            │                         │
            ▼                         ▼
      Notifications            Dashboards
```

---

# Components

## Prometheus

Prometheus collects metrics from:

- Kubernetes Nodes
- Pods
- Deployments
- Services
- Node Exporter
- kube-state-metrics

Responsibilities:

- Metrics scraping
- Time-series storage
- PromQL querying
- Alert evaluation

---

## Grafana

Grafana provides dashboards for:

- CPU usage
- Memory usage
- Network traffic
- Pod health
- Node status
- Kubernetes resources

Benefits:

- Interactive dashboards
- Multiple visualization types
- Custom dashboards
- Alert visualization

---

## Alertmanager

Alertmanager receives alerts from Prometheus.

Responsibilities:

- Alert grouping
- Deduplication
- Silencing
- Notification routing

Future integrations:

- Email
- Slack
- Microsoft Teams
- PagerDuty

---

## Node Exporter

Node Exporter exposes operating system metrics.

Examples:

- CPU utilization
- RAM usage
- Disk usage
- Network statistics
- Filesystem metrics

---

## kube-state-metrics

Provides Kubernetes object metrics.

Examples:

- Deployments
- ReplicaSets
- Pods
- StatefulSets
- DaemonSets
- Nodes
- Namespaces

---

# Deployment

Monitoring is deployed using the Prometheus Community Helm Chart.

```bash
helm install kube-prometheus-stack \
prometheus-community/kube-prometheus-stack \
-n monitoring \
--create-namespace
```

---

# Access

## Grafana

Default credentials:

Username

```
admin
```

Retrieve password:

```bash
kubectl get secret kube-prometheus-stack-grafana \
-n monitoring \
-o jsonpath="{.data.admin-password}" | base64 -d
```

---

## Prometheus

```bash
kubectl port-forward svc/kube-prometheus-stack-prometheus \
9090:9090 \
-n monitoring
```

---

## Alertmanager

```bash
kubectl port-forward svc/kube-prometheus-stack-alertmanager \
9093:9093 \
-n monitoring
```

---

# Metrics Collected

Infrastructure Metrics

- CPU
- Memory
- Disk
- Network

Kubernetes Metrics

- Pod status
- Deployments
- Replica count
- Restarts
- Namespace health

Application Metrics

- Pod availability
- Container status
- Resource consumption

---

# Dashboards

Recommended dashboards include:

- Kubernetes Cluster
- Node Exporter Full
- Kubernetes Pods
- Kubernetes Deployments
- Resource Usage
- Namespace Overview

---

# Future Improvements

- Loki
- Promtail
- Tempo
- OpenTelemetry
- Jaeger
- Distributed Tracing
- Custom Application Metrics
- Business Metrics
- SLO Monitoring
- Email Alerts
- Slack Alerts
