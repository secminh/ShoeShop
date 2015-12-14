﻿using System;
using System.Collections.Generic;
using System.Linq;
using Model.Dao;
using Model.EF;
using ShoeShop.Common;
using System.Web;
using System.Web.Mvc;
using PagedList.Mvc;

namespace ShoeShop.Areas.Admin.Controllers
{
    public class ProductController : BaseController
    {
        //
        // GET: /Admin/Product/
        public ActionResult Index(int page =1, int pageSize = 5)
        {
            var dao = new ProductDao();
            var model = dao.ListAllPaging(page, pageSize);
            
            return View(model);
        }
        public void SetViewBag(long? selectedId = null)
        {
            var dao = new ProductDao();
            ViewBag.CategoryID = new SelectList(dao.ListAll(), "ID", "Name", selectedId);
        }
        [HttpGet]
        public ActionResult Create()
        {
            SetViewBag();
            return View();
        }
        [HttpPost]
        public ActionResult Create(Product product)
        {
            if (ModelState.IsValid)
            {
                var dao = new ProductDao();
                long id = dao.Insert(product);
                if (id > 0)
                {
                    SetAlert("Thêm sản phẩm thành công", "success");
                    return RedirectToAction("Create", "Product");
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
            var product = new ProductDao().ViewDetail(id);
            return View(product);
        }
        [HttpPost]
        public ActionResult Edit(Product product)
        {
            if (ModelState.IsValid)
            {
                var dao = new ProductDao();
                var result = dao.Update(product);
                if (result)
                {
                    
                    return RedirectToAction("Index", "Product");
                    SetAlert("Cập nhật sản phẩm thành công", "success");
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
            new ProductDao().Detele(id);

            return RedirectToAction("Index");
        }
    }
}