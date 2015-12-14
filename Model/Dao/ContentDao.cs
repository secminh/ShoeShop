using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.Dao
{
    public class ContentDao
    {
        ShoeShopDbContext db = null; 
        public ContentDao()
        {
            db = new ShoeShopDbContext();
        }
        public Content GetByID(long id)
        {
            return db.Contents.Find(id);
        }

    }
}
