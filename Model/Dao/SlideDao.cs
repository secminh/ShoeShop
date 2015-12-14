
using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.Dao
{
    public class SlideDao
    {
        ShoeShopDbContext db = null;
        public SlideDao()
        {
            db = new ShoeShopDbContext();
        }
        //public List<Slide> ListAll()
        //{
        //    return db.Slides.Where(x => x.Status == true).OrderBy(y => y.DisplayOrder).ToList();
        //}

    }
}
