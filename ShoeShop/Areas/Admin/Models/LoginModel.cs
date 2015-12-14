using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace ShoeShop.Areas.Admin.Models
{
    public class LoginModel
    {
        [Required(ErrorMessage="Nhập UserName")]
        public String UserName { get; set; }
        [Required(ErrorMessage = "Nhập Password")]
        public String Password { get; set; }
        public bool RememberMe { get; set; }
    }
}