data "azurerm_kubernetes_cluster" "aks" {
  name                = var.aks_name
  resource_group_name = var.aks_resource_group
}

provider "kubernetes" {
  host                   = data.azurerm_kubernetes_cluster.aks.kube_config[0].host
  client_certificate     = base64decode(data.azurerm_kubernetes_cluster.aks.kube_config[0].client_certificate)
  client_key             = base64decode(data.azurerm_kubernetes_cluster.aks.kube_config[0].client_key)
  cluster_ca_certificate = base64decode(data.azurerm_kubernetes_cluster.aks.kube_config[0].cluster_ca_certificate)
}

provider "helm" {
  kubernetes = {
    host                   = data.azurerm_kubernetes_cluster.aks.kube_config[0].host
    client_certificate     = base64decode(data.azurerm_kubernetes_cluster.aks.kube_config[0].client_certificate)
    client_key             = base64decode(data.azurerm_kubernetes_cluster.aks.kube_config[0].client_key)
    cluster_ca_certificate = base64decode(data.azurerm_kubernetes_cluster.aks.kube_config[0].cluster_ca_certificate)
  }
}

resource "kubernetes_namespace_v1" "argocd" {
  metadata { name = "argocd" }
}

resource "kubernetes_secret_v1" "tls" {
  metadata {
    name      = var.tls_secret_name
    namespace = kubernetes_namespace_v1.argocd.metadata[0].name
  }
  type = "kubernetes.io/tls"
  data = {
    "tls.crt" = file("${path.module}/certs/fingerslide.pl.certificate.pem")
    "tls.key" = file("${path.module}/certs/fingerslide.pl.key.txt")
    }
}

resource "helm_release" "argocd" {
  name             = "argo-cd"
  repository       = "https://argoproj.github.io/argo-helm"
  chart            = "argo-cd"
  namespace        = kubernetes_namespace_v1.argocd.metadata[0].name
  create_namespace = false

  depends_on = [kubernetes_secret_v1.tls]

  values = [
    yamlencode({
      server = {
        service = { type = "ClusterIP" }
        ingress = {
          enabled          = true
          ingressClassName = "nginx"
          hosts            = [ var.host ]
          paths            = [ "/" ]
          tls = [{
            hosts      = [ var.host ]
            secretName = var.tls_secret_name
          }]
        }
      }
      configs = {
        params = {
          "server.insecure" = "true"
        }
      }
    })
  ]
}

output "argocd_url" {
  value = "https://${var.host}"
}