using Model.Dao;
using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace ShoeShop.Controllers
{
    public class ContactController : Controller
    {
        //
        // GET: /Contact/
        public ActionResult Index()
        {
            var model = new ContactDao().GetActiveContact();
            return View(model);
        }
        [HttpPost]
        public JsonResult Send(string name, string mobile,string email, string address, string content)
        {
            var feedback = new Feedback();
            feedback.Name = name;
            feedback.Email = email;
            feedback.CreatedDate = DateTime.Now;
            feedback.Phone = mobile;
            feedback.Content = content;
            feedback.Adress = address;
            var id = new ContactDao().InsertFeedBack(feedback);
            if(id>0)
                return Json(new
                {
                    status =true
                });
            else
                return Json(new
                {
                    status = false
                });
        }
	}
}