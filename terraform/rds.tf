resource "aws_db_subnet_group" "db_subnet_group" {
  name        = "${var.environment}-db-subnet-group"
  subnet_ids  = aws_subnet.database[*].id
  description = "RDS Database Subnet Group"

  tags = {
    Name = "${var.environment}-db-subnet-group"
  }
}

resource "aws_security_group" "db_sg" {
  name        = "${var.environment}-database-sg"
  description = "Allow inbound PostgreSQL traffic from private app subnets"
  vpc_id      = aws_vpc.main.id

  # Ingress rule: Allow port 5432 only from VPC internal app subnets
  ingress {
    description = "PostgreSQL access from internal subnets"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = concat(var.private_subnets, var.public_subnets)
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name = "${var.environment}-database-sg"
  }
}

resource "aws_db_instance" "postgres" {
  identifier             = "${var.environment}-postgres-db"
  allocated_storage      = 20
  max_allocated_storage  = 100
  engine                 = "postgres"
  engine_version         = "16.1"
  instance_class         = "db.t4g.micro"
  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  skip_final_snapshot    = true
  
  # Production configurations
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"
  deletion_protection     = false # For demo, set true for real prod
  storage_encrypted       = true
  multi_az                = false # Set true for HA production environments

  tags = {
    Name = "${var.environment}-postgres-db"
  }
}
