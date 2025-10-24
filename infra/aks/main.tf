resource "azurerm_resource_group" "rg" {
  name     = var.name_prefix
  location = var.location
  tags     = var.tags
}

resource "azurerm_kubernetes_cluster" "aks" {
  name                = "${var.name_prefix}-aks"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "${var.name_prefix}-dns"

  role_based_access_control_enabled = true
  local_account_disabled            = false
  identity { type = "SystemAssigned" }

  api_server_access_profile {
    authorized_ip_ranges = []
  }

  network_profile {
    network_plugin      = "azure"
    network_plugin_mode = "overlay"
    network_policy      = "azure"
    service_cidr        = "10.0.0.0/24"
    dns_service_ip      = "10.0.0.10"
    pod_cidr            = "10.244.0.0/16"
    outbound_type       = "loadBalancer"
  }

  default_node_pool {
    name                         = "p4hacksys"
    vm_size                      = var.sys_size
    auto_scaling_enabled         = true
    min_count                    = var.sys_min
    max_count                    = var.sys_max
    only_critical_addons_enabled = true
    type                         = "VirtualMachineScaleSets"
    zones                        = ["1"]
    os_sku                       = "Ubuntu"
    upgrade_settings { max_surge = "1" }
  }

  tags = var.tags
}

resource "azurerm_kubernetes_cluster_node_pool" "user" {
  name                  = "p4hack"
  kubernetes_cluster_id = azurerm_kubernetes_cluster.aks.id
  mode                  = "User"
  vm_size               = var.user_size
  auto_scaling_enabled  = true
  min_count             = var.user_min
  max_count             = var.user_max
  zones                 = ["1"]
  os_sku                = "Ubuntu"
  upgrade_settings { max_surge = "1" }
}

output "rg_name"          { value = azurerm_resource_group.rg.name }
output "aks_name"         { value = azurerm_kubernetes_cluster.aks.name }
output "aks_resource_group" { value = azurerm_kubernetes_cluster.aks.resource_group_name }
