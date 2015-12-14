namespace Model.EF
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("Product")]
    public partial class Product
    {
        public long ID { get; set; }
        [Display (Name="Tên sản phẩm")]
        [StringLength(250)]
        public string Name { get; set; }
        [Display(Name = "Mã sản phẩm")]
        [StringLength(10)]
        public string Code { get; set; }
        [Display(Name = "Tên SEO")]
        [StringLength(250)]
        public string MetaTitle { get; set; }
        [Display(Name = "Mô tả")]
        [StringLength(500)]
        public string Description { get; set; }
        [Display(Name = "Hình")]
        [StringLength(250)]
        public string Image { get; set; }

        [Column(TypeName = "xml")]
        public string MoreImages { get; set; }
        [Display(Name = "Giá")]
        public decimal? Price { get; set; }

        public decimal? PromotionPrice { get; set; }

        public bool? IncludedVAT { get; set; }
        [Display(Name = "Số lượng")]
        public int Quantity { get; set; }
        [Display(Name = "Danh mục")]
        public long? CategoryID { get; set; }
        [Display(Name = "Chi tiết")]
        [Column(TypeName = "ntext")]
        public string Detail { get; set; }

        public int? Warranty { get; set; }

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
        public bool Status { get; set; }
        [Display(Name = "Hàng HOT")]
        public DateTime? TopHop { get; set; }

        public int? ViewCount { get; set; }
    }
}
