using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace ShoeShop.Models
{
    public class LoginModel
    {
        [Key]
        [Display(Name="Tên đăng nhập")]
        [Required(ErrorMessage="Nhập tài khoản")]
        public string UserName { get; set; }
        [Display(Name = "Mật khẩu")]
        [Required(ErrorMessage = "Nhập mật khẩu")]
        public string Password { get; set; }
    }
}