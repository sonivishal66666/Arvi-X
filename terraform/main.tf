terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Configured for a remote S3 backend with state locking via DynamoDB
  # backend "s3" {
  #   bucket         = "arvis-x-terraform-state-prod"
  #   key            = "state/terraform.tfstate"
  #   region         = "ap-south-1"
  #   dynamodb_table = "arvis-x-tflocks"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Arvis X"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}
