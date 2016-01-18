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
            return new List<Item>
            {
                new Item { Id = 0, Name = "Item 1"},
                new Item { Id = 1, Name = "Item 2"},
                new Item { Id = 2, Name = "Item 3"}
            };
        }
    }
}