variable "location"     {
  type = string
  default = "westeurope"
}

variable "name_prefix"  {
  type = string
  default = "p4hackathon"
}

variable "tags"         {
  type = map(string)
  default = { env = "dev"}
}

variable "sys_size"     {
  type = string
  default = "Standard_B2ms"
}

variable "sys_min"      {
  type = number
  default = 1
}

variable "sys_max"      {
  type = number
  default = 1
}

variable "user_size"    {
  type = string
  default = "Standard_A2_v2"
}

variable "user_min"     {
  type = number
  default = 1
}

variable "user_max"     {
  type = number
  default = 1
}
