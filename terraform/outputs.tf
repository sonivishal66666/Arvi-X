output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.main.id
}

output "database_endpoint" {
  description = "The connection endpoint for the RDS instance"
  value       = aws_db_instance.postgres.endpoint
}

output "api_gateway_url" {
  description = "URL of the API Gateway HTTP API"
  value       = aws_apigatewayv2_stage.default_stage.invoke_url
}

output "eks_cluster_endpoint" {
  description = "The endpoint for the EKS Kubernetes API server"
  value       = aws_eks_cluster.eks.endpoint
}

output "eks_cluster_name" {
  description = "The name of the EKS cluster"
  value       = aws_eks_cluster.eks.name
}
