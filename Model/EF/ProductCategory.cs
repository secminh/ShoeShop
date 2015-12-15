namespace Model.EF
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("ProductCategory")]
    public partial class ProductCategory
    {
        public long ID { get; set; }
        [Display (Name="Tên danh mục")]
        [Required(ErrorMessage = ("Nhập tên danh mục"))]
        [StringLength(250)]
        public string Name { get; set; }
        [Display(Name = "Tiêu đề SEO")]
        [Required(ErrorMessage = ("Nhập tên SEO"))]
        [StringLength(250)]
        public string MetaTitle { get; set; }
        [Display(Name = "Danh mục gốc")]
        public long? ParentID { get; set; }
        [Display(Name = "Thứ tự hiện thị")]
        public int? DisplayOrder { get; set; }

        [StringLength(250)]
        public string SeoTitle { get; set; }

        public DateTime? CreatedDate { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? ModifiedDate { get; set; }

        [StringLength(50)]
        public string ModifiedBy { get; set; }

        [StringLength(250)]
        public string MetaKeywords { get; set; }

        [StringLength(250)]
        public string MetaDescriptions { get; set; }
        [Display(Name = "Trạng thái")]
        public bool? Status { get; set; }

        public bool? ShowOnHome { get; set; }
    }
}
