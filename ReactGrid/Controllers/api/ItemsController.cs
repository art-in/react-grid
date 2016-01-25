using ReactGrid.Models;
using System.Collections.Generic;
using System.Web.Http;

namespace ReactGrid.Controllers.api
{
    public class ItemsController : ApiController
    {
        [Route("api/items")]
        public List<Item> Get()
        {
            var items = new List<Item>();

            for (var i = 17; i != 0; i--) {
                items.Add(new Item()
                {
                    Id = i,
                    Name = "Item " + i,
                    Type = (ItemType)(i % 3)
                });
            }

            return items;
        }
    }
}