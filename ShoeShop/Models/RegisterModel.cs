using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;


namespace ShoeShop.Models
{
    public class RegisterModel
    {
        [Key]
        public long ID { set; get; }

        [Display(Name = "Tên đăng nhập")]
        [Required(ErrorMessage = "Nhập tên đăng nhập")]

        public string UserName { set; get; }

        [Display(Name = "Mật khẩu")]
        [StringLength(20, MinimumLength = 6, ErrorMessage = "Độ dài mật khẩu ít nhất 6 ký tự.")]
        [Required(ErrorMessage = "Nhập mật khẩu")]
        public string Password { set; get; }

        [Display(Name = "Xác nhận mật khẩu")]
        [Compare("Password", ErrorMessage = "Mật khẩu không đúng")]
        public string ConfirmPassword { set; get; }

        [Display(Name = "Họ tên")]
        
        public string Name { set; get; }

        [Display(Name = "Địa chỉ")]
        public string Address { set; get; }

        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        [Display(Name = "Email")]
        public string Email { set; get; }

        [Display(Name = "Điện thoại")]
        public string Phone { set; get; }
        //[Key]
        //public long ID { get; set; }

        //[Display(Name="Tên đăng nhập")]
        //[Required(ErrorMessage="Nhập tên đăng nhập")]
        //public string UserName { get; set; }

        //[Display(Name = "Mật khẩu")]
        //[StringLength(20, MinimumLength=6, ErrorMessage="Mật khẩu ít nhất 6 kí tự")]
        //[Required(ErrorMessage = "Nhập mật khẩu")]
        //public string Password { get; set; }

        //[Display(Name = "Xác nhận mật khẩu")]
        //[Compare ("Password", ErrorMessage= "Xác nhận mật khẩu không đúng")]
        //public string ConfirmPassword { get; set; }

        //[Display(Name = "Tên")]
        //[Required(ErrorMessage = "Nhập tên")]
        //public string Name { get; set; }

        //[Display(Name = "Địa chỉ")]
        //public string Address { get; set; }

        //[Required(ErrorMessage = "Email")]
        //public string Email { get; set; }

        //[Display(Name = "Điện thoại")]
        //public string Phone { get; set; }
    }
}