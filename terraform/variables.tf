variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-north-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "ecommerce"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["eu-north-1a", "eu-north-1b", "eu-north-1c"]
}

variable "private_subnets" {
  description = "Private subnet CIDRs"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnets" {
  description = "Public subnet CIDRs"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

variable "node_instance_types" {
  description = "EKS node instance types"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "node_desired_size" {
  description = "Desired number of nodes"
  type        = number
  default     = 2
}

variable "node_min_size" {
  description = "Minimum number of nodes"
  type        = number
  default     = 1
}

variable "node_max_size" {
  description = "Maximum number of nodes"
  type        = number
  default     = 4
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "ecommerce"
    Environment = "dev"
    ManagedBy   = "terraform"
  }
}

# ============================================================
# ADD-ON VARIABLES
# ============================================================

variable "grafana_admin_password" {
  description = "Admin password for Grafana dashboard"
  type        = string
  default     = "changeme"
  sensitive   = true
}

variable "enable_grafana_ingress" {
  description = "Enable ALB ingress for Grafana persistent access"
  type        = bool
  default     = true
}

variable "grafana_ingress_host" {
  description = "Hostname for Grafana ALB ingress (e.g., grafana.yourdomain.com)"
  type        = string
  default     = ""
}

variable "grafana_alb_certificate_arn" {
  description = "ACM certificate ARN for Grafana ALB HTTPS listener. Required when enable_grafana_ingress=true."
  type        = string
  default     = ""
}

variable "grafana_allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access Grafana (restrict for security)"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "prometheus_retention_days" {
  description = "Data retention period for Prometheus in days"
  type        = number
  default     = 30
}