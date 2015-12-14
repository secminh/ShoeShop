using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using PagedList;
namespace Model.Dao
{
    public class ProductCategoryDao
    {
        ShoeShopDbContext db = null;
        public ProductCategoryDao()
        {
            db = new ShoeShopDbContext();
        }
        public long Insert(ProductCategory entity)
        {
            db.ProductCategories.Add(entity);
            db.SaveChanges();
            return entity.ID;
        }
        public List<ProductCategory> ListAll()
        {
            return db.ProductCategories.Where(x => x.Status == true).OrderBy(x => x.DisplayOrder).ToList();
        }
        public ProductCategory ViewDetail(long id)
        {
            return db.ProductCategories.Find(id);
        }
        public bool Update(ProductCategory entity)
        {
            try
            {
                var product = db.ProductCategories.Find(entity.ID);
                product.Name = entity.Name;
                product.MetaTitle = entity.MetaTitle;
                db.SaveChanges();
                return true;

            }
            catch (Exception ex)
            {
                return false;
            }
        }
        public IEnumerable<ProductCategory> ListAllPaging(int page, int pageSize)
        {
            return db.ProductCategories.OrderByDescending(x => x.CreatedDate).ToPagedList(page, pageSize);
        }
        public bool Detele(int id)
        {
            try
            {
                var product = db.ProductCategories.Find(id);
                db.ProductCategories.Remove(product);
                db.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                return false;
            }

        }
    }
}
