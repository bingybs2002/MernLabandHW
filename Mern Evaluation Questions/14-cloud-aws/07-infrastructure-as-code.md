# Infrastructure as Code

### 1. What are Terraform and CloudFormation, and how do they compare?

Both are infrastructure-as-code tools that describe cloud resources declaratively in version-controlled files and create, update, or destroy them repeatably. Terraform (HashiCorp, or the OpenTofu fork) uses HCL, is cloud-agnostic with a huge provider ecosystem (AWS, Azure, GCP, Cloudflare, GitHub), shows changes with terraform plan, and keeps a state file you must store and lock securely (for example S3 with locking). CloudFormation is AWS-native, uses YAML or JSON templates organized into stacks, manages state for you, supports automatic rollback, and integrates deeply with AWS services, but only manages AWS. I choose Terraform for multi-cloud or third-party resources and CloudFormation (or AWS CDK, which generates it) for AWS-only teams that want native integration.
