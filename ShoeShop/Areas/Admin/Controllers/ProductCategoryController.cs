using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Model.Dao;
using ShoeShop.Common;

namespace ShoeShop.Areas.Admin.Controllers
{
    public class ProductCategoryController : BaseController
    {
        //
        // GET: /Admin/ProductCategory/
        public ActionResult Index(int page = 1, int pageSize = 5)
        {
            var dao = new ProductCategoryDao();
            var model = dao.ListAllPaging(page, pageSize);

            return View(model);
        }
        [HttpGet]
        public ActionResult Create()
        {
            return View();
        }
        [HttpPost]
        public ActionResult Create(ProductCategory productcate)
        {
            if (ModelState.IsValid)
            {
                var dao = new ProductCategoryDao();
                long id = dao.Insert(productcate);
                if (id > 0)
                {
                    SetAlert("Thêm danh mục thành công", "success");
                    return RedirectToAction("Index", "ProductCategory");
                }
            }
            else
            {
                ModelState.AddModelError("", "Thêm danh mục thất bại");
            }
            return View("Create");
        }
        public ActionResult Edit(int id)
        {
            var cate = new ProductCategoryDao().ViewDetail(id);
            return View(cate);
        }
        [HttpPost]
        public ActionResult Edit(ProductCategory product)
        {
            if (ModelState.IsValid)
            {
                var dao = new ProductCategoryDao();
                var result = dao.Update(product);
                if (result)
                {
                    SetAlert("Cập nhật danh mục thành công", "success");
                    return RedirectToAction("Index", "ProductCategory");
                    
                }
                else
                {
                    ModelState.AddModelError("", " Cập nhật sản phẩm thất bại");
                }
            }
            return View("Index");

        }
        [HttpDelete]
        public ActionResult Delete(int id)
        {
            new ProductCategoryDao().Detele(id);

            return RedirectToAction("Index");
        }

	}
}