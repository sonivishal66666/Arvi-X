variable "aws_region" {
  description = "AWS deployment region"
  type        = string
  default     = "ap-south-1"
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "Base CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnets" {
  description = "List of public subnet CIDRs"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnets" {
  description = "List of private subnet CIDRs"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "database_subnets" {
  description = "List of database private subnet CIDRs"
  type        = list(string)
  default     = ["10.0.20.0/24", "10.0.21.0/24"]
}

variable "db_name" {
  description = "Name of the RDS PostgreSQL database"
  type        = string
  default     = "arvis_x_prod"
}

variable "db_username" {
  description = "Username for RDS instance administrator"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "Password for RDS instance administrator"
  type        = string
  sensitive   = true
  default     = "SuperSecurePassword123!"
}

variable "eks_cluster_name" {
  description = "Name of the Elastic Kubernetes Service cluster"
  type        = string
  default     = "arvis-x-eks-cluster"
}
