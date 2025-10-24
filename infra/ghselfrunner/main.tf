
resource "kubernetes_namespace_v1" "arc" {
  metadata { name = "actions-runner-system" }
}


resource "kubernetes_secret_v1" "github_pat" {
  metadata {
    name      = "github-token"
    namespace = kubernetes_namespace_v1.arc.metadata[0].name
  }
  type = "Opaque"
  data = {
    github_token = base64encode(var.github_token)
  }
}

resource "helm_release" "arc_controller" {
  name       = "gha-runner-scale-set-controller"
  repository = "oci://ghcr.io/actions/actions-runner-controller-charts"
  chart      = "gha-runner-scale-set-controller"
  version    = "0.9.2"
  namespace  = kubernetes_namespace_v1.arc.metadata[0].name
  create_namespace = false
}

resource "helm_release" "runner_set" {
  name       = "gha-runner-scale-set"
  repository = "oci://ghcr.io/actions/actions-runner-controller-charts"
  chart      = "gha-runner-scale-set"
  version    = "0.9.2"
  namespace  = kubernetes_namespace_v1.arc.metadata[0].name
  depends_on = [helm_release.arc_controller, kubernetes_secret_v1.github_pat]

  values = [yamlencode({
    githubConfigUrl    = var.github_config_url

    githubConfigSecret = kubernetes_secret_v1.github_pat.metadata[0].name

    runnerScaleSetName = var.runner_scale_set_name
    labels             = ["self-hosted","aks", var.runner_scale_set_name]
    minRunners         = var.min_runners
    maxRunners         = var.max_runners
    ephemeral          = true

    template = {
      spec = {
        containers = [{
          name = "runner"
          resources = {
            requests = { cpu = "200m", memory = "512Mi" }
            limits   = { cpu = "1",    memory = "2Gi" }
          }
        }]
      }
    }

    dind = { enabled = true }
  })]
}