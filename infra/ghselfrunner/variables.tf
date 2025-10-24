# variable "github_token"          {
#   type = string
#   sensitive = true
# }

variable "github_config_url"     { type = string }
variable "runner_scale_set_name" {
  type = string
  default = "aks-runners"
}

variable "min_runners"           {
  type = number
  default = 0
}

variable "max_runners"           {
  type = number
  default = 5
}
variable "github_app_id"             {
  type = string
  sensitive = true
}
variable "github_app_installation_id"{
  type = string
  sensitive = true
}

variable "github_app_private_key"    {
  type = string
  sensitive = true
}