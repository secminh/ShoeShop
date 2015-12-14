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
        public ActionResult Index()
        {
            return View();
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
                    SetAlert("Thêm sản phẩm thành công", "success");
                    return RedirectToAction("Create", "ProductCategory");
                }
                else
                {
                    ModelState.AddModelError("", "Thêm sản phẩm thất bại");
                }
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

                    return RedirectToAction("Index", "ProductCategory");
                    SetAlert("Cập nhật sản phẩm thành công", "success");
                }
                else
                {
                    ModelState.AddModelError("", " Cập nhật sản phẩm thất bại");
                }
            }
            return View("Index");

        }

	}
}