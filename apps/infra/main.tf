terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "eu-north-1"
}

data "aws_vpc" "default" {
  default = true
}

resource "aws_security_group" "bmorozovcom" {
  name        = "bmorozovcom"
  description = "Security group for bmorozov.com"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "bmorozovcom"
  }
}

resource "aws_iam_role" "bmorozovcom" {
  name = "bmorozovcom"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [{
      Effect = "Allow"

      Principal = {
        Service = "ec2.amazonaws.com"
      }

      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecr_read" {
  role       = aws_iam_role.bmorozovcom.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.bmorozovcom.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "bmorozovcom" {
  name = "bmorozovcom"
  role = aws_iam_role.bmorozovcom.name
}

data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

resource "aws_instance" "bmorozovcom" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"

  vpc_security_group_ids = [
    aws_security_group.bmorozovcom.id
  ]

  iam_instance_profile = aws_iam_instance_profile.bmorozovcom.name

  root_block_device {
    volume_type = "gp3"
    volume_size = 8
  }

  tags = {
    Name = "bmorozovcom"
  }

  user_data = templatefile("${path.module}/cloud-init.sh.tftpl", {
    aws_region         = "eu-north-1"
    ecr_repository_url = aws_ecr_repository.bmorozovcom.repository_url
    ecr_registry       = split("/", aws_ecr_repository.bmorozovcom.repository_url)[0]
    caddyfile          = chomp(file("${path.module}/Caddyfile"))
  })

  user_data_replace_on_change = true

  lifecycle {
    # Either would otherwise replace the running server (downtime, new
    # instance ID): `data.aws_ami.ubuntu` resolves to the newest Ubuntu image
    # on every run, and user_data changes whenever the Caddyfile does. Both
    # apply only when the instance is created from scratch; the running server
    # gets Caddyfile changes from .github/workflows/deploy-caddy.yml.
    ignore_changes = [ami, user_data]
  }
}

resource "aws_ecr_repository" "bmorozovcom" {
  name                 = "personal/bmorozovcom"
  image_tag_mutability = "MUTABLE"
}

resource "aws_eip" "bmorozovcom" {
  domain = "vpc"

  tags = {
    Name = "bmorozovcom"
  }
}

resource "aws_eip_association" "bmorozovcom" {
  allocation_id = aws_eip.bmorozovcom.id
  instance_id   = aws_instance.bmorozovcom.id
}

resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = [
    "sts.amazonaws.com"
  ]
}

resource "aws_iam_role" "github_actions" {
  name = "bmorozovcom-github-actions"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [{
      Effect = "Allow"

      Principal = {
        Federated = aws_iam_openid_connect_provider.github.arn
      }

      Action = "sts:AssumeRoleWithWebIdentity"

      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }

        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:kolarus@21310184/project-ucp@1374627645:*"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy" "github_actions_ecr" {
  name = "ecr-push"
  role = aws_iam_role.github_actions.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Action = [
          "ecr:GetAuthorizationToken"
        ]

        Resource = "*"
      },
      {
        Effect = "Allow"

        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:PutImage"
        ]

        Resource = aws_ecr_repository.bmorozovcom.arn
      }
    ]
  })
}

output "github_actions_role_arn" {
  value = aws_iam_role.github_actions.arn
}

resource "aws_iam_role_policy" "github_actions_deploy" {
  name = "ec2-deploy"
  role = aws_iam_role.github_actions.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Action = [
          "ec2:DescribeInstances"
        ]

        Resource = "*"
      },
      {
        Effect = "Allow"

        Action = [
          "ssm:SendCommand"
        ]

        Resource = [
          aws_instance.bmorozovcom.arn,
          "arn:aws:ssm:eu-north-1::document/AWS-RunShellScript"
        ]
      },
      {
        Effect = "Allow"

        Action = [
          "ssm:GetCommandInvocation"
        ]

        Resource = "*"
      }
    ]
  })
}

resource "aws_ecr_lifecycle_policy" "bmorozovcom" {
  repository = aws_ecr_repository.bmorozovcom.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep only the latest 10 commit images"

        selection = {
          tagStatus     = "tagged"
          tagPatternList = ["*"]
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }

        action = {
          type = "expire"
        }
      }
    ]
  })
}
# --------------------------------------------------
# Amplitude secret handoff
# --------------------------------------------------
#
# The secret key behind the site's stats page is managed as a GitHub Actions
# secret. On each deploy the workflow writes it to this Parameter Store entry
# (encrypted), and the instance reads it when starting the container — so the
# value never appears in the SSM command sent to the instance. The entry is
# created by the workflow, not here, so its value never enters Terraform state.

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

locals {
  amplitude_secret_parameter_arn = "arn:aws:ssm:${data.aws_region.current.region}:${data.aws_caller_identity.current.account_id}:parameter/bmorozovcom/amplitude-secret-key"
}

# SecureStrings on the AWS-managed aws/ssm key need no separate KMS grants:
# that key allows use through Parameter Store to principals in this account.

resource "aws_iam_role_policy" "github_actions_amplitude_secret" {
  name = "write-amplitude-secret"
  role = aws_iam_role.github_actions.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [{
      Effect   = "Allow"
      Action   = ["ssm:PutParameter"]
      Resource = local.amplitude_secret_parameter_arn
    }]
  })
}

resource "aws_iam_role_policy" "read_amplitude_secret" {
  name = "read-amplitude-secret"
  role = aws_iam_role.bmorozovcom.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [{
      Effect   = "Allow"
      Action   = ["ssm:GetParameter"]
      Resource = local.amplitude_secret_parameter_arn
    }]
  })
}
