using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Model.EF;

namespace ShoeShop.Models
{
    [Serializable]
    public class CartItem
    {
        public Product Product { get; set; }
        public int Quantity { get; set; }
    }
}