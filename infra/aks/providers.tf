terraform {
  required_version = ">= 1.7"
  required_providers {
    azurerm = { source = "hashicorp/azurerm", version = ">= 4.0.0" }
  }
}

provider "azurerm" {
  features {}
  subscription_id = "8637c5a4-e0ec-4440-bef6-757a0d43598f"
}
