variable "aks_resource_group" {
  type = string
  default = "p4hackathon"
}

variable "aks_name"           {
  type = string
  default = "p4hackathon-aks"
}


variable "host"               {
  type = string
  default = "<URL>"
}


variable "tls_secret_name"    {
  type = string
  default = "argocd-server-tls"
}

