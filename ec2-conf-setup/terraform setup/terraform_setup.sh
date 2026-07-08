# Update package list and install prerequisites
sudo apt update
sudo apt install -y gnupg software-properties-common curl

# Download and add HashiCorp's GPG key
wget -O- https://apt.releases.hashicorp.com/gpg | \
    gpg --dearmor | \
    sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg > /dev/null

# Verify the key fingerprint (optional but recommended)
gpg --no-default-keyring \
    --keyring /usr/share/keyrings/hashicorp-archive-keyring.gpg \
    --fingerprint

# Add the HashiCorp repository
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] \
    https://apt.releases.hashicorp.com $(lsb_release -cs) main" | \
    sudo tee /etc/apt/sources.list.d/hashicorp.list

# Update and install Terraform
sudo apt update
sudo apt install -y terraform

# Verify installation
terraform version
# Install AWS CLI
sudo apt install -y awscli

# Configure credentials (you'll be prompted for Access Key, Secret Key, region, and output format)
#aws configure

terraform -install-autocomplete
source ~/.bashrc
