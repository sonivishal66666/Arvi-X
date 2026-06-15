resource "aws_iam_role" "lambda_exec" {
  name = "${var.environment}-lambda-exec-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Attach basic execution & VPC access policies
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_exec.name
}

resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
  role       = aws_iam_role.lambda_exec.name
}

resource "aws_security_group" "lambda_sg" {
  name        = "${var.environment}-lambda-sg"
  description = "Security group for AWS Lambda function"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name = "${var.environment}-lambda-sg"
  }
}

# Lambda function placeholder (actual zip code uploaded via Serverless framework or CI/CD)
resource "aws_lambda_function" "api" {
  filename      = "${path.module}/placeholder.zip" # local placeholder for terraform run
  function_name = "${var.environment}-arvis-api"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "dist/lambda.handler"
  runtime       = "nodejs20.x"
  memory_size   = 1024
  timeout       = 29

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda_sg.id]
  }

  environment {
    variables = {
      NODE_ENV     = var.environment
      DATABASE_URL = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.postgres.endpoint}/${var.db_name}"
      JWT_SECRET   = "arvis-x-production-secret-key-2026"
    }
  }

  lifecycle {
    ignore_changes = [
      filename, // Managed by Serverless deploy / CI/CD pipeline
      source_code_hash,
      last_modified
    ]
  }
}

# API Gateway (HTTP API)
resource "aws_apigatewayv2_api" "http_api" {
  name          = "${var.environment}-arvis-http-api"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    allow_headers = ["content-type", "authorization", "x-requested-with"]
    max_age       = 300
  }
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id           = aws_apigatewayv2_api.http_api.id
  integration_type = "AWS_PROXY"

  connection_type      = "INTERNET"
  description          = "HTTP API integration with Lambda"
  integration_method   = "POST"
  integration_uri      = aws_lambda_function.api.arn
  payload_format_version = "2.0"
}

# Proxy route to direct all requests to the Lambda
resource "aws_apigatewayv2_route" "default_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_stage" "default_stage" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true
}

# Permission for API Gateway to invoke the Lambda
resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}

# Generate a small dummy file so terraform init/plan succeeds on placeholder
resource "local_file" "placeholder" {
  content  = "Placeholder for serverless deploy"
  filename = "${path.module}/placeholder.zip"
}
